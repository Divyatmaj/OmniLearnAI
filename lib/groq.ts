import Groq from 'groq-sdk';
import type { LearningContent } from '@/lib/types';
import { parseWorksheetContent, type WorksheetContent } from './worksheet-types';

/** Default chat model for learning content (strong, good at JSON). */
const CHAT_MODEL = 'llama-3.3-70b-versatile';

/** TTS: try Orpheus first; fall back to PlayAI if Orpheus requires terms acceptance. */
const TTS_ORPHEUS_MODEL = 'canopylabs/orpheus-v1-english';
const TTS_ORPHEUS_VOICE = 'hannah';
const TTS_PLAYAI_MODEL = 'playai-tts';
const TTS_PLAYAI_VOICE = 'Fritz-PlayAI';

/** Orpheus accepts max 200 chars; PlayAI allows longer but we keep responses small. */
const TTS_MAX_INPUT_LENGTH = 200;

function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error('GROQ_API_KEY is not set. Add it to .env.local.');
  }
  return new Groq({ apiKey });
}

export type { LearningContent };

export async function generateLearningContent(
  topic: string,
  difficulty: string,
  age: number,
  language: string
): Promise<LearningContent> {
  const groq = getGroq();

  const prompt = `
    Act as an elite multimodal educator. Generate a comprehensive learning module for the topic: "${topic}".

    Target Audience: Age ${age}
    Difficulty Level: ${difficulty}
    Output Language: ${language}

    You MUST return a JSON object with the following structure (no other text):
    {
      "topic": "The exact topic name",
      "explanation": "A high-fidelity markdown explanation suitable for the age group. Include formatting like bolding and bullet points.",
      "breakdown": ["Step 1 breakdown", "Step 2 breakdown", "Step 3 breakdown", "Step 4 breakdown", "Step 5 breakdown"],
      "diagramCode": "ONLY valid Mermaid 10 flowchart. Use: flowchart TD then lines like A[\"Label\"] --> B[\"Label\"]. All node text in double quotes. Max 6 nodes. No single quotes or unquoted spaces.",
      "quiz": [
        {
          "question": "Question 1",
          "options": ["A", "B", "C", "D"],
          "answer": "Correct Option Text",
          "explanation": "Why this is correct"
        }
      ],
      "accuracyNote": "A 1-sentence verification confirming scientific/historical accuracy based on current knowledge."
    }

    Ensure the tone is encouraging and the complexity matches the age ${age}. Output only the JSON object.
  `;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: 'You are a multimodal JSON educator. Output only valid JSON, no markdown code fences.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content;
  if (typeof raw !== 'string') {
    throw new Error('No content in model response.');
  }

  // Strip markdown code block if present
  const trimmed = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  try {
    return JSON.parse(trimmed) as LearningContent;
  } catch {
    throw new Error('Invalid JSON in model response. Please try again.');
  }
}

/**
 * Generate a conceptual Mermaid diagram using Groq that explains the whole process and all steps.
 * Uses the lesson content (topic, explanation, breakdown) so the diagram reflects every step clearly.
 * Returns raw Mermaid flowchart code (no JSON wrapper).
 */
export async function generateConceptualDiagram(content: LearningContent): Promise<string> {
  const groq = getGroq();
  const topic = content.topic;
  const explanation = content.explanation.substring(0, 2000);
  const steps = content.breakdown;
  const stepsBlock = steps.map((s, i) => `Step ${i + 1}: ${s}`).join('\n');

  const prompt = `You are a conceptual diagram generator. Create a Mermaid 10 flowchart that explains the WHOLE process of the topic and shows ALL steps clearly.

Topic: ${topic}

Explanation (summary of the concept):
${explanation}

Breakdown (each step must appear in the diagram):
${stepsBlock}

Rules for your output:
- Output ONLY the Mermaid code. No markdown code fences, no explanation, no other text.
- First line must be: flowchart TD
- Create one node for the topic, then one node for EACH step in order (Step 1, Step 2, Step 3, etc.), then a summary/outcome node if needed.
- Use arrows to show flow: A["Topic"] --> B["Step 1 label"] --> C["Step 2 label"] and so on.
- Every node label MUST be in double quotes. Use short labels (few words per node). Example: A["${topic}"] --> B["First step"] --> C["Second step"]
- You can use node IDs like A, B, C, D, E, F, G. Maximum 10 nodes.
- The diagram must cover the entire process so a student sees all steps at a glance.`;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You output only valid Mermaid 10 flowchart code. No markdown, no code fences, no extra text. First line is flowchart TD, then lines like X["Label"] --> Y["Label"].',
      },
      { role: 'user', content: prompt },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Groq returned no diagram content.');
  }

  const code = raw.replace(/^```(?:mermaid)?\s*\n?|\n?```$/g, '').trim();
  return code;
}

/**
 * Generate worksheet content using Groq (0 Gemini calls). Single request.
 */
