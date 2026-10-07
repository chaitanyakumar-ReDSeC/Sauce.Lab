import React, { useMemo, useState, useEffect } from 'react';
import { RecipeMeta } from '../types/recipe';
import { RecipeCard } from './RecipeCard';
import { Filter, BookOpen } from 'lucide-react';

interface RecipeGridProps {
  recipes: RecipeMeta[];
  searchQuery: string;
  onSelectRecipe: (recipe: RecipeMeta) => void;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  searchQuery,
  onSelectRecipe
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract dynamic categories directly from recipes defined in meta.csv
  const categories = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach(item => {
      const cat = item.category?.trim();
      if (cat) {
        set.add(cat);
      }
    });
    return ['All', ...Array.from(set)];
  }, [recipes]);

  // If the active category was deleted or renamed in meta.csv, fallback to 'All'
  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  // Filter recipes based on search query and dynamic category
  const filteredRecipes = useMemo(() => {
    return recipes.filter(item => {
      const itemCat = item.category?.trim() || '';
      const matchesCategory =
        selectedCategory === 'All' ||
        itemCat.toLowerCase() === selectedCategory.trim().toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        item.recipe.toLowerCase().includes(q) ||
        itemCat.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [recipes, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Dynamic Category Pills & Recipe Count */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E1E24] pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-heading font-medium text-[#71717A] flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-[#C20000]" />
              Category:
            </span>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
                    isSelected
                      ? 'bg-[#C20000] text-white shadow-[0_0_12px_rgba(194,0,0,0.4)]'
                      : 'bg-[#121215] text-[#A1A1AA] hover:text-white hover:bg-[#1B1B20] border border-[#24242A]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-heading text-[#8E8E93]">
            Showing <span className="font-semibold text-white">{filteredRecipes.length}</span> of {recipes.length} recipes
          </div>
        </div>
      )}

      {/* Grid of recipes */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.rootFolder}
              recipe={recipe}
              onClick={onSelectRecipe}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 bg-[#0A0A0D] border border-[#1F1F24] rounded-2xl">
          <BookOpen className="w-12 h-12 text-[#C20000] mx-auto mb-4 opacity-75" />
          <h3 className="font-heading font-bold text-lg text-white mb-2">No recipes found</h3>
          <p className="text-sm text-[#8E8E93] max-w-md mx-auto">
            {searchQuery
              ? `No recipes match "${searchQuery}". Try a different search term.`
              : `No recipes found in the "${selectedCategory}" category.`}
          </p>
        </div>
      )}
    </div>
  );
};
