'use client';

import type { User } from '@/types';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useState } from 'react';

interface UserListProps {
  users: User[];
  currentUser: User | null;
  roomId: string;
  onMakeAdmin: (userId: string) => void;
  onRemoveAdmin: (userId: string) => void;
  onEditName: (userId: string, newName: string) => void;
  onKickUser: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, currentUser, roomId, onMakeAdmin, onRemoveAdmin, onEditName, onKickUser }) => {
  const t = useTranslations('room');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
  };

  const handleSaveEdit = () => {
    if (editingUserId && editName.trim()) {
      onEditName(editingUserId, editName.trim());
      setEditingUserId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditName('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('participants')}</h2>
      <div className="space-y-3">
        {users.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              user.id === currentUser?.id ? 'bg-primary-50 border-2 border-primary-500' : 'bg-gray-50'
            }`}
          >
            <Image
              src={user.avatar}
              alt={user.name}
              width={40}
              height={40}
              className="rounded-full"
              unoptimized
            />
            <div className="flex-1">
              {editingUserId === user.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="px-2 py-1 bg-primary-500 text-white rounded text-sm"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-2 py-1 bg-gray-300 rounded text-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.name}</span>
                  {user.id === currentUser?.id && (
                    <span className="text-xs text-primary-600">({t('you')})</span>
                  )}
                  {user.is_admin && (
                    <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
                      ⭐ {t('admin')}
                    </span>
                  )}
                </div>
              )}
            </div>
            {user.id === currentUser?.id && editingUserId !== user.id && (
              <button
                onClick={() => handleStartEdit(user)}
                className="text-xs text-primary-600 hover:underline"
              >
                {t('editName')}
              </button>
            )}
            {currentUser?.is_admin && user.id !== currentUser.id && (
              <div className="flex gap-2">
                {!user.is_admin ? (
                  <button
                    onClick={() => onMakeAdmin(user.id)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                  >
                    {t('makeAdmin')}
                  </button>
                ) : (
                  <button
                    onClick={() => onRemoveAdmin(user.id)}
                    className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                  >
                    {t('removeAdmin')}
                  </button>
                )}
                <button
                  onClick={() => onKickUser(user.id)}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  {t('kickUser')}
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
