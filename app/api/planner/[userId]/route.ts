import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

/** GET /api/planner/:userId - Fetch latest study plan. Use "me" for current session user. Auth required. */
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in to view your study plan.' },
        { status: 401 }
      );
    }
    const requestedId = params.userId?.trim();
    if (requestedId !== 'me' && requestedId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const plan = await prisma.studyPlan.findFirst({
      where: { userId: session.userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    return NextResponse.json({
      id: plan.id,
      userId: plan.userId,
      examDate: plan.examDate.toISOString(),
      dailyPlan: JSON.parse(plan.dailyPlan),
      progress: plan.progress,
      updatedAt: plan.updatedAt,
    });
  } catch (e) {
    console.error('Planner get error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}
