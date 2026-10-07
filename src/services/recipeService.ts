import { RecipeMeta, RecipeFullData } from '../types/recipe';
import { parseMetaCsv, parseIngredientsCsv } from '../utils/csvParser';
import { parseProcessTxt } from '../utils/textParser';

/**
 * Fetches and parses /public/meta.csv with cache-busting timestamp.
 */
export async function fetchRecipesMeta(): Promise<{ recipes: RecipeMeta[]; rawMetaCsv: string }> {
  const timestamp = Date.now();
  const response = await fetch(`/meta.csv?_t=${timestamp}`);

  if (!response.ok) {
    throw new Error(`Could not load recipe collection (Status ${response.status})`);
  }

  const csvText = await response.text();
  const recipes = parseMetaCsv(csvText);

  return { recipes, rawMetaCsv: csvText };
}

/**
 * Fetches /${rootFolder}/ingredients.csv and /${rootFolder}/process.txt.
 * Gracefully handles missing files without crashing.
 */
export async function fetchRecipeDetails(meta: RecipeMeta): Promise<RecipeFullData> {
  const timestamp = Date.now();
  const folder = meta.rootFolder.replace(/^\/+|\/+$/g, '');

  let rawIngredients = '';
  try {
    const ingRes = await fetch(`/${folder}/ingredients.csv?_t=${timestamp}`);
    if (ingRes.ok) {
      rawIngredients = await ingRes.text();
    }
  } catch (err) {
    console.warn(`Ingredients not loaded for ${meta.recipe}`, err);
  }

  let rawProcess = '';
  try {
    const procRes = await fetch(`/${folder}/process.txt?_t=${timestamp}`);
    if (procRes.ok) {
      rawProcess = await procRes.text();
    }
  } catch (err) {
    console.warn(`Process not loaded for ${meta.recipe}`, err);
  }

  const ingredients = parseIngredientsCsv(rawIngredients);
  const steps = parseProcessTxt(rawProcess);

  // Parse default servings if available
  let defaultServings = 4;
  if (meta.servings) {
    const sMatch = meta.servings.match(/\d+/);
    if (sMatch) defaultServings = parseInt(sMatch[0], 10);
  }

  return {
    meta,
    ingredients,
    steps,
    rawIngredientsCsv: rawIngredients,
    rawProcessTxt: rawProcess,
    defaultServings
  };
}

/**
 * Synthesizes a subtle, pleasant culinary bell/chime using Web Audio API.
 */
export function playKitchenChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic bell frequencies
    const freqs = [880, 1320, 1760]; // A5 harmonic notes
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  } catch (err) {
    console.warn('Audio chime warning:', err);
  }
}
