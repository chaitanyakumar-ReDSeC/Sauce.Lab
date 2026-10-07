import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchRecipesMeta,
  fetchRecipeDetails
} from './services/recipeService';
import { RecipeMeta, RecipeFullData, ActiveTimer } from './types/recipe';
import { Header } from './components/Header';
import { RecipeGrid } from './components/RecipeGrid';
import { RecipeDetail } from './components/RecipeDetail';
import { CookModeModal } from './components/CookModeModal';
import { TimerDrawer } from './components/TimerDrawer';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [recipes, setRecipes] = useState<RecipeMeta[]>([]);
  const [selectedRecipeData, setSelectedRecipeData] = useState<RecipeFullData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recipeLoading, setRecipeLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCookModeOpen, setIsCookModeOpen] = useState<boolean>(false);

  // Global floating timer
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  // Load recipes catalog
  const loadCatalog = useCallback(async (targetSlug?: string) => {
    try {
      setLoading(true);
      setError(null);
      const { recipes: loadedRecipes } = await fetchRecipesMeta();
      setRecipes(loadedRecipes);

      // Check URL route if targetSlug or URL params exist
      const urlParams = new URLSearchParams(window.location.search);
      const slugFromUrl = targetSlug || urlParams.get('recipe') || window.location.hash.replace(/^#\/?/, '');

      if (slugFromUrl) {
        const found = loadedRecipes.find(
          r => r.rootFolder.toLowerCase() === slugFromUrl.toLowerCase()
        );
        if (found) {
          loadRecipeDetails(found);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();

    // Listen for browser back/forward buttons
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('recipe');
      if (!slug) {
        setSelectedRecipeData(null);
      } else {
        const found = recipes.find(r => r.rootFolder.toLowerCase() === slug.toLowerCase());
        if (found) loadRecipeDetails(found, false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch recipe details for selected recipe
  const loadRecipeDetails = async (meta: RecipeMeta, pushState = true) => {
    try {
      setRecipeLoading(true);
      setError(null);
      const details = await fetchRecipeDetails(meta);
      setSelectedRecipeData(details);

      if (pushState) {
        const newUrl = `${window.location.pathname}?recipe=${encodeURIComponent(meta.rootFolder)}`;
        window.history.pushState({ recipe: meta.rootFolder }, '', newUrl);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to load recipe details');
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleBackToGrid = () => {
    setSelectedRecipeData(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleStartTimer = (seconds: number, label: string, stepNum?: number) => {
    setActiveTimer({
      id: `timer-${Date.now()}`,
      label,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
      stepNumber: stepNum
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F3F4F6] flex flex-col font-body selection:bg-[#C20000] selection:text-white">
      
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReload={() => loadCatalog()}
        isLoading={loading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Error notification banner */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-[#1C0D0E] border border-[#C20000] text-white flex items-center justify-between shadow-[0_0_20px_rgba(194,0,0,0.3)]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#C20000] shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => loadCatalog()}
              className="px-3 py-1 bg-[#C20000] hover:bg-[#A00000] font-heading font-semibold rounded text-xs text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Global Loading state */}
        {loading && recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <RefreshCw className="w-8 h-8 text-[#C20000] animate-spin mb-4" />
            <h3 className="font-heading font-bold text-lg text-white">
              Loading recipes...
            </h3>
          </div>
        ) : recipeLoading ? (
          /* Loading specific recipe */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <RefreshCw className="w-8 h-8 text-[#C20000] animate-spin mb-4" />
            <h3 className="font-heading font-bold text-lg text-white">
              Preparing recipe details...
            </h3>
          </div>
        ) : selectedRecipeData ? (
          /* Single Recipe View */
          <RecipeDetail
            data={selectedRecipeData}
            onBack={handleBackToGrid}
            onStartCookMode={() => setIsCookModeOpen(true)}
            onStartTimer={handleStartTimer}
          />
        ) : (
          /* Home Catalog Grid View */
          <div className="space-y-10">
            {/* Minimal Hero Banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-[#0C0C0F] via-[#101015] to-[#0A0A0C] border border-[#22222A] p-6 sm:p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#C20000]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl">
                <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-3">
                  SAUCE <span className="text-[#C20000]">LAB</span>
                </h1>

                <p className="text-sm sm:text-base text-[#A1A1AA] font-body leading-relaxed">
                  A refined culinary collection engineered for dark kitchen aesthetics. Browse signature recipes, adjust servings, and follow step-by-step procedures with precision timers.
                </p>
              </div>
            </div>

            {/* Recipes Grid */}
            <RecipeGrid
              recipes={recipes}
              searchQuery={searchQuery}
              onSelectRecipe={loadRecipeDetails}
            />
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#1C1C22] bg-[#070709] py-8 mt-16 text-xs text-[#71717A] font-body">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-white tracking-wider">
              SAUCE <span className="text-[#C20000]">LAB</span>
            </span>
            <span>&bull;</span>
            <span>Minimalist Recipe Collection</span>
          </div>

          <div className="text-xs text-[#52525B]">
            Montserrat &amp; Space Grotesk
          </div>
        </div>
      </footer>

      {/* Floating Kitchen Timer Dock */}
      <TimerDrawer
        timer={activeTimer}
        onUpdateTimer={setActiveTimer}
        onClose={() => setActiveTimer(null)}
      />

      {/* Full-Screen Hands-Free Cook Mode Modal */}
      {isCookModeOpen && selectedRecipeData && (
        <CookModeModal
          recipeName={selectedRecipeData.meta.recipe}
          steps={selectedRecipeData.steps}
          onClose={() => setIsCookModeOpen(false)}
        />
      )}

    </div>
  );
}
