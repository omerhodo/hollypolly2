'use client';

import { OptionList } from '@/components/OptionList';
import { ResultModal } from '@/components/ResultModal';
import { RoomEntranceModal } from '@/components/RoomEntranceModal';
import { ShareButton } from '@/components/ShareButton';
import { UserList } from '@/components/UserList';
import { useRoom } from '@/contexts/RoomContext';
import { useUser } from '@/contexts/UserContext';
import { use, useEffect, useState } from 'react';

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;

  const { currentUser, initializeUser, updateUserName, updateHeartbeat, removeUser } = useUser();
  const {
    room,
    users,
    options,
    loading,
    initializeRoom,
    addOption,
    deleteOption,
    makeAdmin,
    selectResult,
    restartRoom,
    updateRoomTitle,
  } = useRoom();

  const [showEntranceModal, setShowEntranceModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [wasKicked, setWasKicked] = useState(false);

  // Check if user was kicked (currentUser exists in state but not in Firestore users list)
  useEffect(() => {
    if (currentUser && users.length > 0 && !loading) {
      const userExistsInRoom = users.some(u => u.id === currentUser.id);
      if (!userExistsInRoom) {
        setWasKicked(true);
      }
    }
  }, [currentUser, users, loading]);

  // Initialize room
  useEffect(() => {
    if (roomId && !isInitialized) {
      initializeRoom(roomId);
      setIsInitialized(true);
    }
  }, [roomId, initializeRoom, isInitialized]);

  // Auto-login from localStorage
  useEffect(() => {
    if (!loading && !currentUser && roomId) {
      const storedUser = localStorage.getItem('hollypolly_user');
      if (storedUser) {
        try {
          const localUser = JSON.parse(storedUser);
          // Only auto-login if the stored user is for THIS specific room
          if (localUser.room_id === roomId) {
            console.log('Auto-loading user from localStorage for this room');
            // initializeUser will check if user exists in Firestore
            // If not, it will create a new one (but this shouldn't happen normally)
            initializeUser(roomId, localUser.name, false, users.length + 1)
              .catch((error) => {
                console.error('Auto-login failed:', error);
                setShowEntranceModal(true);
              });
          } else {
            // Different room, show modal for new entry
            console.log('Stored user is for different room, showing modal');
            setShowEntranceModal(true);
          }
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('hollypolly_user');
          setShowEntranceModal(true);
        }
      } else {
        // No stored user, show modal
        setShowEntranceModal(true);
      }
    }
  }, [loading, currentUser, roomId, initializeUser, users.length]);

  // Handle user entrance
  const handleUserEnter = async (name: string, title?: string) => {
    try {
      console.log('Creating user:', { name, title, usersCount: users.length });
      const isFirstUser = users.length === 0;
      const userOrder = users.length + 1; // User order based on current count

      const user = await initializeUser(roomId, name, isFirstUser, userOrder);
      console.log('User created:', user);

      // Add user's name as an option automatically
      await addOption(roomId, name);
      console.log('User added as option:', name);

      // If first user and has title, update room title
      if (isFirstUser && title) {
        console.log('Updating room with title:', title);
        await updateRoomTitle(roomId, title);
      }

      console.log('User entrance successful, closing modal');
      setShowEntranceModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Kullanıcı oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
      throw error; // Re-throw to let modal handle loading state
    }
  };

  // Heartbeat system
  useEffect(() => {
    if (!currentUser) return;

    const heartbeatInterval = setInterval(() => {
      updateHeartbeat(currentUser.id, roomId);
    }, 30000); // 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [currentUser, roomId, updateHeartbeat]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show kicked message
  if (wasKicked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Odadan Atıldınız</h2>
          <p className="text-gray-600 mb-6">Admin tarafından bu odadan çıkarıldınız.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-600">🎲 HollyPolly</h1>
            <ShareButton roomId={roomId} />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users Column */}
            <div className="lg:col-span-1">
              <UserList
                users={users}
                currentUser={currentUser}
                roomId={roomId}
                onMakeAdmin={makeAdmin}
                onEditName={updateUserName}
                onKickUser={(userId) => removeUser(userId, roomId)}
              />
            </div>

            {/* Options Column */}
            <div className="lg:col-span-2">
              <OptionList
                options={options}
                users={users}
                currentUser={currentUser}
                roomTitle={room?.title}
                onAddOption={(text) => addOption(roomId, text)}
                onDeleteOption={deleteOption}
                onSelectWinner={() => selectResult('winner')}
                onSelectLoser={() => selectResult('loser')}
                onUpdateTitle={(title) => updateRoomTitle(roomId, title)}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <RoomEntranceModal
        isOpen={showEntranceModal}
        onSubmit={handleUserEnter}
        isFirstUser={users.length === 0}
        roomTitle={room?.title}
      />

      <ResultModal
        result={room?.result || null}
        options={options}
        onRestart={restartRoom}
        onShowResultInOptions={async () => {
          const selectedOption = options.find((opt) => opt.id === room?.result?.option_id);
          if (selectedOption) {
            await deleteOption(selectedOption.id);
          }
        }}
        isAdmin={currentUser?.is_admin || false}
      />
    </>
  );
}
