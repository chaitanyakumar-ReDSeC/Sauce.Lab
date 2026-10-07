import React from 'react';
import { Clock, Users, ArrowUpRight, Utensils } from 'lucide-react';
import { RecipeMeta } from '../types/recipe';

interface RecipeCardProps {
  recipe: RecipeMeta;
  onClick: (recipe: RecipeMeta) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div
      onClick={() => onClick(recipe)}
      className="group relative flex flex-col justify-between bg-[#0D0D10] border border-[#222226] hover:border-[#C20000] rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-5px_rgba(194,0,0,0.25)] cursor-pointer overflow-hidden"
    >
      {/* Red accent edge indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C20000] via-[#C20000]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Background culinary graphic watermark */}
      <div className="absolute -right-6 -bottom-6 text-[#1A1A20]/40 group-hover:text-[#C20000]/10 transition-colors pointer-events-none">
        <Utensils className="w-32 h-32 stroke-[1]" />
      </div>

      <div className="relative z-10">
        {/* Category tag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#18181C] border border-[#2C2C33] text-[11px] font-heading font-medium text-[#C20000] tracking-wide uppercase">
            {recipe.category || 'Recipe'}
          </span>
        </div>

        {/* Recipe Title */}
        <h3 className="font-heading font-bold text-xl text-white group-hover:text-white tracking-tight leading-snug mb-3 transition-colors">
          {recipe.recipe}
        </h3>

        {/* Description or excerpt if present */}
        {recipe.description && (
          <p className="text-sm text-[#A1A1AA] line-clamp-2 font-body mb-4">
            {recipe.description}
          </p>
        )}
      </div>

      {/* Footer metrics & CTA */}
      <div className="relative z-10 pt-4 mt-4 border-t border-[#1C1C22] flex items-center justify-between text-xs text-[#A1A1AA]">
        <div className="flex items-center gap-4">
          {recipe.cookTime && (
            <div className="flex items-center gap-1.5 font-heading">
              <Clock className="w-3.5 h-3.5 text-[#C20000]" />
              <span>{recipe.cookTime}</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1.5 font-heading">
              <Users className="w-3.5 h-3.5 text-[#C20000]" />
              <span>{recipe.servings}</span>
            </div>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-white font-heading font-semibold text-xs group-hover:text-[#C20000] transition-colors">
          View Recipe
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
