import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Volume2, Flame, Check } from 'lucide-react';
import { RecipeStep } from '../types/recipe';
import { playKitchenChime } from '../services/recipeService';

interface CookModeModalProps {
  recipeName: string;
  steps: RecipeStep[];
  onClose: () => void;
}

export const CookModeModal: React.FC<CookModeModalProps> = ({
  recipeName,
  steps,
  onClose
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  // Timer state for current step
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerInitial, setTimerInitial] = useState<number>(0);

  // Set up timer if step changes
  useEffect(() => {
    if (currentStep?.detectedTimerSeconds) {
      setTimerSeconds(currentStep.detectedTimerSeconds);
      setTimerInitial(currentStep.detectedTimerSeconds);
      setIsTimerRunning(false);
    } else {
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [currentStepIndex, currentStep]);

  // Tick timer
  useEffect(() => {
    if (!isTimerRunning || timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          playKitchenChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(i => i + 1);
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        setCurrentStepIndex(i => i - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, steps.length, onClose]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col justify-between p-4 sm:p-8 select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#222228] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#170B0B] border border-[#C20000] flex items-center justify-center text-[#C20000]">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-white">
              {recipeName}
            </h2>
            <p className="text-xs text-[#8E8E93] font-body">
              Interactive Hands-Free Cooking Mode
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-[#A1A1AA] hover:text-white bg-[#141418] hover:bg-[#202026] rounded-xl border border-[#2B2B32] transition-colors"
          title="Exit Cook Mode (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#18181D] h-1.5 rounded-full overflow-hidden my-4">
        <div
          className="bg-[#C20000] h-full transition-all duration-300 shadow-[0_0_10px_#C20000]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Center Main Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full text-center py-6">
        
        {/* Step Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A0B0D] border border-[#C20000]/50 text-[#C20000] font-heading font-bold text-sm tracking-widest uppercase mb-6">
          Step {currentStep?.stepNumber} of {steps.length}
        </div>

        {/* Step Title */}
        {currentStep?.title && (
          <h3 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-wide mb-6">
            {currentStep.title}
          </h3>
        )}

        {/* Step Instruction */}
        <p className="font-body text-xl sm:text-3xl text-[#E4E4E7] font-normal leading-relaxed max-w-3xl whitespace-pre-line mb-8">
          {currentStep?.instruction}
        </p>

        {/* Timer Box if detected */}
        {timerInitial > 0 && (
          <div className="bg-[#0F0F14] border border-[#2B2B35] rounded-2xl p-6 sm:p-8 flex flex-col items-center max-w-sm w-full shadow-[0_0_30px_rgba(194,0,0,0.15)]">
            <span className="text-xs font-heading font-medium text-[#8E8E93] uppercase tracking-wider mb-2">
              Step Timer ({currentStep?.detectedTimerText})
            </span>
            
            <div className={`font-heading font-extrabold text-5xl sm:text-6xl tracking-tight mb-5 ${
              timerSeconds === 0 ? 'text-[#C20000] animate-pulse' : 'text-white'
            }`}>
              {formatTime(timerSeconds)}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-5 py-2.5 bg-[#C20000] hover:bg-[#A00000] text-white font-heading font-bold rounded-xl text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(194,0,0,0.4)] transition-all"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> {timerSeconds === 0 ? 'Restart' : 'Start'}
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(timerInitial);
                }}
                className="p-2.5 bg-[#18181F] hover:bg-[#252530] text-[#A1A1AA] hover:text-white rounded-xl border border-[#2B2B36] transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Controls */}
      <div className="flex items-center justify-between border-t border-[#222228] pt-6 max-w-4xl mx-auto w-full">
        <button
          onClick={() => setCurrentStepIndex(i => Math.max(0, i - 1))}
          disabled={currentStepIndex === 0}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#141418] hover:bg-[#1E1E24] text-white font-heading font-semibold text-sm border border-[#2A2A32] disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[#C20000]" />
          <span>Previous Step</span>
        </button>

        <span className="font-heading text-xs text-[#71717A] hidden sm:block">
          Use &larr; &rarr; arrow keys to navigate
        </span>

        {currentStepIndex < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStepIndex(i => Math.min(steps.length - 1, i + 1))}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C20000] hover:bg-[#A00000] text-white font-heading font-bold text-sm shadow-[0_0_15px_rgba(194,0,0,0.4)] transition-all hover:scale-102"
          >
            <span>Next Step</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C20000] hover:bg-[#A00000] text-white font-heading font-bold text-sm shadow-[0_0_15px_rgba(194,0,0,0.4)] transition-all"
          >
            <Check className="w-5 h-5" />
            <span>Finish Cooking</span>
          </button>
        )}
      </div>

    </div>
  );
};
