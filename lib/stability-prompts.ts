/**
 * Educational video prompt for Stability AI.
 * Placeholders are replaced with user/lesson content when generating the image.
 */

import type { LearningContent } from '@/lib/types';

const EDUCATIONAL_VIDEO_PROMPT_TEMPLATE = `Generate a high-quality, visually appealing educational video explaining the topic "{{TOPIC_NAME}}".

🎬 Overall Style

• Modern educational explainer
• Smooth transitions
• Clean, bright colors
• Clear diagrams, labels, arrows
• Real-world examples
• Calm professional voiceover (if supported)

🧩 VIDEO STRUCTURE
1. Title Scene

• Animated text: "Understanding {{TOPIC_NAME}}"
• Soft glowing math/graphics background
• Slow camera pan-in

2. Simple Definition

Show a clean chalkboard-style text:

"{{TOPIC_NAME}} is {{SHORT_DEFINITION}}"

Visuals:
• Icons, symbols, shapes
• Soft animations explaining the concept
• Highlight key terms

3. Step-by-Step Explanation

Display:
• Animated diagrams
• Labels
• Step-by-step breakdown of the concept
• Arrows pointing to important parts
• Visual examples to make understanding easy

Text overlay:
• "Step 1: {{STEP_1}}"
• "Step 2: {{STEP_2}}"
• "Step 3: {{STEP_3}}"

4. Mathematical Use Case (For Math Topics Only)

Show real-life scenes like:
• Engineering
• Finance
• Physics
• Architecture
• Data science
• Daily life scenarios

Include animated formula overlay:
"Formula: {{FORMULA}}"
Highlight where each variable is applied.

5. Real-World Application Scene

Show three real-world applications with animations:
• "Application 1: {{APPLICATION_1}}"
• "Application 2: {{APPLICATION_2}}"
• "Application 3: {{APPLICATION_3}}"

Camera style: slow zoom + motion graphics.

6. Summary Scene

Visual: Soft glowing background
Text overlay:
"In summary, {{TOPIC_NAME}} helps us {{SUMMARY_STATEMENT}}."

Add icons, checkmarks, and a closing animation.

7. Outro

• Clean ending frame
• Text: "Learn Smart with OmniLearnAI"
• Smooth fade-out

Visual Style Keywords

"high-resolution, modern educational design, 3D motion graphics, kinetic typography, futuristic UI overlays, glowing lines, smooth camera pans, clean gradients, crisp labels, cinematic look"

Voiceover (If Available)

Explain in simple, friendly language:
• What {{TOPIC_NAME}} means
• Why it matters
• How it is used in real life
• One quick example"`;

/** Strip markdown and truncate to a short paragraph. */
function stripMarkdown(text: string, maxLength: number = 400): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, maxLength);
}

/** Make a string safe for Stability prompt (no double quotes, no long runs of special chars). */
function promptSafe(value: string, maxLen: number = 200): string {
  return value
    .replace(/"/g, "'")
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLen);
}

/** Get first sentence(s) of explanation as short definition. */
function getShortDefinition(explanation: string): string {
  const cleaned = stripMarkdown(explanation, 300);
  const firstSentence = cleaned.split(/[.!?]/)[0]?.trim();
  if (firstSentence) return firstSentence + (cleaned.includes('.') ? '.' : '');
  return cleaned || 'a key concept in this lesson.';
}

/** Get summary statement (last meaningful sentence or short summary). */
function getSummaryStatement(explanation: string, topic: string): string {
  const cleaned = stripMarkdown(explanation, 500);
  const sentences = cleaned.split(/[.!?]+/).filter(Boolean);
  const last = sentences[sentences.length - 1]?.trim();
  if (last && last.length > 20) return last + (cleaned.endsWith('.') ? '' : '.');
  return `understand and apply ${topic} in practice.`;
}

/** Try to find a formula-like substring in the explanation. */
function extractFormula(explanation: string): string {
  const formulaMatch = explanation.match(/\$[^$]+\$|(?:formula|equation|equals?)[:\s]*([^\n.]+)/i);
  if (formulaMatch) return (formulaMatch[1] || formulaMatch[0] || '').trim().substring(0, 80);
  return 'as shown in the lesson';
}

