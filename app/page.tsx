'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations('loading');

  useEffect(() => {
    // Clear old user data from localStorage
    localStorage.removeItem('hollypolly_user');

    // Create new room and redirect after 2 seconds
    const timer = setTimeout(() => {
      const roomId = uuidv4();
      router.push(`/room/${roomId}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-primary-600 mb-4">🎲</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-2">{t('title')}</h2>
        <p className="text-gray-600">{t('subtitle')}</p>
        <div className="mt-8 flex justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
