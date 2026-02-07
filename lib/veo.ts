/**
 * Google Veo 3 video generation via Gemini API.
 * Used as fallback when Stability AI does not produce video.
 * Requires GEMINI_API_KEY (same as for Gemini text/diagrams).
 */

import { GoogleGenAI } from '@google/genai/node';
import type { LearningContent } from '@/lib/types';
import { withGeminiRateLimit } from '@/lib/gemini-rate-limit';

const VEO_MODEL = 'veo-3.1-generate-preview';
const POLL_INTERVAL_MS = 10_000;
const MAX_POLL_WAIT_MS = 300_000; // 5 min max

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set. Add it to .env.local for Veo video generation.');
  }
  return key;
}

/**
 * Build a short, cinematic prompt for Veo from lesson content (topic + script).
 */
function buildVeoPrompt(content: LearningContent): string {
  const topic = content.topic;
  const script = content.videoScript ?? content.explanation;
  const short = typeof script === 'string' ? script.substring(0, 500).trim() : '';
  return `Educational explainer video. Topic: ${topic}. ${short ? `Content: ${short}` : ''} Clean, modern style, 16:9. No text overlays.`;
}

export type VeoResult = {
  videoDataUrl: string;
};

/**
 * Generate a short lesson video using Veo 3 via the Gemini API.
 * Returns a data URL for the MP4, or null on failure or missing key.
 */
export async function generateVeoVideo(content: LearningContent): Promise<VeoResult | null> {
  return withGeminiRateLimit(async () => {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = buildVeoPrompt(content);

    try {
      let operation = await ai.models.generateVideos({
        model: VEO_MODEL,
        prompt,
        config: {
          aspectRatio: '16:9',
          resolution: '720p',
          durationSeconds: 6,
        },
      });

    const deadline = Date.now() + MAX_POLL_WAIT_MS;
    while (!operation.done && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (!operation.done || !operation.response?.generatedVideos?.length) {
      return null;
    }

    const generated = operation.response.generatedVideos[0];
    const video = generated?.video;
    if (!video) return null;

    let buffer: Buffer;
    if (video.videoBytes) {
      buffer = Buffer.from(video.videoBytes, 'base64');
    } else if (video.uri) {
      // Download from URI (e.g. generativelanguage.googleapis.com/...)
      const res = await fetch(video.uri, {
        headers: { 'x-goog-api-key': apiKey },
      });
      if (!res.ok) return null;
      const ab = await res.arrayBuffer();
      buffer = Buffer.from(ab);
    } else {
      return null;
    }

    const mimeType = video.mimeType ?? 'video/mp4';
    const videoDataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    return { videoDataUrl };
    } catch (e) {
      console.warn('Veo video generation failed:', e instanceof Error ? e.message : e);
      return null;
    }
  });
}
