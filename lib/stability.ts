/**
 * Stability AI integration: text-to-image and (when available) image-to-video.
 * Set STABILITY_API_KEY in .env.local to enable.
 * Uses the educational video prompt (with user placeholders) for generation.
 */

import type { LearningContent } from '@/lib/types';
import { condensedPromptForImage } from '@/lib/stability-prompts';

const STABILITY_BASE = 'https://api.stability.ai';
const ENGINE_TXT2IMG = 'stable-diffusion-xl-1024-v1-0';

function getApiKey(): string {
  const key = process.env.STABILITY_API_KEY?.trim();
  if (!key) {
    throw new Error('STABILITY_API_KEY is not set. Add it to .env.local for video generation.');
  }
  return key;
}

export type StabilityImageResult = {
  buffer: Buffer;
  mimeType: 'image/png';
};

/**
 * Generate an image from a text prompt using Stability AI v1 text-to-image (SDXL).
 * Used as the keyframe for the lesson "video" (shown with TTS in VideoVisualizer).
 */
export async function stabilityTextToImage(
  prompt: string,
  options?: { width?: number; height?: number }
): Promise<StabilityImageResult> {
  const apiKey = getApiKey();

  const body = {
    text_prompts: [{ text: prompt, weight: 1 }],
    cfg_scale: 7,
    height: options?.height ?? 768,
    width: options?.width ?? 1344,
    sampler: 'K_EULER',
    samples: 1,
    steps: 30,
    style_preset: 'digital-art',
  };

  const res = await fetch(`${STABILITY_BASE}/v1/generation/${ENGINE_TXT2IMG}/text-to-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'Stability-Client-ID': 'omnilearn-ai',
      'Stability-Client-Version': '1.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Stability API error ${res.status}: ${errText || res.statusText}`);
  }

  const data = (await res.json()) as {
    artifacts?: Array<{ base64?: string; finishReason?: string }>;
  };
  const artifact = data.artifacts?.[0];
  if (!artifact?.base64) {
    throw new Error('Stability API returned no image.');
  }
  const reason = artifact.finishReason;
  if (reason === 'CONTENT_FILTERED') {
    throw new Error('Stability content filter: try a different topic or prompt.');
  }
  if (reason && reason !== 'SUCCESS') {
    throw new Error(`Stability API finish reason: ${reason}`);
  }

  const buffer = Buffer.from(artifact.base64, 'base64');
  return { buffer, mimeType: 'image/png' };
}

export type StabilityVideoResult = {
  buffer: Buffer;
  mimeType: 'video/mp4';
};

/**
 * Generate a short video from an image (image-to-video).
 * Note: Stability's hosted Stable Video Diffusion API was deprecated (July 2025).
 * The endpoint typically returns 404/403/410. We try once and return null so the app can show Veo or keyframe only.
 */
export async function stabilityImageToVideo(imageBuffer: Buffer): Promise<StabilityVideoResult | null> {
  const apiKey = getApiKey();

  const form = new FormData();
  form.append('image', new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' }), 'frame.png');
  form.append('motion_bucket_id', '40');
  form.append('seed', '0');

  try {
    const res = await fetch(`${STABILITY_BASE}/v2beta/stable-image/image-to-video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Stability-Client-ID': 'omnilearn-ai',
        'Stability-Client-Version': '1.0.0',
      },
      body: form,
    });

    // Hosted video API deprecated; treat as "no video" and let UI use Veo or keyframe
    if (res.status === 404 || res.status === 403 || res.status === 410 || res.status === 501) {
      return null;
    }
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Stability video API error ${res.status}: ${errText || res.statusText}`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      await res.text(); // consume body so connection can be reused
      return null;
    }

    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length === 0) {
      return null;
    }
    return { buffer, mimeType: 'video/mp4' };
  } catch (e) {
    if (e instanceof Error && (e.message.includes('404') || e.message.includes('403') || e.message.includes('410'))) {
      return null;
    }
    throw e;
  }
}

/** Max prompt length for Stability text-to-image (safe limit). */
const PROMPT_MAX_LENGTH = 2000;

/**
 * Generate a lesson visual: one keyframe image from Stability (condensed educational prompt) and optionally video.
 * Uses condensed single-image prompt for better Stability results; image-to-video is tried but often unavailable (deprecated API).
 */
export async function generateLessonVideo(
  content: LearningContent,
  options?: { tryVideo?: boolean }
): Promise<{ imageDataUrl: string; videoDataUrl?: string }> {
  const fullPrompt = condensedPromptForImage(content);
  const prompt =
    fullPrompt.length <= PROMPT_MAX_LENGTH
      ? fullPrompt
      : fullPrompt.substring(0, PROMPT_MAX_LENGTH - 3) + '...';

  const { buffer: imageBuffer } = await stabilityTextToImage(prompt);

  const imageDataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  let videoDataUrl: string | undefined;
  if (options?.tryVideo) {
    const videoResult = await stabilityImageToVideo(imageBuffer);
    if (videoResult) {
      videoDataUrl = `data:video/mp4;base64,${videoResult.buffer.toString('base64')}`;
    }
  }

  return { imageDataUrl, videoDataUrl };
}
