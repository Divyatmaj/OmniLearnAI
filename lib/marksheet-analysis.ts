/**
 * Academic marksheet analysis: performance categories, root causes, strategies, 30-day plan.
 * Uses Groq (1 request, 0 Gemini calls).
 */

import { generateMarksheetAnalysis as groqGenerateMarksheet } from './groq';

export type MarksheetSubject = {
  name: string;
  marks: number;
  maxMarks: number;
};

export type MarksheetInput = {
  studentName: string;
  class: string;
  examType: string;
  subjects: MarksheetSubject[];
};

/**
 * Generate full marksheet analysis. Delegates to Groq.
 */
export async function generateMarksheetAnalysis(input: MarksheetInput): Promise<string> {
  return groqGenerateMarksheet(input);
}
