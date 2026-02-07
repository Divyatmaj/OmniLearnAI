/**
 * Worksheet content generation. Uses Groq (1 request, 0 Gemini).
 * Re-exports from groq for backward compatibility.
 */

import { generateWorksheetContent as groqGenerateWorksheet } from './groq';
import type { WorksheetContent } from './worksheet-types';

export async function generateWorksheetContent(
  topic: string,
  difficulty: string
): Promise<WorksheetContent> {
  return groqGenerateWorksheet(topic, difficulty);
}
