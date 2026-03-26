'use client';

import type { Option, SpinWheelData } from '@/types';
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
  onSelectWinner: () => void;
  onRemoveAndSpin: (option: Option) => void;
  isAdmin?: boolean;
  selectedCount?: number;
  spinWheelData?: SpinWheelData | null;
  onStartSpin?: (data: SpinWheelData) => void;
  onClearSpinData?: () => void;
  onSpinComplete?: () => void;
}

// Easing function: cubic deceleration
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const SPIN_DURATION = 5000; // 5 seconds

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  options,
  onClose,
  onSelectWinner,
  onRemoveAndSpin,
  isAdmin = false,
  selectedCount = 0,
  spinWheelData,
  onStartSpin,
  onClearSpinData,
  onSpinComplete,
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
  // Stable ref for onSpinComplete to avoid stale closures in animation frames
  const onSpinCompleteRef = useRef(onSpinComplete);
  onSpinCompleteRef.current = onSpinComplete;
  // Mirror spinWheelData as a ref so the open-reset effect can read it without
  // adding it to the dependency array (avoids infinite re-runs).
  const spinWheelDataRef = useRef(spinWheelData);
  spinWheelDataRef.current = spinWheelData;
  // Track which spinWheelData timestamp we already processed
  const lastProcessedTimestamp = useRef(0);

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
      // Start from a random rotation so a different segment appears at the top
      // each time the modal opens — improves perceived fairness.
      const randomInitial = Math.random() * 2 * Math.PI;
      setCurrentRotation(randomInitial);
      rotationRef.current = randomInitial;
      // Mark any already-stored spinWheelData as processed so it does NOT
      // replay when the modal is reopened (which would incorrectly show
      // "first time" text and replay the previous winner animation).
      lastProcessedTimestamp.current = spinWheelDataRef.current?.timestamp ?? 0;
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

  // --- Deterministic animation runner (used by ALL clients) ---
  const runAnimation = useCallback(
    (targetRotation: number, winnerOptionId: string) => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      setIsSpinning(true);
      setWinner(null);

      const baseRotation = rotationRef.current;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / SPIN_DURATION, 1);
        const easedProgress = easeOutCubic(progress);

        const newRotation = baseRotation + (targetRotation - baseRotation) * easedProgress;
        rotationRef.current = newRotation;
        setCurrentRotation(newRotation);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete — find winner by ID
          setIsSpinning(false);
          const selectedOption = options.find((o) => o.id === winnerOptionId);
          if (selectedOption) {
            setWinner(selectedOption);
            onSpinCompleteRef.current?.();
          }
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [options],
  );

  // --- Watch spinWheelData from Firestore and trigger animation ---
  useEffect(() => {
    if (!spinWheelData) return;
    if (spinWheelData.timestamp <= lastProcessedTimestamp.current) return;

    lastProcessedTimestamp.current = spinWheelData.timestamp;
    runAnimation(spinWheelData.targetRotation, spinWheelData.winnerOptionId);
  }, [spinWheelData, runAnimation]);

  // --- Admin: calculate spin params and write to Firestore ---
  const handleSpin = useCallback(() => {
    if (isSpinning || options.length < 2 || !isAdmin) return;

    // ── Best-practice randomness ──────────────────────────────────────────────
    // crypto.getRandomValues gives cryptographically-strong random bits,
    // much better entropy than Math.random() (which is a PRNG seeded once).
    // We fill 4 independent uint32 values so each decision uses different bits.
    const buf = new Uint32Array(4);
    crypto.getRandomValues(buf);
    // Scale each uint32 to [0, 1) without modulo bias
    const cr = (i: number) => buf[i] / 0x100000000;

    const TWO_PI = 2 * Math.PI;
    const segmentAngle = TWO_PI / options.length;

    // ── 1. Pick winner FIRST (uniform among all options) ─────────────────────
    // This is the key fix: winner is chosen directly, not derived from angle.
    // Previously the winner was back-calculated from a random angle, which
    // created subtle bias when extraAngle happened to be near 0 or 2π.
    const winnerIndex = Math.floor(cr(0) * options.length);
    const winnerOption = options[winnerIndex];

    // ── 2. Random landing position INSIDE the winner segment ─────────────────
    // Landing in the middle-ish area (avoid segment edges: 10%–90% of segment)
    // so the pointer clearly rests on the intended segment.
    const landingOffset = (0.1 + cr(1) * 0.8) * segmentAngle;

    // ── 3. Calculate the exact targetRotation that puts the winner on top ─────
    // The pointer is at canvas angle −π/2 (12 o'clock).
    // Segment `winnerIndex` starts at rotation + winnerIndex * segmentAngle.
    // We need: (pointer_angle − targetRotation) mod 2π = winnerIndex * segmentAngle + landingOffset
    //   =>  targetRotation ≡ −π/2 − winnerIndex * segmentAngle − landingOffset  (mod 2π)
    const targetAngleMod = (((-Math.PI / 2) - winnerIndex * segmentAngle - landingOffset) % TWO_PI + TWO_PI) % TWO_PI;

    // How far to spin past the current visual position to reach targetAngleMod
    // (wheel always spins clockwise = decreasing rotation value)
    const baseRotation = rotationRef.current;
    const baseNorm = ((baseRotation % TWO_PI) + TWO_PI) % TWO_PI;
    const spinPast = baseNorm >= targetAngleMod
      ? baseNorm - targetAngleMod
      : baseNorm + TWO_PI - targetAngleMod;

    // ── 4. Integer full-spin count (5–14) with dedicated random bits ──────────
    // Using an integer avoids a subtle fractional bias: e.g. 8.97 full spins
    // means the wheel travels slightly less than 9 full circles, causing the
    // deceleration to consistently feel "almost there then stops".
    const fullSpins = 5 + Math.floor(cr(2) * 10); // 5, 6, ... 14

    const targetRotation = baseRotation - (fullSpins * TWO_PI + spinPast);

    // Increment spin count
    onSelectWinner();

    // Write to Firestore so ALL clients animate to the same final position
    onStartSpin?.({
      targetRotation,
      winnerOptionId: winnerOption.id,
      timestamp: Date.now(),
    });
  }, [isSpinning, options, isAdmin, onSelectWinner, onStartSpin]);

  // --- Admin: play again ---
  const playAgain = useCallback(() => {
    onClearSpinData?.();
    // Small delay to let Firestore clear propagate, then spin again
    setTimeout(() => handleSpin(), 150);
  }, [onClearSpinData, handleSpin]);

  // --- Admin: close handler ---
  // If spinning: finalize immediately (jump to end, reveal winner).
  // If not spinning: close normally.
  const handleAdminClose = useCallback(() => {
    if (isSpinning && spinWheelData) {
      // Cancel in-progress animation
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Jump wheel to final position
      rotationRef.current = spinWheelData.targetRotation;
      setCurrentRotation(spinWheelData.targetRotation);
      setIsSpinning(false);
      // Reveal winner by ID (already known from Firestore)
      const finalWinner = options.find((o) => o.id === spinWheelData.winnerOptionId);
      if (finalWinner) {
        setWinner(finalWinner);
        onSpinCompleteRef.current?.();
      }
      // Modal stays open so admin can see the result
    } else {
      onClose();
    }
  }, [isSpinning, spinWheelData, options, onClose]);

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
        onClick={() => isAdmin && handleAdminClose()}
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
          {/* Close X Button - Admin only; always clickable */}
          {isAdmin && (
            <button
              onClick={handleAdminClose}
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
                className="bg-primary-50 border-2 border-primary-500 rounded-lg p-4 mb-4 overflow-hidden"
              >
                <p className="text-sm text-primary-600 font-medium">{t('winner')}</p>
                <p className="text-xl font-bold text-primary-700 truncate">{winner.text}</p>
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
                onClick={handleSpin}
                disabled={isSpinning || options.length < 2}
                className="w-full py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
              >
                {isSpinning ? t('spinning') : t('spinButton')}
              </button>
            )}

            {!winner && !isAdmin && isSpinning && (
              <p className="text-gray-500 font-medium">{t('spinning')}</p>
            )}

            {winner && isAdmin && (
              <>
                <button
                  onClick={playAgain}
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
                      onClearSpinData?.();
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
