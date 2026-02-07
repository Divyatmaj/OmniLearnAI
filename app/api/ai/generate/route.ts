import { generateLearningContent } from '@/lib/groq';
import { enrichWithGemini, enrichWithStability } from '@/lib/content';
import { AGE_MIN, AGE_MAX } from '@/lib/constants';
import { NextResponse } from 'next/server';

function parseAge(value: unknown): number | null {
  const n = Number(value);
  if (Number.isNaN(n) || n < AGE_MIN || n > AGE_MAX) return null;
  return Math.round(n);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, difficulty, age, language } = body;

    if (!topic || !difficulty || age == null || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, difficulty, age, language' },
        { status: 400 }
      );
    }

    const ageNum = parseAge(age);
    if (ageNum === null) {
      return NextResponse.json(
        { error: `Age must be a number between ${AGE_MIN} and ${AGE_MAX}.` },
        { status: 400 }
      );
    }

    const groqData = await generateLearningContent(
      String(topic).trim(),
      String(difficulty),
      ageNum,
      String(language)
    );
    let data = await enrichWithGemini(groqData);
    data = await enrichWithStability(data);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Content Generation Error:', error);
    const message = error instanceof Error ? error.message : 'Content generation failed';
    const status = message.includes('GROQ_API_KEY') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
