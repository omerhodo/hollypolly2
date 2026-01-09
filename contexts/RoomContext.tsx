'use client';

import { db } from '@/lib/firebase/client';
import type { Option, ResultData, Room, TeamData, User } from '@/types';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface RoomContextType {
  room: Room | null;
  users: User[];
  options: Option[];
  loading: boolean;
  initializeRoom: (roomId: string, title?: string) => Promise<void>;
  addOption: (roomId: string, text: string) => Promise<void>;
  deleteOption: (optionId: string) => Promise<void>;
  clearAllOptions: () => Promise<void>;
  makeAdmin: (userId: string) => Promise<void>;
  removeAdmin: (userId: string) => Promise<void>;
  selectResult: (type: 'winner' | 'loser') => Promise<void>;
  restartRoom: () => Promise<void>;
  updateRoomTitle: (roomId: string, title: string) => Promise<void>;
  cleanupInactiveUsers: () => Promise<void>;
  cleanupEmptyRoom: () => Promise<void>;
  createRandomTeams: (teamCount: number, options: Option[]) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
};

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  const initializeRoom = useCallback(async (roomId: string, title?: string) => {
    setLoading(true);
    // Get or create room
    const roomDoc = await getDoc(doc(db, 'rooms', roomId));

    if (!roomDoc.exists()) {
      // Create new room
      const newRoom: Room = {
        id: roomId,
        created_at: Timestamp.now(),
        last_activity: Timestamp.now(),
        result: null,
        ...(title && { title }),
      };
      await setDoc(doc(db, 'rooms', roomId), newRoom);
      setRoom(newRoom);
    } else {
      setRoom({ id: roomDoc.id, ...roomDoc.data() } as Room);
    }

    // Listen to room changes
    const unsubscribeRoom = onSnapshot(doc(db, 'rooms', roomId), (snapshot) => {
      if (snapshot.exists()) {
        setRoom({ id: snapshot.id, ...snapshot.data() } as Room);
      }
    });

    // Listen to users changes
    const unsubscribeUsers = onSnapshot(
      collection(db, 'rooms', roomId, 'users'),
      (snapshot) => {
        const usersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersList);
      }
    );

    // Listen to options changes
    const unsubscribeOptions = onSnapshot(
      collection(db, 'rooms', roomId, 'options'),
      (snapshot) => {
        const optionsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Option));
        setOptions(optionsList);
      }
    );

    setLoading(false);
  }, []);

  const addOption = useCallback(async (roomId: string, text: string) => {
    const optionId = uuidv4();
    const newOption: Option = {
      id: optionId,
      room_id: roomId,
      text,
      created_at: Timestamp.now(),
    };

    await setDoc(doc(db, 'rooms', roomId, 'options', optionId), newOption);
    // Use setDoc with merge to avoid "no document to update" error
    await setDoc(doc(db, 'rooms', roomId), { last_activity: Timestamp.now() }, { merge: true });
  }, []);

  const deleteOption = useCallback(async (optionId: string) => {
    if (!room) return;

    await deleteDoc(doc(db, 'rooms', room.id, 'options', optionId));
    await updateDoc(doc(db, 'rooms', room.id), { last_activity: Timestamp.now() });
  }, [room]);

  const clearAllOptions = useCallback(async () => {
    if (!room) return;

    try {
      const optionsSnapshot = await getDocs(collection(db, 'rooms', room.id, 'options'));

      // Delete all options
      const deletePromises = optionsSnapshot.docs.map(optionDoc =>
        deleteDoc(doc(db, 'rooms', room.id, 'options', optionDoc.id))
      );

      await Promise.all(deletePromises);
      await updateDoc(doc(db, 'rooms', room.id), { last_activity: Timestamp.now() });
    } catch (error) {
      console.error('Error clearing all options:', error);
    }
  }, [room]);

  const makeAdmin = useCallback(async (newAdminId: string) => {
    if (!room) return;

    try {
      // Just promote the selected user to admin, don't demote others
      const userRef = doc(db, 'rooms', room.id, 'users', newAdminId);
      await updateDoc(userRef, { is_admin: true });

      await updateDoc(doc(db, 'rooms', room.id), { last_activity: Timestamp.now() });
    } catch (error) {
      console.error('Error making admin:', error);
    }
  }, [room]);

  const removeAdmin = useCallback(async (userId: string) => {
    if (!room) return;

    try {
      // Remove admin status from the user
      const userRef = doc(db, 'rooms', room.id, 'users', userId);
      await updateDoc(userRef, { is_admin: false });

      await updateDoc(doc(db, 'rooms', room.id), { last_activity: Timestamp.now() });
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  }, [room]);

  const selectResult = useCallback(async (type: 'winner' | 'loser') => {
    if (!room || options.length === 0) return;

    const randomIndex = Math.floor(Math.random() * options.length);
    const selectedOption = options[randomIndex];

    const result: ResultData = {
      type,
      option_id: selectedOption.id,
    };

    await updateDoc(doc(db, 'rooms', room.id), {
      result,
      last_activity: Timestamp.now(),
    });
  }, [room, options]);

  const restartRoom = useCallback(async () => {
    if (!room) return;

    await updateDoc(doc(db, 'rooms', room.id), {
      result: null,
      teams: null,
      teamsCreatedCount: null,
      last_activity: Timestamp.now(),
    });
  }, [room]);

  const updateRoomTitle = useCallback(async (roomId: string, title: string) => {
    // Use setDoc with merge to avoid "no document to update" error
    await setDoc(doc(db, 'rooms', roomId), {
      title,
      last_activity: Timestamp.now(),
    }, { merge: true });
  }, []);

  const createRandomTeams = useCallback(async (teamCount: number, options: Option[]) => {
    if (!room || options.length < 2) return;

    // Shuffle options array
    const shuffled = [...options].sort(() => Math.random() - 0.5);

    // Create teams
    const teams: TeamData[] = [];
    for (let i = 0; i < teamCount; i++) {
      teams.push({ teamNumber: i + 1, members: [] });
    }

    // Distribute options to teams
    shuffled.forEach((option, index) => {
      const teamIndex = index % teamCount;
      teams[teamIndex].members.push(option.text);
    });

    // Increment the teams created count
    const currentCount = room.teamsCreatedCount || 0;

    // Save to Firebase
    await updateDoc(doc(db, 'rooms', room.id), {
      teams,
      teamsCreatedCount: currentCount + 1,
      last_activity: Timestamp.now(),
    });
  }, [room]);

  const cleanupInactiveUsers = useCallback(async () => {
    if (!room) return;

    try {
      const twoMinutesAgo = Timestamp.fromMillis(Date.now() - 2 * 60 * 1000);
      const usersSnapshot = await getDocs(collection(db, 'rooms', room.id, 'users'));

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as User;
        if (userData.last_seen && userData.last_seen.toMillis() < twoMinutesAgo.toMillis()) {
          await deleteDoc(doc(db, 'rooms', room.id, 'users', userDoc.id));
          console.log(`Cleaned up inactive user: ${userDoc.id}`);
        }
      }
    } catch (error) {
      console.error('Cleanup inactive users failed:', error);
    }
  }, [room]);

  const cleanupEmptyRoom = useCallback(async () => {
    if (!room) return;

    try {
      const usersSnapshot = await getDocs(collection(db, 'rooms', room.id, 'users'));

      if (usersSnapshot.empty) {
        // Delete all options first
        const optionsSnapshot = await getDocs(collection(db, 'rooms', room.id, 'options'));
        for (const optionDoc of optionsSnapshot.docs) {
          await deleteDoc(doc(db, 'rooms', room.id, 'options', optionDoc.id));
        }

        // Delete the room
        await deleteDoc(doc(db, 'rooms', room.id));
        console.log(`Cleaned up empty room: ${room.id}`);
      }
    } catch (error) {
      console.error('Cleanup empty room failed:', error);
    }
  }, [room]);

  // Periodic cleanup of inactive users (every 1 minute)
  useEffect(() => {
    if (!room) return;

    const cleanupInterval = setInterval(() => {
      cleanupInactiveUsers();
    }, 60000); // 1 minute

    return () => clearInterval(cleanupInterval);
  }, [room, cleanupInactiveUsers]);

  // Check if room is empty and cleanup when users leave
  useEffect(() => {
    if (!room || users.length > 0) return;

    const timer = setTimeout(() => {
      cleanupEmptyRoom();
    }, 5000); // Wait 5 seconds before deleting empty room

    return () => clearTimeout(timer);
  }, [room, users, cleanupEmptyRoom]);

  // Auto-assign admin if no admin exists
  useEffect(() => {
    if (!room || users.length === 0) return;

    const hasAdmin = users.some(user => user.is_admin);

    if (!hasAdmin) {
      // Select random user to be admin
      const randomIndex = Math.floor(Math.random() * users.length);
      const newAdmin = users[randomIndex];

      console.log(`No admin found, promoting user ${newAdmin.name} to admin`);
      makeAdmin(newAdmin.id).catch(err => console.error('Failed to auto-assign admin:', err));
    }
  }, [room, users, makeAdmin]);

  return (
    <RoomContext.Provider
      value={{
        room,
        users,
        options,
        loading,
        initializeRoom,
        addOption,
        deleteOption,
        clearAllOptions,
        makeAdmin,
        removeAdmin,
        selectResult,
        restartRoom,
        updateRoomTitle,
        cleanupInactiveUsers,
        cleanupEmptyRoom,
        createRandomTeams,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
