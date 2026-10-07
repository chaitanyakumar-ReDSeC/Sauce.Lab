import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Bell, Flame } from 'lucide-react';
import { ActiveTimer } from '../types/recipe';
import { playKitchenChime } from '../services/recipeService';

interface TimerDrawerProps {
  timer: ActiveTimer | null;
  onUpdateTimer: (updater: (prev: ActiveTimer | null) => ActiveTimer | null) => void;
  onClose: () => void;
}

export const TimerDrawer: React.FC<TimerDrawerProps> = ({
  timer,
  onUpdateTimer,
  onClose
}) => {
  useEffect(() => {
    if (!timer || !timer.isRunning || timer.remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      onUpdateTimer(curr => {
        if (!curr) return null;
        if (curr.remainingSeconds <= 1) {
          playKitchenChime();
          return {
            ...curr,
            remainingSeconds: 0,
            isRunning: false
          };
        }
        return {
          ...curr,
          remainingSeconds: curr.remainingSeconds - 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer?.isRunning, timer?.remainingSeconds, onUpdateTimer]);

  if (!timer) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent =
    timer.totalSeconds > 0
      ? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100
      : 0;

  const isComplete = timer.remainingSeconds === 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-subtle">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${
        isComplete
          ? 'bg-[#180A0B] border-[#C20000] shadow-[0_0_25px_rgba(194,0,0,0.6)]'
          : 'bg-[#0E0E12]/95 border-[#262630] shadow-black'
      }`}>
        {/* Top title and dismiss */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#C20000]" />
            <span className="font-heading font-semibold text-xs text-white truncate max-w-[180px]">
              {timer.label}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big countdown and controls */}
        <div className="flex items-center justify-between my-2">
          <div className={`font-heading font-extrabold text-3xl tracking-tight ${
            isComplete ? 'text-[#C20000] animate-pulse' : 'text-white'
          }`}>
            {formatTime(timer.remainingSeconds)}
          </div>

          <div className="flex items-center gap-2">
            {!isComplete && (
              <button
                onClick={() =>
                  onUpdateTimer(curr => (curr ? { ...curr, isRunning: !curr.isRunning } : null))
                }
                className="p-2 rounded-lg bg-[#C20000] hover:bg-[#A00000] text-white transition-colors"
                title={timer.isRunning ? 'Pause' : 'Resume'}
              >
                {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
            )}

            <button
              onClick={() =>
                onUpdateTimer(curr =>
                  curr
                    ? {
                        ...curr,
                        remainingSeconds: curr.totalSeconds,
                        isRunning: true
                      }
                    : null
                )
              }
              className="p-2 rounded-lg bg-[#181820] hover:bg-[#22222C] text-[#A1A1AA] hover:text-white border border-[#2B2B36] transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#181820] h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-[#C20000] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {isComplete && (
          <div className="mt-2 text-center text-xs font-heading font-bold text-[#C20000] animate-pulse">
            Time&apos;s Up! Check your dish.
          </div>
        )}
      </div>
    </div>
  );
};
