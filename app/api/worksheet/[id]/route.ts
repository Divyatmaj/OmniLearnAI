import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { parseWorksheetContent } from '@/lib/worksheet-types';

/** GET /api/worksheet/:id - Fetch worksheet by ID. Auth required; must own worksheet. */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing worksheet id' }, { status: 400 });
    }

    const worksheet = await prisma.worksheet.findUnique({
      where: { id },
    });

    if (!worksheet) {
      return NextResponse.json({ error: 'Worksheet not found' }, { status: 404 });
    }
    if (worksheet.userId !== session.userId) {
      return NextResponse.json({ error: 'Not authorized to view this worksheet.' }, { status: 403 });
    }

    const content = parseWorksheetContent(worksheet.content);

    return NextResponse.json({
      id: worksheet.id,
      userId: worksheet.userId,
      topic: worksheet.topic,
      difficulty: worksheet.difficulty,
      content,
      pdfUrl: worksheet.pdfUrl,
      createdAt: worksheet.createdAt,
    });
  } catch (e) {
    console.error('Worksheet get error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch worksheet' },
      { status: 500 }
    );
  }
}
