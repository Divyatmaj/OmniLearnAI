/**
 * Global rate limiter for Gemini API (and Veo via same quota).
 * - Max 3 concurrent requests.
 * - Max 5 requests per 60 seconds (RPM) to stay under free-tier quota.
 * - On 429/quota error: retry once after 65 seconds.
 */

const MAX_CONCURRENT = 3;
const MAX_PER_MINUTE = 5;
const WINDOW_MS = 60_000;
const RETRY_AFTER_MS = 65_000;

let inFlight = 0;
const requestStartTimes: number[] = [];
const queue: Array<() => void> = [];

function isQuotaError(e: unknown): boolean {
  const msg = String(e instanceof Error ? e.message : e).toLowerCase();
  return (
    msg.includes('quota') ||
    msg.includes('429') ||
    msg.includes('resource exhausted') ||
    msg.includes('rate limit')
  );
}

/** Wait until we're under the per-minute limit, then record start time. */
async function waitForRpmSlot(): Promise<void> {
  for (;;) {
    const now = Date.now();
    const cutoff = now - WINDOW_MS;
    while (requestStartTimes.length > 0 && requestStartTimes[0] <= cutoff) {
      requestStartTimes.shift();
    }
    if (requestStartTimes.length < MAX_PER_MINUTE) {
      requestStartTimes.push(now);
      return;
    }
    const waitMs = Math.min(
      requestStartTimes[0] + WINDOW_MS - now + 200,
      WINDOW_MS
    );
    await new Promise((r) => setTimeout(r, Math.max(1000, waitMs)));
  }
}

function release(): void {
  inFlight--;
  if (queue.length > 0 && inFlight < MAX_CONCURRENT) {
    const next = queue.shift();
    if (next) next();
  }
}

/**
 * Run a Gemini (or Veo) API call with concurrency + RPM limit. Retries once on quota error after 65s.
 */
export async function withGeminiRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const run = async (): Promise<void> => {
      await waitForRpmSlot();
      inFlight++;
      try {
        let result: T;
        try {
          result = await fn();
        } catch (e) {
          if (isQuotaError(e)) {
            await new Promise((r) => setTimeout(r, RETRY_AFTER_MS));
            result = await fn();
          } else {
            throw e;
          }
        }
        resolve(result);
      } catch (e) {
        reject(e);
      } finally {
        release();
      }
    };
    if (inFlight < MAX_CONCURRENT) {
      run();
    } else {
      queue.push(run);
    }
  });
}
