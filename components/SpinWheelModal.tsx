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

      // Draw pointer (triangle at top)
      const pointerSize = 16;
      ctx.beginPath();
      ctx.moveTo(centerX, 2);
      ctx.lineTo(centerX - pointerSize / 2, pointerSize + 2);
      ctx.lineTo(centerX + pointerSize / 2, pointerSize + 2);
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

    // Pre-determine winner
    const winnerIndex = Math.floor(Math.random() * options.length);
    const segmentAngle = (2 * Math.PI) / options.length;

    // Calculate target rotation:
    // The pointer is at the top (12 o'clock = -π/2 in canvas coords = 3π/2 in standard).
    // We want the winning segment to be under the pointer.
    // We need to rotate so that the middle of the winning segment aligns with the pointer (top).
    const targetSegmentCenter = winnerIndex * segmentAngle + segmentAngle / 2;
    // The pointer is at angle -π/2 (top). Segment at angle 0 starts at 3 o'clock.
    // For segment center to be at top: rotation + targetSegmentCenter = -π/2 + 2kπ
    // rotation = -π/2 - targetSegmentCenter + 2kπ
    // Add several full rotations for dramatic effect (8-12 full spins)
    const fullSpins = 8 + Math.random() * 4; // 8-12 full rotations
    const baseRotation = rotationRef.current;
    const targetRotation =
      baseRotation -
      (fullSpins * 2 * Math.PI) -
      (((-Math.PI / 2 - targetSegmentCenter - baseRotation) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const totalAngle = Math.abs(targetRotation - baseRotation);
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
        // Animation complete
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
        onClick={() => !isSpinning && onClose()}
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
          className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('title')}</h2>

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
          <div className="flex gap-3">
            {!winner && (
              <button
                onClick={spin}
                disabled={isSpinning || options.length < 2}
                className="flex-1 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
              >
                {isSpinning ? t('spinning') : t('spinButton')}
              </button>
            )}

            {winner && (
              <>
                <button
                  onClick={() => {
                    setWinner(null);
                    spin();
                  }}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                >
                  {t('playAgain')}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  {t('close')}
                </button>
              </>
            )}

            {!winner && !isSpinning && (
              <button
                onClick={onClose}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                {t('close')}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
