/**
 * Structured worksheet content (AI-generated, stored in DB as JSON string).
 */

export interface WorksheetExplanation {
  overview: string;
  keyConcepts: string[];
  formulas: string[];
  examples: string[];
}

export interface SolvedExample {
  question: string;
  solution: string;
}

export interface PracticeQuestions {
  sectionA: string[]; // MCQs
  sectionB: string[]; // Short answer
  sectionC: string[]; // Long answer
}

export interface WorksheetContent {
  title: string;
  explanation: WorksheetExplanation;
  solvedExamples: SolvedExample[];
  practiceQuestions: PracticeQuestions;
  challengeQuestions: string[];
}

const DEFAULT_EXPLANATION: WorksheetExplanation = {
  overview: '',
  keyConcepts: [],
  formulas: [],
  examples: [],
};

const DEFAULT_PRACTICE: PracticeQuestions = {
  sectionA: [],
  sectionB: [],
  sectionC: [],
};

export const DEFAULT_WORKSHEET_CONTENT: WorksheetContent = {
  title: '',
  explanation: DEFAULT_EXPLANATION,
  solvedExamples: [],
  practiceQuestions: DEFAULT_PRACTICE,
  challengeQuestions: [],
};

/** Parse stored content string; return default shape if invalid. */
export function parseWorksheetContent(raw: string | null | undefined): WorksheetContent {
  if (typeof raw !== 'string' || !raw.trim()) return { ...DEFAULT_WORKSHEET_CONTENT };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_WORKSHEET_CONTENT };
    const p = parsed as Record<string, unknown>;
    return {
      title: typeof p.title === 'string' ? p.title : '',
      explanation:
        p.explanation && typeof p.explanation === 'object'
          ? {
              overview: typeof (p.explanation as Record<string, unknown>).overview === 'string' ? (p.explanation as Record<string, unknown>).overview as string : '',
              keyConcepts: Array.isArray((p.explanation as Record<string, unknown>).keyConcepts) ? ((p.explanation as Record<string, unknown>).keyConcepts as string[]) : [],
              formulas: Array.isArray((p.explanation as Record<string, unknown>).formulas) ? ((p.explanation as Record<string, unknown>).formulas as string[]) : [],
              examples: Array.isArray((p.explanation as Record<string, unknown>).examples) ? ((p.explanation as Record<string, unknown>).examples as string[]) : [],
            }
          : DEFAULT_EXPLANATION,
      solvedExamples: Array.isArray(p.solvedExamples)
        ? (p.solvedExamples as unknown[]).filter(
            (x): x is SolvedExample =>
              x != null && typeof x === 'object' && typeof (x as SolvedExample).question === 'string' && typeof (x as SolvedExample).solution === 'string'
          )
        : [],
      practiceQuestions:
        p.practiceQuestions && typeof p.practiceQuestions === 'object'
          ? {
              sectionA: Array.isArray((p.practiceQuestions as Record<string, unknown>).sectionA) ? ((p.practiceQuestions as Record<string, unknown>).sectionA as string[]) : [],
              sectionB: Array.isArray((p.practiceQuestions as Record<string, unknown>).sectionB) ? ((p.practiceQuestions as Record<string, unknown>).sectionB as string[]) : [],
              sectionC: Array.isArray((p.practiceQuestions as Record<string, unknown>).sectionC) ? ((p.practiceQuestions as Record<string, unknown>).sectionC as string[]) : [],
            }
          : DEFAULT_PRACTICE,
      challengeQuestions: Array.isArray(p.challengeQuestions) ? (p.challengeQuestions as string[]) : [],
    };
  } catch {
    return { ...DEFAULT_WORKSHEET_CONTENT };
  }
}
