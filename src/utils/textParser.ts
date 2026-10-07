import { RecipeStep } from '../types/recipe';

/**
 * Detects cooking time phrases like "15 minutes", "2 hours", "90 seconds", "6 to 8 minutes"
 * and returns the duration in seconds along with the matched string.
 */
export function extractCookingTimer(text: string): { seconds: number; text: string } | null {
  // Regex to match "X to Y minutes", "X minutes", "X min", "X seconds", "X sec", "X hours", "X hrs"
  const rangeMinRegex = /\b(\d+)\s*(?:-|to)\s*(\d+)\s*(?:minutes|minute|mins|min)\b/i;
  const rangeMatch = text.match(rangeMinRegex);
  if (rangeMatch) {
    const maxMinutes = parseInt(rangeMatch[2], 10);
    return {
      seconds: maxMinutes * 60,
      text: rangeMatch[0]
    };
  }

  const hourRegex = /\b(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr)\b/i;
  const hourMatch = text.match(hourRegex);
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1]);
    return {
      seconds: Math.round(hours * 3600),
      text: hourMatch[0]
    };
  }

  const minuteRegex = /\b(\d+)\s*(?:minutes|minute|mins|min)\b/i;
  const minMatch = text.match(minuteRegex);
  if (minMatch) {
    const mins = parseInt(minMatch[1], 10);
    return {
      seconds: mins * 60,
      text: minMatch[0]
    };
  }

  const secRegex = /\b(\d+)\s*(?:seconds|second|secs|sec)\b/i;
  const secMatch = text.match(secRegex);
  if (secMatch) {
    const secs = parseInt(secMatch[1], 10);
    return {
      seconds: secs,
      text: secMatch[0]
    };
  }

  return null;
}

/**
 * Parses process.txt into an array of structured RecipeSteps.
 * Handles numbered lines, labeled steps (e.g. "Step 1: ..."), titles, and paragraphs.
 */
export function parseProcessTxt(txt: string): RecipeStep[] {
  if (!txt || !txt.trim()) return [];

  // Normalize newlines
  const normalized = txt.replace(/\r\n/g, '\n').trim();

  // Try splitting by step numbers first: e.g. "1. ", "Step 1:", "1) "
  // or double newlines
  const stepBlocks: string[] = [];

  // Check if text has numbered items like "1.", "1)", "Step 1:"
  const numberedPattern = /(?:^|\n)(?=(?:Step\s*\d+[:.]?|\d+[\.\)])\s*)/gi;
  const splitChunks = normalized.split(numberedPattern).map(s => s.trim()).filter(Boolean);

  if (splitChunks.length > 1) {
    for (const chunk of splitChunks) {
      stepBlocks.push(chunk);
    }
  } else {
    // Fall back to splitting by double linebreaks or non-empty single linebreaks
    const paraChunks = normalized.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    if (paraChunks.length > 1) {
      stepBlocks.push(...paraChunks);
    } else {
      // Split by single line breaks if each is a sentence or bullet
      const lines = normalized.split('\n').map(s => s.trim()).filter(Boolean);
      stepBlocks.push(...lines);
    }
  }

  const steps: RecipeStep[] = [];

  stepBlocks.forEach((block, index) => {
    let cleanBlock = block;
    let stepTitle: string | undefined;

    // Check if starts with number e.g. "1. " or "Step 1: "
    const numPrefixMatch = cleanBlock.match(/^(?:Step\s*)?(\d+)[\.\):\s-]+/i);
    if (numPrefixMatch) {
      cleanBlock = cleanBlock.replace(/^(?:Step\s*)?(\d+)[\.\):\s-]+/, '').trim();
    }

    // Check if the first line or first segment is a step title, e.g. "Preparing the Sauce:\nBlend..."
    const titleMatch = cleanBlock.match(/^([A-Z0-9\s&,/-]{3,40}):\s*([\s\S]*)$/i);
    if (titleMatch) {
      stepTitle = titleMatch[1].trim();
      cleanBlock = titleMatch[2].trim();
    } else {
      // Check if first line before newline looks like a title
      const firstLineBreak = cleanBlock.indexOf('\n');
      if (firstLineBreak !== -1 && firstLineBreak <= 50) {
        const potentialTitle = cleanBlock.slice(0, firstLineBreak).trim();
        if (potentialTitle.endsWith(':') || (!potentialTitle.includes('.') && potentialTitle.length < 40)) {
          stepTitle = potentialTitle.replace(/:$/, '').trim();
          cleanBlock = cleanBlock.slice(firstLineBreak + 1).trim();
        }
      }
    }

    const timerInfo = extractCookingTimer(cleanBlock);

    steps.push({
      id: `step-${index + 1}`,
      stepNumber: index + 1,
      title: stepTitle,
      instruction: cleanBlock || block,
      detectedTimerSeconds: timerInfo?.seconds,
      detectedTimerText: timerInfo?.text
    });
  });

  return steps;
}
