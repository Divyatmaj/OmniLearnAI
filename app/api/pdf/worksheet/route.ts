import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

/** POST /api/pdf/worksheet - Legacy: create minimal worksheet record. Prefer POST /api/worksheet/generate for AI content. Auth required. */
export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to create a worksheet.' },
        { status: 401 }
      );
    }
    const userId = session.userId;

    const body = await req.json();
    const { topic, difficulty } = body as {
      topic?: string;
      difficulty?: string;
    };

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid topic.' },
        { status: 400 }
      );
    }

    const worksheet = await prisma.worksheet.create({
      data: {
        userId,
        topic: String(topic).trim(),
        difficulty: difficulty ?? 'Intermediate',
        content: '{}',
        pdfUrl: null,
      },
    });

    return NextResponse.json({
      id: worksheet.id,
      topic: worksheet.topic,
      difficulty: worksheet.difficulty,
      pdfUrl: worksheet.pdfUrl,
      createdAt: worksheet.createdAt,
    });
  } catch (e) {
    console.error('Worksheet create error:', e);
    const message = e instanceof Error ? e.message : 'Failed to create worksheet';
    const status = message.includes('Foreign key') ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? 'Invalid user. Please log in again.' : message },
      { status }
    );
  }
}
