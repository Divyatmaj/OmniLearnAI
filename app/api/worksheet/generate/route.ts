import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generateWorksheetContent } from '@/lib/worksheet-ai';
import { parseWorksheetContent } from '@/lib/worksheet-types';
import { getGeminiErrorResponse } from '@/lib/gemini-errors';
import { addWorksheet, addXp, XP } from '@/lib/progress';

/** POST /api/worksheet/generate - AI-generate worksheet, save to DB. Auth required. */
export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to generate a worksheet.' },
        { status: 401 }
      );
    }
    const userId = session.userId;

    const body = await req.json();
    const { topic, difficulty } = body as {
      topic?: string;
      difficulty?: string;
    };

    const topicTrimmed = typeof topic === 'string' ? topic.trim() : '';
    if (!topicTrimmed) {
      return NextResponse.json(
        { error: 'Topic is required.' },
        { status: 400 }
      );
    }

    const difficultyStr = typeof difficulty === 'string' && difficulty.trim() ? difficulty.trim() : 'Intermediate';

    const content = await generateWorksheetContent(topicTrimmed, difficultyStr);
    const contentString = JSON.stringify(content);

    const worksheet = await prisma.worksheet.create({
      data: {
        userId,
        topic: topicTrimmed,
        difficulty: difficultyStr,
        content: contentString,
        pdfUrl: null,
      },
    });

    await addWorksheet(userId).catch(() => {});
    await addXp(userId, XP.WORKSHEET_GENERATED, { updateAnalytics: true }).catch(() => {});

    const parsed = parseWorksheetContent(worksheet.content);

    return NextResponse.json({
      id: worksheet.id,
      topic: worksheet.topic,
      difficulty: worksheet.difficulty,
      content: parsed,
      pdfUrl: worksheet.pdfUrl,
      createdAt: worksheet.createdAt,
    });
  } catch (e) {
    console.error('Worksheet generate error (full):', e);
    if (e instanceof Error && e.stack) {
      console.error('Stack:', e.stack);
    }

    const message = e instanceof Error ? e.message : String(e);
    if (message.includes('Foreign key')) {
      return NextResponse.json(
        { error: 'Invalid user. Please log in again.' },
        { status: 401 }
      );
    }

    const rawMsg = e instanceof Error ? e.message : String(e);
    if (rawMsg.includes('GROQ_API_KEY')) {
      return NextResponse.json(
        { error: 'Missing GROQ_API_KEY. Add it to .env.local for worksheet generation.' },
        { status: 503 }
      );
    }
    const { message: errorMessage, status } = getGeminiErrorResponse(e);
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}
