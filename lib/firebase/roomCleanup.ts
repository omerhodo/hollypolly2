import { db } from '@/lib/firebase/client';
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';

// ── Configuration ────────────────────────────────────────────────────
const MAX_ROOMS = 100; // Cleanup triggers when room count exceeds this
const ROOMS_TO_DELETE = 80; // Number of oldest rooms to delete when triggered
const BATCH_LIMIT = 500; // Firestore writeBatch limit

// ── Types ────────────────────────────────────────────────────────────
interface CleanupResult {
  triggered: boolean;
  deletedCount: number;
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Deletes all documents in a subcollection of a room.
 * Firestore does NOT cascade-delete subcollections, so we must do it manually.
 */
async function deleteSubcollection(roomId: string, subcollectionName: string): Promise<number> {
  const subRef = collection(db, 'rooms', roomId, subcollectionName);
  const snapshot = await getDocs(subRef);

  if (snapshot.empty) return 0;

  // Use batched writes for efficiency (max 500 ops per batch)
  let deletedCount = 0;
  let batch = writeBatch(db);
  let batchCount = 0;

  for (const docSnap of snapshot.docs) {
    batch.delete(doc(db, 'rooms', roomId, subcollectionName, docSnap.id));
    batchCount++;
    deletedCount++;

    if (batchCount >= BATCH_LIMIT) {
      await batch.commit();
      batch = writeBatch(db);
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return deletedCount;
}

/**
 * Fully deletes a room and all its subcollections (users, options).
 */
async function deleteRoomCompletely(roomId: string): Promise<void> {
  // 1. Delete subcollections first (order doesn't matter, run in parallel)
  await Promise.all([
    deleteSubcollection(roomId, 'users'),
    deleteSubcollection(roomId, 'options'),
  ]);

  // 2. Delete the room document itself
  await deleteDoc(doc(db, 'rooms', roomId));
}

// ── Main Cleanup Function ────────────────────────────────────────────

/**
 * Checks total room count and deletes the oldest rooms if the limit is exceeded.
 *
 * Strategy:
 *   - Uses getCountFromServer() for O(1) count without downloading documents
 *   - Fetches only the oldest N rooms sorted by created_at
 *   - Deletes subcollections before room documents (Firestore requirement)
 *   - Processes deletions with controlled concurrency to avoid rate limits
 *
 * This function is designed to be called fire-and-forget after room creation.
 * Failures are logged but never propagated to the caller.
 */
export async function cleanupOldRooms(): Promise<CleanupResult> {
  try {
    // 1. Efficient count using server-side aggregation (no document downloads)
    const roomsRef = collection(db, 'rooms');
    const countSnapshot = await getCountFromServer(roomsRef);
    const totalRooms = countSnapshot.data().count;

    if (totalRooms <= MAX_ROOMS) {
      return { triggered: false, deletedCount: 0 };
    }

    console.log(
      `[RoomCleanup] Room limit exceeded: ${totalRooms}/${MAX_ROOMS}. Deleting oldest ${ROOMS_TO_DELETE} rooms...`
    );

    // 2. Fetch the oldest rooms sorted by created_at ascending
    const oldRoomsQuery = query(
      roomsRef,
      orderBy('created_at', 'asc'),
      limit(ROOMS_TO_DELETE)
    );
    const oldRoomsSnapshot = await getDocs(oldRoomsQuery);

    if (oldRoomsSnapshot.empty) {
      return { triggered: true, deletedCount: 0 };
    }

    // 3. Delete rooms with controlled concurrency (5 at a time)
    const roomIds = oldRoomsSnapshot.docs.map((doc) => doc.id);
    const CONCURRENCY = 5;
    let deletedCount = 0;

    for (let i = 0; i < roomIds.length; i += CONCURRENCY) {
      const chunk = roomIds.slice(i, i + CONCURRENCY);
      await Promise.all(
        chunk.map(async (roomId) => {
          try {
            await deleteRoomCompletely(roomId);
            deletedCount++;
          } catch (err) {
            console.warn(`[RoomCleanup] Failed to delete room ${roomId}:`, err);
          }
        })
      );
    }

    console.log(
      `[RoomCleanup] Cleanup complete. Deleted ${deletedCount}/${ROOMS_TO_DELETE} rooms. Remaining: ~${totalRooms - deletedCount}`
    );

    return { triggered: true, deletedCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[RoomCleanup] Cleanup failed:', message);
    return { triggered: false, deletedCount: 0, error: message };
  }
}

/**
 * Fire-and-forget wrapper. Call this after room creation.
 * Never throws, never blocks the caller beyond the initial count check.
 */
export function triggerRoomCleanup(): void {
  cleanupOldRooms().catch((err) => {
    console.error('[RoomCleanup] Unhandled cleanup error:', err);
  });
}
