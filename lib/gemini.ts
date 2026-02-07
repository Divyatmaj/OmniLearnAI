import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODEL, GEMINI_ERROR_MESSAGES } from './gemini-errors';
import { withGeminiRateLimit } from './gemini-rate-limit';

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(GEMINI_ERROR_MESSAGES.MISSING_API_KEY);
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate a video explanation script from the lesson content (topic + explanation/breakdown).
 * When explanation/breakdown are provided, the script aligns with the lesson; otherwise topic-only.
 */
export async function geminiVideoExplanation(
  topic: string,
  context?: { explanation?: string; breakdown?: string[] }
): Promise<string> {
  try {
    return await withGeminiRateLimit(async () => {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const contextBlock =
        context?.explanation || context?.breakdown?.length
          ? `
Lesson content to turn into a short video script (same ideas, visual and step-by-step):
${context.explanation ? `Explanation:\n${context.explanation.substring(0, 2000)}\n` : ''}
${context.breakdown?.length ? `Steps: ${context.breakdown.join(' → ')}\n` : ''}
`
          : '';

      const prompt = `
Create a short video explanation script for students (2–4 sentences, under 200 characters preferred for TTS).
Make it simple, visual, and step-by-step. Focus on the key idea.
Topic: ${topic}
${contextBlock}
Output only the script text, no labels or markdown.
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text() ?? '';
      text = text.trim();
      if (text.length > 400) text = text.substring(0, 397) + '...';
      return text;
    });
  } catch (e) {
    console.error('Gemini video explanation error (full):', e);
    const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
    if (!msg.includes('api key') && !msg.includes('gemini_api_key')) {
      if (msg.includes('quota') || msg.includes('429') || msg.includes('resource exhausted')) {
        throw new Error(GEMINI_ERROR_MESSAGES.QUOTA_EXCEEDED);
      }
      if (msg.includes('not found') || msg.includes('404') || msg.includes('model')) {
        throw new Error(GEMINI_ERROR_MESSAGES.MODEL_NOT_FOUND);
      }
    }
    throw e;
  }
}

/**
 * Generate an ASCII/concept diagram (boxes, arrows, hierarchy) for a topic.
 */
export async function geminiConceptDiagram(topic: string): Promise<string> {
  try {
    return await withGeminiRateLimit(async () => {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const prompt = `
Create a clear ASCII diagram / concept map / flowchart for the topic: ${topic}.
Use boxes, arrows, and hierarchy.
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return text ?? '';
    });
  } catch (e) {
    console.error('Gemini concept diagram error (full):', e);
    const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
    if (!msg.includes('api key') && !msg.includes('gemini_api_key')) {
      if (msg.includes('quota') || msg.includes('429') || msg.includes('resource exhausted')) {
        throw new Error(GEMINI_ERROR_MESSAGES.QUOTA_EXCEEDED);
      }
      if (msg.includes('not found') || msg.includes('404') || msg.includes('model')) {
        throw new Error(GEMINI_ERROR_MESSAGES.MODEL_NOT_FOUND);
      }
    }
    throw e;
  }
}

/**
 * Generate Mermaid flowchart code for the lesson (topic + optional explanation context).
 * Output is validated by the caller; only Gemini is used for diagrams—never Groq.
 */
export async function geminiMermaidDiagram(
  topic: string,
  context?: { explanation?: string }
): Promise<string> {
  try {
    return await withGeminiRateLimit(async () => {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const contextBlock = context?.explanation
        ? `\nLesson summary (diagram should reflect these concepts):\n${context.explanation.substring(0, 1200)}\n`
        : '';

      const prompt = `You are a Mermaid diagram generator. Output ONLY valid Mermaid 10 flowchart code. No markdown, no code fences, no explanation.

Topic: ${topic}
${contextBlock}

Rules:
- First line must be exactly: flowchart TD
- Then use only lines of the form: NODEID["Label text"] --> NODEID["Label text"]
- Use only letters A,B,C,D,E,F as node IDs (e.g. A["Start"] --> B["Step 1"] --> C["End"]).
- Every label must be in double quotes. No unquoted text, no single quotes.
- Maximum 6 nodes. Keep labels short (2-4 words).
- No other characters or lines.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text() ?? '';
      text = text.replace(/^```(?:mermaid)?\s*\n?|\n?```$/g, '').trim();
      return text;
    });
  } catch (e) {
    console.error('Gemini Mermaid diagram error (full):', e);
    const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
    if (!msg.includes('api key') && !msg.includes('gemini_api_key')) {
      if (msg.includes('quota') || msg.includes('429') || msg.includes('resource exhausted')) {
        throw new Error(GEMINI_ERROR_MESSAGES.QUOTA_EXCEEDED);
      }
      if (msg.includes('not found') || msg.includes('404') || msg.includes('model')) {
        throw new Error(GEMINI_ERROR_MESSAGES.MODEL_NOT_FOUND);
      }
    }
    throw e;
  }
}
