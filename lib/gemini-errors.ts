/**
 * Gemini API error handling: normalize to clear user-facing messages.
 * Uses gemini-2.0-flash (supported on current API; 1.5 models are deprecated/unavailable).
 * GEMINI_API_KEY must be set.
 */

export const GEMINI_MODEL = 'gemini-2.0-flash' as const;

export const GEMINI_ERROR_MESSAGES = {
  MISSING_API_KEY: 'Missing API key: Add GEMINI_API_KEY to .env.local.',
  QUOTA_EXCEEDED:
    'Gemini API quota exceeded. The app limits requests to 5 per minute. If you just added a new key, restart the dev server and try again. Check your quota at https://aistudio.google.com/.',
  MODEL_NOT_FOUND: 'Gemini model not available. Please try again later.',
} as const;

/**
 * Returns true if GEMINI_API_KEY is set and non-empty.
 */
export function hasGeminiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

/**
 * Get a user-facing error message and HTTP status for a Gemini/worksheet error.
 * Log the full error to console before calling this in the route.
 */
export function getGeminiErrorResponse(error: unknown): { message: string; status: number } {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (!hasGeminiApiKey() || lower.includes('api key') || lower.includes('gemini_api_key')) {
    return { message: GEMINI_ERROR_MESSAGES.MISSING_API_KEY, status: 503 };
  }
  if (lower.includes('quota') || lower.includes('429') || lower.includes('resource exhausted') || lower.includes('rate limit')) {
    return { message: GEMINI_ERROR_MESSAGES.QUOTA_EXCEEDED, status: 503 };
  }
  if (lower.includes('not found') || lower.includes('404') || lower.includes('model') || lower.includes('invalid model')) {
    return { message: GEMINI_ERROR_MESSAGES.MODEL_NOT_FOUND, status: 503 };
  }

  return { message: raw, status: 500 };
}
