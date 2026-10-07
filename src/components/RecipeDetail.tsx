import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  Copy,
  Printer,
  Flame,
  Play,
  RotateCcw,
  Check,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';
import { RecipeFullData } from '../types/recipe';
import { formatQuantity } from '../utils/csvParser';

interface RecipeDetailProps {
  data: RecipeFullData;
  onBack: () => void;
  onStartCookMode: () => void;
  onStartTimer: (seconds: number, label: string, stepNum?: number) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  data,
  onBack,
  onStartCookMode,
  onStartTimer
}) => {
  const { meta, ingredients, steps, defaultServings } = data;

  // Servings multiplier state
  const [servings, setServings] = useState<number>(defaultServings || 4);

  // Checked ingredients (mise en place prep)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  // Completed steps
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Copy grocery list feedback
  const [copiedGrocery, setCopiedGrocery] = useState(false);

  const multiplier = defaultServings > 0 ? servings / defaultServings : 1;

  const toggleIngredient = (id: string) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNumber)) next.delete(stepNumber);
      else next.add(stepNumber);
      return next;
    });
  };

  const handleCopyGroceryList = () => {
    const listText = [
      `🛒 Shopping List for ${meta.recipe} (${servings} servings)`,
      '----------------------------------------',
      ...ingredients.map(ing => {
        let qtyStr = '';
        if (ing.baseQuantity !== undefined) {
          const scaled = ing.baseQuantity * multiplier;
          qtyStr = `${formatQuantity(scaled)} ${ing.unit || ''}`.trim();
        } else if (ing.quantity) {
          qtyStr = `${ing.quantity} ${ing.unit || ''}`.trim();
        }
        return `• ${qtyStr ? qtyStr + ' - ' : ''}${ing.ingredient}${ing.notes ? ` (${ing.notes})` : ''}`;
      })
    ].join('\n');

    navigator.clipboard.writeText(listText).then(() => {
      setCopiedGrocery(true);
      setTimeout(() => setCopiedGrocery(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const checkedCount = checkedIngredients.size;
  const totalIngredients = ingredients.length;

  return (
    <div className="space-y-10">
      {/* Navigation & Actions Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E1E24] pb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-heading font-medium text-[#A1A1AA] hover:text-white transition-all group"
        >
          <ArrowLeft className="w-4 h-4 text-[#C20000] group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Recipes</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Cook Mode CTA */}
          <button
            onClick={onStartCookMode}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C20000] hover:bg-[#A00000] text-white text-xs font-heading font-bold rounded-lg shadow-[0_0_15px_rgba(194,0,0,0.35)] transition-all"
          >
            <Flame className="w-4 h-4" />
            <span>Interactive Cook Mode</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-2 bg-[#121216] hover:bg-[#1C1C22] text-[#A1A1AA] hover:text-white border border-[#27272F] rounded-lg transition-colors"
            title="Print recipe"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recipe Header Banner */}
      <div className="bg-[#0B0B0E] border border-[#202026] rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle crimson glow background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C20000]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Meta badge */}
          {meta.category && (
            <div className="mb-4">
              <span className="px-3 py-1 bg-[#1A1A20] text-[#C20000] border border-[#C20000]/40 rounded-full text-xs font-heading font-semibold tracking-wider uppercase">
                {meta.category}
              </span>
            </div>
          )}

          {/* Main Recipe Title */}
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight mb-4">
            {meta.recipe}
          </h1>

          {meta.description && (
            <p className="text-base text-[#A1A1AA] font-body leading-relaxed mb-6">
              {meta.description}
            </p>
          )}

          {/* Key Metrics */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[#1C1C22] text-sm text-[#A1A1AA]">
            {meta.cookTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C20000]" />
                <span className="font-heading font-medium text-white">{meta.cookTime}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C20000]" />
              <span className="font-heading font-medium text-white">{servings} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-[#C20000]" />
              <span className="font-heading font-medium text-white">{ingredients.length}</span>
              <span className="text-xs text-[#71717A]">ingredients</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C20000]" />
              <span className="font-heading font-medium text-white">{steps.length}</span>
              <span className="text-xs text-[#71717A]">steps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Ingredients & Procedure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= INGREDIENTS SECTION (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B0B0E] border border-[#202026] rounded-2xl p-6 relative">
            
            {/* Section Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E24] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 bg-[#C20000] rounded-sm" />
                <h2 className="font-heading font-bold text-xl text-white tracking-wide">
                  Ingredients
                </h2>
              </div>

              {/* Progress counter */}
              <span className="text-xs font-mono text-[#8E8E93]">
                <span className="text-[#C20000] font-semibold">{checkedCount}</span> / {totalIngredients} prepped
              </span>
            </div>

            {/* Serving Scaler */}
            <div className="flex items-center justify-between bg-[#121216] border border-[#24242A] rounded-xl p-3 mb-5">
              <span className="text-xs font-heading font-medium text-[#A1A1AA] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C20000]" />
                Servings:
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServings(s => Math.max(1, s - 1))}
                  className="w-7 h-7 rounded bg-[#1C1C22] hover:bg-[#282830] text-white font-mono text-sm flex items-center justify-center transition-colors border border-[#33333C]"
                >
                  -
                </button>
                <span className="font-heading font-bold text-white text-sm w-8 text-center">
                  {servings}
                </span>
                <button
                  onClick={() => setServings(s => s + 1)}
                  className="w-7 h-7 rounded bg-[#1C1C22] hover:bg-[#282830] text-white font-mono text-sm flex items-center justify-center transition-colors border border-[#33333C]"
                >
                  +
                </button>
                {servings !== defaultServings && (
                  <button
                    onClick={() => setServings(defaultServings)}
                    className="ml-1 p-1 text-[#8E8E93] hover:text-white text-xs transition-colors"
                    title="Reset to default servings"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Ingredients List */}
            {ingredients.length > 0 ? (
              <div className="space-y-2.5">
                {ingredients.map((ing) => {
                  const isChecked = checkedIngredients.has(ing.id);

                  let displayQty = '';
                  if (ing.baseQuantity !== undefined) {
                    const scaled = ing.baseQuantity * multiplier;
                    displayQty = formatQuantity(scaled);
                  } else if (ing.quantity) {
                    displayQty = String(ing.quantity);
                  }

                  return (
                    <div
                      key={ing.id}
                      onClick={() => toggleIngredient(ing.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#0E0E12]/40 border-[#1A1A20] text-[#606068]'
                          : 'bg-[#121216] border-[#222228] hover:border-[#383842] text-white'
                      }`}
                    >
                      <button className="mt-0.5 text-[#C20000] shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-[#C20000]" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#44444F]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 text-sm">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`font-body font-medium ${isChecked ? 'line-through text-[#666672]' : 'text-white'}`}>
                            {ing.ingredient}
                          </span>

                          {(displayQty || ing.unit) && (
                            <span className={`font-heading font-semibold text-xs shrink-0 ${isChecked ? 'text-[#666672]' : 'text-[#C20000]'}`}>
                              {displayQty} {ing.unit}
                            </span>
                          )}
                        </div>

                        {ing.notes && (
                          <p className={`text-xs mt-0.5 font-body italic ${isChecked ? 'text-[#50505A]' : 'text-[#8E8E93]'}`}>
                            {ing.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#71717A] italic py-6 text-center">
                No ingredients listed for this recipe yet.
              </p>
            )}

            {/* Grocery copy action */}
            <div className="mt-6 pt-5 border-t border-[#1C1C22]">
              <button
                onClick={handleCopyGroceryList}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#141418] hover:bg-[#1E1E24] text-white border border-[#2A2A32] rounded-xl text-xs font-heading font-semibold transition-all"
              >
                {copiedGrocery ? (
                  <>
                    <Check className="w-4 h-4 text-[#C20000]" />
                    <span className="text-[#C20000]">Shopping List Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#C20000]" />
                    <span>Copy Ingredients List</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= PROCEDURE SECTION (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0B0B0E] border border-[#202026] rounded-2xl p-6 sm:p-8">
            
            {/* Section Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E24] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 bg-[#C20000] rounded-sm" />
                <h2 className="font-heading font-bold text-xl text-white tracking-wide">
                  Procedure
                </h2>
              </div>

              <span className="text-xs font-mono text-[#8E8E93]">
                <span className="text-[#C20000] font-semibold">{completedSteps.size}</span> / {steps.length} steps completed
              </span>
            </div>

            {/* Steps List */}
            {steps.length > 0 ? (
              <div className="space-y-6">
                {steps.map((step) => {
                  const isStepDone = completedSteps.has(step.stepNumber);

                  return (
                    <div
                      key={step.id}
                      className={`relative rounded-xl border p-5 sm:p-6 transition-all ${
                        isStepDone
                          ? 'bg-[#0E0E12]/50 border-[#1A1A20]'
                          : 'bg-[#121216] border-[#24242C] hover:border-[#3A3A44]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Step Number in Space Grotesk */}
                        <div className="flex flex-col items-center">
                          <span className={`font-heading font-extrabold text-2xl tracking-tight leading-none ${
                            isStepDone ? 'text-[#444450]' : 'text-[#C20000]'
                          }`}>
                            {String(step.stepNumber).padStart(2, '0')}
                          </span>
                          
                          {/* Checkbox button */}
                          <button
                            onClick={() => toggleStep(step.stepNumber)}
                            className="mt-3 text-xs text-[#71717A] hover:text-[#C20000] transition-colors"
                            title="Mark step complete"
                          >
                            {isStepDone ? (
                              <CheckCircle2 className="w-5 h-5 text-[#C20000]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#3F3F46] hover:text-white" />
                            )}
                          </button>
                        </div>

                        {/* Instruction content */}
                        <div className="flex-1 min-w-0">
                          {step.title && (
                            <h4 className={`font-heading font-bold text-base mb-2 tracking-wide ${
                              isStepDone ? 'line-through text-[#606068]' : 'text-white'
                            }`}>
                              {step.title}
                            </h4>
                          )}

                          <p className={`font-body text-sm leading-relaxed whitespace-pre-line ${
                            isStepDone ? 'line-through text-[#606068]' : 'text-[#E4E4E7]'
                          }`}>
                            {step.instruction}
                          </p>

                          {/* Detected Timer Button */}
                          {step.detectedTimerSeconds && (
                            <div className="mt-4 pt-3 border-t border-[#1C1C22] flex items-center justify-between">
                              <button
                                onClick={() =>
                                  onStartTimer(
                                    step.detectedTimerSeconds!,
                                    step.title || `Step ${step.stepNumber} Timer`,
                                    step.stepNumber
                                  )
                                }
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1C1214] hover:bg-[#C20000] text-[#C20000] hover:text-white border border-[#C20000]/40 hover:border-[#C20000] rounded-lg text-xs font-heading font-semibold transition-all group"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Start {step.detectedTimerText || `${step.detectedTimerSeconds / 60}m`} Timer</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#71717A] italic py-6 text-center">
                No procedure steps listed for this recipe yet.
              </p>
            )}

            {/* All Done Banner */}
            {completedSteps.size === steps.length && steps.length > 0 && (
              <div className="mt-8 p-5 bg-[#170C0D] border border-[#C20000]/50 rounded-xl text-center">
                <Flame className="w-8 h-8 text-[#C20000] mx-auto mb-2" />
                <h4 className="font-heading font-bold text-white text-base">
                  All Steps Completed! Bon Appétit!
                </h4>
                <p className="text-xs text-[#A1A1AA] mt-1 font-body">
                  Your dish is ready to plate and enjoy.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
