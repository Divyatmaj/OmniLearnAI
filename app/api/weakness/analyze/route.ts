import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

/** POST /api/weakness/analyze - Update weakness report. Auth required; report must belong to session user. */
export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { reportId, summary, topicsDetected } = body as {
      reportId?: string;
      summary?: string;
      topicsDetected?: string[];
    };

    if (!reportId) {
      return NextResponse.json({ error: 'Missing reportId' }, { status: 400 });
    }

    const existing = await prisma.weaknessReport.findUnique({
      where: { id: reportId },
      select: { userId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }
    if (existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Not authorized to update this report.' }, { status: 403 });
    }

    const updateData: { summary?: string; topicsDetected?: string } = {};
    if (typeof summary === 'string') updateData.summary = summary;
    if (Array.isArray(topicsDetected)) {
      updateData.topicsDetected = JSON.stringify(topicsDetected);
    }

    const report = await prisma.weaknessReport.update({
      where: { id: reportId },
      data: updateData,
    });

    return NextResponse.json({
      id: report.id,
      summary: report.summary,
      topicsDetected: JSON.parse(report.topicsDetected) as string[],
      createdAt: report.createdAt,
    });
  } catch (e) {
    console.error('Weakness analyze error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to analyze' },
      { status: 500 }
    );
  }
}
