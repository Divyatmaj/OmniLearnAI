import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

/** POST /api/weakness/upload - Create weakness report. Auth required. */
export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { inputFileUrl } = body as { inputFileUrl?: string };

    const report = await prisma.weaknessReport.create({
      data: {
        userId: session.userId,
        inputFileUrl: inputFileUrl ?? null,
        summary: null,
        topicsDetected: '[]',
      },
    });

    return NextResponse.json({
      id: report.id,
      userId: report.userId,
      inputFileUrl: report.inputFileUrl,
      summary: report.summary,
      topicsDetected: [] as string[],
      createdAt: report.createdAt,
    });
  } catch (e) {
    console.error('Weakness upload error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create report' },
      { status: 500 }
    );
  }
}
