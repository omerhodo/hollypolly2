'use client';

import type { Option, ResultData } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface ResultModalProps {
  result: ResultData | null;
  options: Option[];
  onRestart: () => void;
  onShowResultInOptions?: () => void;
  isAdmin?: boolean;
  selectedCount?: number;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, options, onRestart, onShowResultInOptions, isAdmin = false, selectedCount = 0 }) => {
  const t = useTranslations('result');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (result) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [result]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && result && isAdmin) {
        onRestart();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [result, onRestart, isAdmin]);

  if (!result) return null;

  const selectedOption = options.find((opt) => opt.id === result.option_id);
  const isWinner = result.type === 'winner';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={isAdmin ? onRestart : undefined}
      >
        {isWinner && windowSize.width > 0 && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
          />
        )}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className={`bg-white rounded-2xl p-8 max-w-md w-full text-center relative ${
            isWinner ? 'border-4 border-primary-500' : 'border-4 border-red-500'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close X Button - Admin only */}
          {isAdmin && (
            <button
              onClick={onRestart}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="text-6xl mb-4">{isWinner ? '🎉' : '💔'}</div>
          <h2
            className={`text-3xl font-bold mb-4 ${
              isWinner ? 'text-primary-500' : 'text-red-500'
            }`}
          >
            {isWinner ? t('winnerTitle') : t('loserTitle')}
          </h2>
          <div className="bg-gray-100 rounded-lg p-6 mb-6 overflow-hidden">
            <p className="text-sm text-gray-600 mb-2">{t('selected')}</p>
            <p className="text-2xl font-bold text-gray-800 truncate">{selectedOption?.text}</p>
          </div>

          {/* Selected count */}
          {selectedCount > 0 && (
            <p className="text-sm text-center text-gray-600 mb-4">
              {selectedCount === 1
                ? t('firstTime')
                : t('nthTime', { count: selectedCount })
              }
            </p>
          )}

          {isAdmin && (
            <button
              onClick={onRestart}
              className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
                isWinner
                  ? 'bg-primary-500 hover:bg-primary-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {t('restart')}
            </button>
          )}

          {isAdmin && onShowResultInOptions && (
            <button
              onClick={() => {
                onShowResultInOptions();
                onRestart();
              }}
              className="w-full py-3 mt-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
            >
              {t('removeFromOptions')}
            </button>
          )}

          {!isAdmin && (
            <p className="text-xs text-gray-500 mt-3 text-center">{t('adminCanRemoveFromOptions')}</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
