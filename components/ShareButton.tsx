'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

interface ShareButtonProps {
  roomId: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ roomId }) => {
  const t = useTranslations('room');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/room/${roomId}`;

    // Check if Web Share API is supported (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HollyPolly - Kura',
          text: t('shareMessage') || 'Kura çekimine katılın!',
          url: url,
        });
      } catch (error) {
        // User cancelled share or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to share:', error);
        }
      }
    } else {
      // Fallback to clipboard for desktop
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        {t('share')}
      </button>
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
          >
            {t('copied')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
