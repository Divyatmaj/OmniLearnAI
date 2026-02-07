/** Single quiz question shape (used by LearningContent and QuizSection). */
export type QuizItem = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type LearningContent = {
  topic: string;
  explanation: string;
  breakdown: string[];
  diagramCode: string;
  quiz: QuizItem[];
  accuracyNote: string;
  /** Video explanation script (e.g. from Gemini). Used for TTS when present. */
  videoScript?: string;
  /** Stability AI: base64 data URL of generated lesson image (keyframe). */
  videoImageDataUrl?: string;
  /** Stability AI or Veo 3 (Gemini): base64 data URL of generated MP4 video. */
  videoDataUrl?: string;
};

export function isLearningContent(data: unknown): data is LearningContent {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.topic === 'string' &&
    typeof o.explanation === 'string' &&
    Array.isArray(o.breakdown) &&
    o.breakdown.every((s): s is string => typeof s === 'string') &&
    typeof o.diagramCode === 'string' &&
    Array.isArray(o.quiz) &&
    o.quiz.every(
      (q) =>
        q &&
        typeof q === 'object' &&
        typeof (q as Record<string, unknown>).question === 'string' &&
        Array.isArray((q as Record<string, unknown>).options) &&
        typeof (q as Record<string, unknown>).answer === 'string' &&
        typeof (q as Record<string, unknown>).explanation === 'string'
    ) &&
    typeof o.accuracyNote === 'string' &&
    (o.videoScript === undefined || typeof o.videoScript === 'string') &&
    (o.videoImageDataUrl === undefined || typeof o.videoImageDataUrl === 'string') &&
    (o.videoDataUrl === undefined || typeof o.videoDataUrl === 'string')
  );
}
