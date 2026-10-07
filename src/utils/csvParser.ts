import { RecipeMeta, Ingredient } from '../types/recipe';

/**
 * Splits a CSV line into columns, respecting double quotes and escaped quotes.
 */
export function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses /public/meta.csv containing at least `recipe, root folder`.
 * Can gracefully accept optional columns like category, cook_time, servings.
 */
export function parseMetaCsv(csvText: string): RecipeMeta[] {
  if (!csvText || !csvText.trim()) return [];

  const rawLines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (rawLines.length === 0) return [];

  const headerRow = parseCsvRow(rawLines[0]);
  const normalizedHeaders = headerRow.map(h => h.toLowerCase().replace(/[\s_-]+/g, ''));

  // Find index of recipe and root folder
  let recipeIdx = normalizedHeaders.findIndex(h => h === 'recipe' || h === 'recipename' || h === 'name' || h === 'title');
  let folderIdx = normalizedHeaders.findIndex(h => h === 'rootfolder' || h === 'folder' || h === 'path' || h === 'slug' || h === 'directory');

  // Default fallback if headers are just columns without exact match
  if (recipeIdx === -1 && folderIdx === -1 && normalizedHeaders.length >= 2) {
    recipeIdx = 0;
    folderIdx = 1;
  }

  // Look for optional fields
  const categoryIdx = normalizedHeaders.findIndex(h => h === 'category' || h === 'cuisine' || h === 'type');
  const timeIdx = normalizedHeaders.findIndex(h => h === 'cooktime' || h === 'time' || h === 'duration' || h === 'preptime');
  const servingsIdx = normalizedHeaders.findIndex(h => h === 'servings' || h === 'yield' || h === 'portion');
  const imageIdx = normalizedHeaders.findIndex(h => h === 'image' || h === 'photo' || h === 'img' || h === 'cover');
  const descIdx = normalizedHeaders.findIndex(h => h === 'description' || h === 'desc' || h === 'summary');

  const startIndex = (recipeIdx !== -1 || folderIdx !== -1) ? 1 : 0;
  const recipes: RecipeMeta[] = [];

  for (let i = startIndex; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!line || line.startsWith('#')) continue;

    const cols = parseCsvRow(line);
    const rName = (recipeIdx !== -1 && cols[recipeIdx]) ? cols[recipeIdx] : cols[0] || '';
    const rFolder = (folderIdx !== -1 && cols[folderIdx]) ? cols[folderIdx] : cols[1] || '';

    if (!rName && !rFolder) continue;

    const cleanedFolder = rFolder.replace(/^\/+|\/+$/g, '').trim();

    recipes.push({
      recipe: rName.trim(),
      rootFolder: cleanedFolder || rName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      category: categoryIdx !== -1 ? cols[categoryIdx] : undefined,
      cookTime: timeIdx !== -1 ? cols[timeIdx] : undefined,
      servings: servingsIdx !== -1 ? cols[servingsIdx] : undefined,
      image: imageIdx !== -1 ? cols[imageIdx] : undefined,
      description: descIdx !== -1 ? cols[descIdx] : undefined,
      rawLine: line
    });
  }

  return recipes;
}

/**
 * Parses fractional or decimal string (e.g., "1.5", "1/2", "1 1/2") into a float.
 */
export function parseQuantityNumber(val: string): number | undefined {
  if (!val) return undefined;
  const trimmed = val.trim();
  
  // Mixed fraction: "1 1/2"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const num = parseFloat(mixedMatch[2]);
    const den = parseFloat(mixedMatch[3]);
    if (den !== 0) return whole + num / den;
  }

  // Simple fraction: "1/2", "3/4"
  const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den !== 0) return num / den;
  }

  // Pure number or decimal
  const num = parseFloat(trimmed);
  if (!isNaN(num)) return num;

  return undefined;
}

/**
 * Formats a quantity nicely for cooking display (handles clean decimals or fractions).
 */
export function formatQuantity(num: number | undefined): string {
  if (num === undefined || isNaN(num)) return '';
  
  // Round close floating errors like 0.7500000000001
  const rounded = Math.round(num * 100) / 100;
  
  // Check common fractions
  const whole = Math.floor(rounded);
  const frac = Math.round((rounded - whole) * 100) / 100;
  
  if (frac === 0) return `${whole}`;
  if (frac === 0.25) return whole > 0 ? `${whole} ¼` : '¼';
  if (frac === 0.33 || frac === 0.34) return whole > 0 ? `${whole} ⅓` : '⅓';
  if (frac === 0.5) return whole > 0 ? `${whole} ½` : '½';
  if (frac === 0.66 || frac === 0.67) return whole > 0 ? `${whole} ⅔` : '⅔';
  if (frac === 0.75) return whole > 0 ? `${whole} ¾` : '¾';
  
  return rounded.toString();
}

/**
 * Parses ingredients.csv inside the recipe root folder.
 * Supports headers like `ingredient, quantity, unit, notes` or fallback.
 */
export function parseIngredientsCsv(csvText: string): Ingredient[] {
  if (!csvText || !csvText.trim()) return [];

  const rawLines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (rawLines.length === 0) return [];

  const headerCols = parseCsvRow(rawLines[0]);
  const normHeaders = headerCols.map(h => h.toLowerCase().replace(/[\s_-]+/g, ''));

  let itemIdx = normHeaders.findIndex(h => h === 'ingredient' || h === 'item' || h === 'name');
  let qtyIdx = normHeaders.findIndex(h => h === 'quantity' || h === 'amount' || h === 'qty' || h === 'count');
  let unitIdx = normHeaders.findIndex(h => h === 'unit' || h === 'measure' || h === 'measurement');
  let notesIdx = normHeaders.findIndex(h => h === 'notes' || h === 'note' || h === 'prep' || h === 'details');

  const hasRecognizedHeader = itemIdx !== -1 || qtyIdx !== -1;
  const startIdx = hasRecognizedHeader ? 1 : 0;

  if (!hasRecognizedHeader) {
    itemIdx = 0;
    qtyIdx = 1;
    unitIdx = 2;
    notesIdx = 3;
  }

  const ingredients: Ingredient[] = [];

  for (let i = startIdx; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!line || line.startsWith('#')) continue;

    const cols = parseCsvRow(line);
    const itemName = cols[itemIdx] || cols[0] || '';
    if (!itemName) continue;

    const rawQty = cols[qtyIdx] !== undefined ? cols[qtyIdx] : '';
    const rawUnit = cols[unitIdx] !== undefined ? cols[unitIdx] : '';
    const rawNotes = cols[notesIdx] !== undefined ? cols[notesIdx] : '';

    const parsedNum = parseQuantityNumber(rawQty);

    ingredients.push({
      id: `ing-${i}-${itemName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      ingredient: itemName,
      quantity: rawQty,
      baseQuantity: parsedNum,
      unit: rawUnit,
      notes: rawNotes,
      originalText: line
    });
  }

  return ingredients;
}