export async function generateWorksheetContent(
  topic: string,
  difficulty: string
): Promise<WorksheetContent> {
  const groq = getGroq();

  const prompt = `Generate a school-style worksheet for topic: "${topic}". Difficulty: ${difficulty}.

Include: clear explanation of concepts, definitions, formulas, 3 solved examples with step-by-step solutions,
10 practice questions (sectionA: MCQ, sectionB: short answer, sectionC: long answer), 3 challenge problems.

Output ONLY valid JSON (no markdown, no code fences) in this exact structure:
{
  "title": "Worksheet title string",
  "explanation": {
    "overview": "Brief overview paragraph",
    "keyConcepts": ["concept1", "concept2"],
    "formulas": ["formula1", "formula2"],
    "examples": ["example1", "example2"]
  },
  "solvedExamples": [
    { "question": "Question text", "solution": "Step-by-step solution" }
  ],
  "practiceQuestions": {
    "sectionA": ["MCQ 1", "MCQ 2"],
    "sectionB": ["Short 1", "Short 2"],
    "sectionC": ["Long 1", "Long 2"]
  },
  "challengeQuestions": ["Challenge 1", "Challenge 2", "Challenge 3"]
}`;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: 'You output only valid JSON. No markdown, no code fences.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content;
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('No worksheet content in response.');
  }

  const trimmed = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  const parsed = parseWorksheetContent(trimmed);
  if (!parsed.title) parsed.title = topic;
  return parsed;
}

const MARKSHEET_SYSTEM_PROMPT = `You are an expert academic performance analyst, student mentor, and learning strategist.

Analyze the marksheet and provide a detailed, structured, personalized performance analysis.

Rules:
1. Identify weak subjects; categorize: <50% = Major Weakness, 50–65% = Moderate, 65–75% = Average, >75% = Strength.
2. Detect patterns across subjects; classify weaknesses: Conceptual Gap, Lack of Practice, Time Management, Exam Strategy, Carelessness.
3. Give subject-wise improvement strategies (specific, actionable).
4. Provide a 30-day action plan with weekly milestones.
5. Keep tone supportive and motivating. Avoid generic advice.
6. Use these exact headings in order:
1. 📊 Overall Performance Summary
2. 🔴 Major Weaknesses
3. 🟠 Moderate Weaknesses
4. 🟢 Strength Areas
5. 🧠 Pattern Analysis & Root Causes
6. 📘 Subject-wise Improvement Strategy
7. 📅 30-Day Focused Action Plan
8. 💬 Motivation & Confidence Boost

Use bullet points and short paragraphs. Output markdown.`;

/**
 * Generate full marksheet analysis using Groq (0 Gemini calls). Single request.
 */
export async function generateMarksheetAnalysis(input: {
  studentName: string;
  class: string;
  examType: string;
  subjects: { name: string; marks: number; maxMarks: number }[];
}): Promise<string> {
  const groq = getGroq();

  const marksLines = input.subjects
    .map((s) => {
      const pct = s.maxMarks > 0 ? Math.round((s.marks / s.maxMarks) * 100) : 0;
      return `${s.name} - ${s.marks} / ${s.maxMarks} (${pct}%)`;
    })
    .join('\n');

  const prompt = `Student Name: ${input.studentName}
Class/Grade: ${input.class}
Exam Type: ${input.examType}

Subjects and Marks:
${marksLines}

Provide the full analysis in the required format.`;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: MARKSHEET_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  });

  const text = response.choices[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Empty analysis response.');
  }
  return text.trim();
}

/** User-friendly error when Orpheus terms are not accepted. */
export const ORPHEUS_TERMS_MESSAGE =
  'Audio requires accepting the Orpheus model terms. Accept at: https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english';

export type AudioResult = { buffer: Buffer; contentType: 'audio/wav' | 'audio/mpeg' };

/**
 * Generate speech from text using Groq TTS.
 * Tries Orpheus first; if it requires terms acceptance, tries PlayAI TTS instead.
 * Returns buffer and content type (WAV for Orpheus, MP3 for PlayAI).
 */
export async function generateAudio(text: string): Promise<AudioResult> {
  const groq = getGroq();
  const input = text.slice(0, TTS_MAX_INPUT_LENGTH);
  if (!input.trim()) {
    throw new Error('Text for audio is empty after trimming.');
  }

  const tryOrpheus = async (): Promise<AudioResult> => {
    const response = await groq.audio.speech.create({
      model: TTS_ORPHEUS_MODEL,
      voice: TTS_ORPHEUS_VOICE,
      input,
      response_format: 'wav',
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, contentType: 'audio/wav' };
  };

  const tryPlayAI = async (): Promise<AudioResult> => {
    const response = await groq.audio.speech.create({
      model: TTS_PLAYAI_MODEL,
      voice: TTS_PLAYAI_VOICE,
      input,
      response_format: 'mp3',
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, contentType: 'audio/mpeg' };
  };

  try {
    return await tryOrpheus();
  } catch (err: unknown) {
    const errObj = err as { error?: { code?: string }; message?: string };
    const code = errObj?.error?.code;
    const msg = typeof errObj?.message === 'string' ? errObj.message : '';
    const needsTerms =
      code === 'model_terms_required' ||
      msg.includes('terms acceptance') ||
      msg.includes('model_terms_required');
    if (needsTerms) {
      try {
        return await tryPlayAI();
      } catch {
        throw new Error(ORPHEUS_TERMS_MESSAGE);
      }
    }
    throw err;
  }
}
