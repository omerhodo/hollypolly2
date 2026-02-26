'use client';

import { AdBannerSpacer } from '@/components/AdBannerSpacer';
import { InfoModal } from '@/components/InfoModal';
import { LeaveRoomModal } from '@/components/LeaveRoomModal';
import { OptionList } from '@/components/OptionList';
import { ResultModal } from '@/components/ResultModal';
import { RoomEntranceModal } from '@/components/RoomEntranceModal';
import { ShareButton } from '@/components/ShareButton';
import { SpinWheelModal } from '@/components/SpinWheelModal';
import { TeamResultModal } from '@/components/TeamResultModal';
import { UserList } from '@/components/UserList';
import { useRoom } from '@/contexts/RoomContext';
import { useUser } from '@/contexts/UserContext';
import { useBannerAd, useInterstitialAd } from '@/hooks/useCapacitor';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useRef, useState } from 'react';

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;

  const { currentUser, initializeUser, updateUserName, updateHeartbeat, removeUser, setCurrentUser } = useUser();
  const {
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
    createRandomTeams,
    openSpinWheel,
    closeSpinWheel,
    incrementSpinWheelCount,
    startSpinWheel,
    clearSpinWheelData,
  } = useRoom();

  const [showEntranceModal, setShowEntranceModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [wasKicked, setWasKicked] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const router = useRouter();
  const t = useTranslations('room');
  const { showInterstitialAd } = useInterstitialAd();

  // Unified action counter for interstitial ad throttling (every 3rd action)
  const actionCountRef = useRef(0);
  const pendingSpinAdRef = useRef(false);

  /** Increment unified counter. Returns true if ad should be shown. */
  const incrementAndCheckAd = useCallback(() => {
    actionCountRef.current += 1;
    return actionCountRef.current % 3 === 0;
  }, []);

  /** Show interstitial immediately (for winner/loser/teams). */
  const maybeShowAd = useCallback(() => {
    if (incrementAndCheckAd()) {
      showInterstitialAd().catch(() => {});
    }
  }, [incrementAndCheckAd, showInterstitialAd]);

  /** Mark that a spin-wheel ad is pending (shown 1s after winner reveal). */
  const markSpinAdPending = useCallback(() => {
    pendingSpinAdRef.current = incrementAndCheckAd();
  }, [incrementAndCheckAd]);

  /** Called when spin wheel winner is revealed — show ad after 1s delay. */
  const handleSpinComplete = useCallback(() => {
    if (pendingSpinAdRef.current) {
      pendingSpinAdRef.current = false;
      setTimeout(() => {
        showInterstitialAd().catch(() => {});
      }, 1000);
    }
  }, [showInterstitialAd]);

  // Show banner ad on room page
  useBannerAd(true);

  // Check if user was kicked (currentUser exists in state but not in Firestore users list)
  useEffect(() => {
    if (currentUser && users.length > 0 && !loading) {
      const userExistsInRoom = users.some(u => u.id === currentUser.id);
      if (!userExistsInRoom) {
        setWasKicked(true);
      }
    }
  }, [currentUser, users, loading]);

  // Sync currentUser admin status with Firestore
  useEffect(() => {
    if (!currentUser || users.length === 0) return;

    const firestoreUser = users.find(u => u.id === currentUser.id);
    if (firestoreUser && firestoreUser.is_admin !== currentUser.is_admin) {
      // Update currentUser state if admin status changed
      const updatedUser = { ...currentUser, is_admin: firestoreUser.is_admin };
      setCurrentUser(updatedUser);
      console.log(`Admin status updated for ${currentUser.name}: ${firestoreUser.is_admin}`);
    }
  }, [currentUser, users, setCurrentUser]);

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
      alert(t('createUserError'));
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

  // Handle random team creation
  const handleCreateRandomTeams = (teamCount: number) => {
    if (options.length < 2) return;
    createRandomTeams(teamCount, options);
  };

  // Handle leave room
  const handleLeaveRoom = () => {
    if (currentUser) {
      removeUser(currentUser.id, roomId);
    }
    localStorage.removeItem('hollypolly_user');
    router.push('/');
  };

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
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('kickedTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('kickedMessage')}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            {t('goHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[100dvh] flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm shrink-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="text-2xl font-bold text-primary-600 flex items-center gap-2 hover:text-primary-700 transition-colors cursor-pointer"
            >
              <img src="/icon-192.png" alt="HollyPolly" className="w-8 h-8" />
              HollyPolly
            </button>
            <div className="flex items-center gap-3">
              <ShareButton roomId={roomId} roomTitle={room?.title} />
              <button
                onClick={() => setShowInfoModal(true)}
                className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-full transition-colors"
                title={t('infoTooltip')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content – scrollable area */}
        <main className="flex-1 overflow-y-auto overscroll-none">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users Column */}
            <div className="lg:col-span-1">
              <UserList
                users={users}
                currentUser={currentUser}
                roomId={roomId}
                onMakeAdmin={makeAdmin}
                onRemoveAdmin={removeAdmin}
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
                onClearAllOptions={clearAllOptions}
                onSelectWinner={() => {
                  selectResult('winner');
                  maybeShowAd();
                }}
                onSelectLoser={() => {
                  selectResult('loser');
                  maybeShowAd();
                }}
                onUpdateTitle={(title) => updateRoomTitle(roomId, title)}
                onCreateRandomTeams={(teamCount) => {
                  handleCreateRandomTeams(teamCount);
                  maybeShowAd();
                }}
                onSpinWheel={() => openSpinWheel()}
              />
            </div>
          </div>
          </div>
        </main>

        {/* Ad banner spacer – anchored at bottom by flex layout */}
        <AdBannerSpacer />
      </div>

      {/* Modals */}
      <LeaveRoomModal
        isOpen={showLeaveModal}
        onConfirm={handleLeaveRoom}
        onCancel={() => setShowLeaveModal(false)}
      />

      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

      <TeamResultModal
        isOpen={!!room?.teams}
        teams={room?.teams || []}
        roomTitle={room?.title}
        createdCount={room?.teamsCreatedCount || 0}
        onClose={() => {
          restartRoom();
        }}
        onCreateNew={() => {
          if (room?.teams) {
            const currentTeamCount = room.teams.length;
            handleCreateRandomTeams(currentTeamCount);
            maybeShowAd();
          }
        }}
        isAdmin={currentUser?.is_admin || false}
      />

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
        selectedCount={
          room?.result?.type === 'winner'
            ? (room?.winnerSelectedCount || 0)
            : (room?.loserSelectedCount || 0)
        }
      />

      <SpinWheelModal
        isOpen={!!room?.spinWheel}
        options={options}
        onClose={() => closeSpinWheel()}
        onSelectWinner={() => {
          incrementSpinWheelCount();
          markSpinAdPending();
        }}
        onSpinComplete={handleSpinComplete}
        onRemoveAndSpin={async (option) => {
          await deleteOption(option.id);
        }}
        isAdmin={currentUser?.is_admin || false}
        selectedCount={room?.spinWheelSelectedCount || 0}
        spinWheelData={room?.spinWheelData}
        onStartSpin={(data) => startSpinWheel(data)}
        onClearSpinData={() => clearSpinWheelData()}
      />
    </>
  );
}
