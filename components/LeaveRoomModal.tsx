'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

interface LeaveRoomModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LeaveRoomModal: React.FC<LeaveRoomModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const t = useTranslations('leaveRoom');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onCancel}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">🚪</div>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
            {t('title')}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {t('message')}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              {t('cancel')}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              {t('confirm')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
