'use client';

import type { Option } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';

// --- Color palette for wheel segments ---
const SEGMENT_COLORS = [
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#a855f7', // purple-500
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
];

interface SpinWheelModalProps {
  isOpen: boolean;
  options: Option[];
  onClose: () => void;
  onSelectWinner: (option: Option) => void;
  onRemoveAndSpin: (option: Option) => void;
  isAdmin?: boolean;
  selectedCount?: number;
}

// Easing function: cubic deceleration
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  options,
  onClose,
  onSelectWinner,
  onRemoveAndSpin,
  isAdmin = false,
  selectedCount = 0,
}) => {
  const t = useTranslations('wheel');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Option | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Track rotation in a ref for animation frame access
  const rotationRef = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when modal is open
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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setWinner(null);
      setIsSpinning(false);
      setCurrentRotation(0);
      rotationRef.current = 0;
    }
  }, [isOpen]);

  // Draw the wheel
  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas || options.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displaySize = Math.min(canvas.parentElement?.clientWidth || 320, 320);
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;
      ctx.scale(dpr, dpr);

      const centerX = displaySize / 2;
      const centerY = displaySize / 2;
      const radius = displaySize / 2 - 8;
      const segmentAngle = (2 * Math.PI) / options.length;

      ctx.clearRect(0, 0, displaySize, displaySize);

      // Draw segments
      for (let i = 0; i < options.length; i++) {
        const startAngle = rotation + i * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        // Fill segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
        ctx.fill();

        // Draw border between segments
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + segmentAngle / 2);

        const text = options[i].text;
        const maxTextWidth = radius * 0.6;
        const fontSize = Math.min(14, Math.max(9, 160 / options.length));
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // Truncate text if too long
        let displayText = text;
        while (ctx.measureText(displayText).width > maxTextWidth && displayText.length > 1) {
          displayText = displayText.slice(0, -1);
        }
        if (displayText !== text) displayText += '…';

        ctx.fillText(displayText, radius - 16, 0);
        ctx.restore();
      }

      // Draw center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw pointer (triangle at top, pointing DOWN into the wheel)
      const pointerSize = 16;
      ctx.beginPath();
      ctx.moveTo(centerX, pointerSize + 4);
      ctx.lineTo(centerX - pointerSize / 2, 2);
      ctx.lineTo(centerX + pointerSize / 2, 2);
      ctx.closePath();
      ctx.fillStyle = '#1f2937';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    },
    [options],
  );

  // Draw on mount / option change / rotation change
  useEffect(() => {
    drawWheel(currentRotation);
  }, [currentRotation, drawWheel, isOpen]);

  const spin = useCallback(() => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    const segmentAngle = (2 * Math.PI) / options.length;
    const fullSpins = 8 + Math.random() * 4; // 8-12 full rotations
    const extraAngle = Math.random() * 2 * Math.PI; // random landing position
    const baseRotation = rotationRef.current;

    const targetRotation = baseRotation - (fullSpins * 2 * Math.PI + extraAngle);

    const duration = 5000; // 5 seconds
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const newRotation = baseRotation + (targetRotation - baseRotation) * easedProgress;
      rotationRef.current = newRotation;
      setCurrentRotation(newRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete — read winner from where the pointer actually landed.
        // Pointer is fixed at angle -π/2 (top of canvas).
        // Segment i occupies [finalRot + i*seg, finalRot + (i+1)*seg).
        // Solve: which i contains -π/2?
        //   (-π/2 - finalRot) mod 2π  /  segmentAngle
        const pointerOffset =
          ((-Math.PI / 2 - targetRotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const winnerIndex = Math.floor(pointerOffset / segmentAngle) % options.length;

        setIsSpinning(false);
        const selectedOption = options[winnerIndex];
        setWinner(selectedOption);
        onSelectWinner(selectedOption);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isSpinning, options, onSelectWinner]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={() => !isSpinning && isAdmin && onClose()}
      >
        {/* Confetti */}
        {winner && windowSize.width > 0 && (
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
          className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative border-4 border-violet-500"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close X Button - Admin only */}
          {!isSpinning && isAdmin && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Wheel Container */}
          <div className="relative mx-auto mb-4" style={{ maxWidth: 320 }}>
            <canvas ref={canvasRef} className="mx-auto" />
          </div>

          {/* Winner Display */}
          <AnimatePresence>
            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-50 border-2 border-primary-500 rounded-lg p-4 mb-4"
              >
                <p className="text-sm text-primary-600 font-medium">{t('winner')}</p>
                <p className="text-xl font-bold text-primary-700">{winner.text}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            {/* Selected count */}
            {selectedCount > 0 && (
              <p className="text-sm text-center text-gray-600">
                {selectedCount === 1
                  ? t('firstTime')
                  : t('nthTime', { count: selectedCount })
                }
              </p>
            )}

            {!winner && isAdmin && (
              <button
                onClick={spin}
                disabled={isSpinning || options.length < 2}
                className="w-full py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
              >
                {isSpinning ? t('spinning') : t('spinButton')}
              </button>
            )}

            {winner && isAdmin && (
              <>
                <button
                  onClick={() => {
                    setWinner(null);
                    spin();
                  }}
                  className="w-full py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors font-semibold"
                >
                  {t('playAgain')}
                </button>
                {options.length > 2 && (
                  <button
                    onClick={() => {
                      const removedOption = winner;
                      setWinner(null);
                      rotationRef.current = 0;
                      setCurrentRotation(0);
                      onRemoveAndSpin(removedOption);
                    }}
                    className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                  >
                    {t('removeAndSpin')}
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
