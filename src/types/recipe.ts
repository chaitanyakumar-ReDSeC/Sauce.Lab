export interface RecipeMeta {
  recipe: string;
  rootFolder: string;
  category?: string;
  cookTime?: string;
  servings?: string;
  image?: string;
  description?: string;
  rawLine?: string;
}

export interface Ingredient {
  id: string;
  ingredient: string;
  quantity?: number | string;
  baseQuantity?: number;
  unit?: string;
  notes?: string;
  originalText?: string;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  title?: string;
  instruction: string;
  detectedTimerSeconds?: number;
  detectedTimerText?: string;
}

export interface RecipeFullData {
  meta: RecipeMeta;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  rawIngredientsCsv: string;
  rawProcessTxt: string;
  defaultServings: number;
}

export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  stepNumber?: number;
}