/** Derive three application points from breakdown or explanation. */
function getApplications(breakdown: string[], explanation: string): [string, string, string] {
  const fromBreakdown = breakdown.slice(0, 3).map((s) => stripMarkdown(s, 60));
  if (fromBreakdown.length >= 3)
    return [fromBreakdown[0], fromBreakdown[1], fromBreakdown[2]] as [string, string, string];
  const sentences = stripMarkdown(explanation, 400).split(/[.!?]+/).filter(Boolean);
  const a1 = fromBreakdown[0] || sentences[0]?.trim() || 'Understanding the basics';
  const a2 = fromBreakdown[1] || sentences[1]?.trim() || 'Applying the concept';
  const a3 = fromBreakdown[2] || sentences[2]?.trim() || 'Real-world use';
  return [a1, a2, a3];
}

export type PromptPlaceholders = {
  TOPIC_NAME: string;
  SHORT_DEFINITION: string;
  STEP_1: string;
  STEP_2: string;
  STEP_3: string;
  FORMULA: string;
  APPLICATION_1: string;
  APPLICATION_2: string;
  APPLICATION_3: string;
  SUMMARY_STATEMENT: string;
};

/**
 * Build placeholder values from learning content. Values are sanitized for use in Stability prompts.
 */
export function buildPlaceholders(content: LearningContent): PromptPlaceholders {
  const topic = promptSafe(content.topic, 80);
  const def = promptSafe(getShortDefinition(content.explanation), 200);
  const steps = content.breakdown;
  const step1 = steps[0] ? promptSafe(stripMarkdown(steps[0], 80), 80) : 'Introduce the concept';
  const step2 = steps[1] ? promptSafe(stripMarkdown(steps[1], 80), 80) : 'Break it down';
  const step3 = steps[2] ? promptSafe(stripMarkdown(steps[2], 80), 80) : 'Apply and summarize';
  const [app1, app2, app3] = getApplications(content.breakdown, content.explanation);
  return {
    TOPIC_NAME: topic || 'Topic',
    SHORT_DEFINITION: def || 'a key concept in this lesson.',
    STEP_1: step1,
    STEP_2: step2,
    STEP_3: step3,
    FORMULA: promptSafe(extractFormula(content.explanation), 80),
    APPLICATION_1: promptSafe(app1, 60),
    APPLICATION_2: promptSafe(app2, 60),
    APPLICATION_3: promptSafe(app3, 60),
    SUMMARY_STATEMENT: promptSafe(getSummaryStatement(content.explanation, content.topic), 120),
  };
}

/**
 * Replace all placeholders in the educational video prompt template.
 */
export function fillEducationalVideoPrompt(content: LearningContent): string {
  const placeholders = buildPlaceholders(content);
  let prompt = EDUCATIONAL_VIDEO_PROMPT_TEMPLATE;
  for (const [key, value] of Object.entries(placeholders)) {
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return prompt;
}

/**
 * Condensed prompt for Stability text-to-image (single image).
 * Keeps style + topic + definition + steps + summary so the image matches the educational brief.
 */
export function condensedPromptForImage(content: LearningContent): string {
  const p = buildPlaceholders(content);
  return `High-quality educational explainer image. Topic: "${p.TOPIC_NAME}".

Style: modern educational design, 3D motion graphics, kinetic typography, clean bright colors, clear diagrams, labels, arrows, soft glowing background, cinematic look.

Definition: ${p.TOPIC_NAME} is ${p.SHORT_DEFINITION}

Steps shown: 1) ${p.STEP_1} 2) ${p.STEP_2} 3) ${p.STEP_3}

Applications: ${p.APPLICATION_1}; ${p.APPLICATION_2}; ${p.APPLICATION_3}.

Summary: ${p.TOPIC_NAME} helps us ${p.SUMMARY_STATEMENT}

Visual: title "Understanding ${p.TOPIC_NAME}", chalkboard-style text, icons, symbols, smooth gradients, Learn Smart with OmniLearnAI.`;
}
