'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

interface RoomEntranceModalProps {
  isOpen: boolean;
  onSubmit: (name: string, title?: string) => Promise<void>;
  isFirstUser: boolean;
  roomTitle?: string;
}

export const RoomEntranceModal: React.FC<RoomEntranceModalProps> = ({ isOpen, onSubmit, isFirstUser, roomTitle: existingRoomTitle }) => {
  const t = useTranslations('entrance');
  const [name, setName] = useState('');
  const [roomTitle, setRoomTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('RoomEntranceModal submit:', { name: name.trim(), roomTitle: roomTitle.trim(), isFirstUser });
    if (name.trim() && !loading) {
      setLoading(true);
      try {
        await onSubmit(name.trim(), isFirstUser && roomTitle.trim() ? roomTitle.trim() : undefined);
      } catch (error) {
        console.error('Submit error:', error);
        setLoading(false);
      }
    } else {
      console.warn('Name is empty or already loading');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-primary-500">🎲 {t('title')}</h2>
        {isFirstUser && (
          <p className="text-gray-600 mb-4 text-sm">{t('firstUser')}</p>
        )}
        {!isFirstUser && existingRoomTitle && (
          <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-gray-600">{t('joiningDraw')}</p>
            <p className="font-semibold text-primary-700">{existingRoomTitle}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isFirstUser && (
            <div>
              <input
                type="text"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                placeholder={t('roomTitlePlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed placeholder:truncate"
                autoFocus
                disabled={loading}
              />
            </div>
          )}
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              required
              autoFocus={!isFirstUser}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Yükleniyor...
              </>
            ) : (
              isFirstUser ? t('createDraw') : t('joinDraw')
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
