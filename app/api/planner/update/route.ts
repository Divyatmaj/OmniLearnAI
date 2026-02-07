import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

/** PUT /api/planner/update - Update study plan. Auth required; plan must belong to session user. */
export async function PUT(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in to update your study plan.' },
        { status: 401 }
      );
    }
    const userId = session.userId;

    const body = await req.json();
    const { planId, dailyPlan, progress } = body as {
      planId?: string;
      dailyPlan?: unknown[];
      progress?: number;
    };

    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    const existing = await prisma.studyPlan.findUnique({
      where: { id: planId },
      select: { userId: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Study plan not found.' },
        { status: 404 }
      );
    }
    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this plan.' },
        { status: 403 }
      );
    }

    const updateData: { dailyPlan?: string; progress?: number } = {};
    if (Array.isArray(dailyPlan)) {
      updateData.dailyPlan = JSON.stringify(dailyPlan);
    }
    if (typeof progress === 'number' && progress >= 0 && progress <= 100) {
      updateData.progress = progress;
    }

    const plan = await prisma.studyPlan.update({
      where: { id: planId },
      data: updateData,
    });

    return NextResponse.json({
      id: plan.id,
      dailyPlan: JSON.parse(plan.dailyPlan),
      progress: plan.progress,
      updatedAt: plan.updatedAt,
    });
  } catch (e) {
    console.error('Planner update error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to update plan' },
      { status: 500 }
    );
  }
}
