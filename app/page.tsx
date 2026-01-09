'use client';

import { db } from '@/lib/firebase/client';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations('home');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      // Clear old user data from localStorage
      localStorage.removeItem('hollypolly_user');

      // Create new room ID
      const roomId = uuidv4();

      // Create room in Firebase
      await setDoc(doc(db, 'rooms', roomId), {
        id: roomId,
        created_at: Timestamp.now(),
        last_activity: Timestamp.now(),
        result: null,
      });

      // Redirect to the room
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Oda oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-primary-600 mb-4">🎲</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('title')}</h2>
        <p className="text-gray-600 mb-8">{t('subtitle')}</p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateRoom}
          disabled={isCreating}
          className="px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isCreating ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              {t('creating')}
            </span>
          ) : (
            t('createRoom')
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
