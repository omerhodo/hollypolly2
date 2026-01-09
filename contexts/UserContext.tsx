'use client';

import { db } from '@/lib/firebase/client';
import type { LocalStorageUser, User } from '@/types';
import { Timestamp, deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  initializeUser: (roomId: string, name?: string, isFirstUser?: boolean, userOrder?: number) => Promise<User>;
  updateUserName: (userId: string, newName: string) => Promise<void>;
  updateHeartbeat: (userId: string, roomId: string) => Promise<void>;
  removeUser: (userId: string, roomId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      const localUser: LocalStorageUser = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        room_id: user.room_id,
      };
      localStorage.setItem('hollypolly_user', JSON.stringify(localUser));
    }
  }, []);

  const generateAvatar = (userOrder: number): string => {
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userOrder}`;
    console.log('Generated avatar URL:', avatarUrl, 'for order:', userOrder);
    return avatarUrl;
  };

  const initializeUser = useCallback(async (roomId: string, name?: string, isFirstUser = false, userOrder = 1): Promise<User> => {
    try {
      console.log('initializeUser called:', { roomId, name, isFirstUser, userOrder });

      // Check localStorage first
      const storedUser = localStorage.getItem('hollypolly_user');
      if (storedUser) {
        const localUser: LocalStorageUser = JSON.parse(storedUser);
        if (localUser.room_id === roomId) {
          // Check if user exists in Firestore
          const userDoc = await getDoc(doc(db, 'rooms', roomId, 'users', localUser.id));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            console.log('Existing user loaded:', userData);
            return userData;
          }
        }
      }

      // Create new user
      const userId = uuidv4();
      const avatar = generateAvatar(userOrder);
      const userName = name || `User ${userId.slice(0, 4)}`;

      const newUser: User = {
        id: userId,
        name: userName,
        avatar,
        is_admin: isFirstUser,
        room_id: roomId,
        joined_at: Timestamp.now(),
        last_seen: Timestamp.now(),
      };

      console.log('Creating new user in Firestore:', newUser);
      await setDoc(doc(db, 'rooms', roomId, 'users', userId), newUser);
      setCurrentUser(newUser);
      console.log('User created successfully');

      return newUser;
    } catch (error) {
      console.error('Error in initializeUser:', error);
      throw error;
    }
  }, [setCurrentUser]);

  const updateUserName = useCallback(async (userId: string, newName: string) => {
    const userDoc = doc(db, 'rooms', currentUser?.room_id || '', 'users', userId);
    await updateDoc(userDoc, { name: newName });

    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, name: newName });
    }
  }, [currentUser, setCurrentUser]);

  const updateHeartbeat = useCallback(async (userId: string, roomId: string) => {
    try {
      const userDoc = doc(db, 'rooms', roomId, 'users', userId);
      await updateDoc(userDoc, { last_seen: Timestamp.now() });
    } catch (error) {
      console.error('Heartbeat update failed:', error);
    }
  }, []);

  const removeUser = useCallback(async (userId: string, roomId: string) => {
    try {
      await deleteDoc(doc(db, 'rooms', roomId, 'users', userId));
      if (currentUser?.id === userId) {
        localStorage.removeItem('hollypolly_user');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Remove user failed:', error);
    }
  }, [currentUser, setCurrentUser]);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hollypolly_user');
    if (storedUser && !currentUser) {
      try {
        const localUser: LocalStorageUser = JSON.parse(storedUser);
        // Will be validated in the room page's initializeUser call
        console.log('User found in localStorage:', localUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('hollypolly_user');
      }
    }
  }, [currentUser]);

  // Cleanup user when browser/tab closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        // Use synchronous deletion - this is our best chance before page unloads
        try {
          // Create a delete request that can complete before unload
          const userDocRef = doc(db, 'rooms', currentUser.room_id, 'users', currentUser.id);
          deleteDoc(userDocRef);
          localStorage.removeItem('hollypolly_user');
        } catch (error) {
          console.error('Cleanup on unload failed:', error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && currentUser) {
        // Tab is hidden/closed, try to cleanup
        try {
          const userDocRef = doc(db, 'rooms', currentUser.room_id, 'users', currentUser.id);
          deleteDoc(userDocRef);
          localStorage.removeItem('hollypolly_user');
        } catch (error) {
          console.error('Cleanup on visibility change failed:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, initializeUser, updateUserName, updateHeartbeat, removeUser }}>
      {children}
    </UserContext.Provider>
  );
};
