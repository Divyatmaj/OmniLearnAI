import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { addStudyPlan, addXp, XP } from '@/lib/progress';

/** POST /api/planner/generate - Create study plan. Auth required. */
export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in to create a study plan.' },
        { status: 401 }
      );
    }
    const userId = session.userId;

    const body = await req.json();
    const { examDate } = body as { examDate?: string };

    if (!examDate) {
      return NextResponse.json(
        { error: 'Missing examDate' },
        { status: 400 }
      );
    }

    const date = new Date(examDate);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid examDate format' },
        { status: 400 }
      );
    }

    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    const dailyPlan: { day: number; title: string; tasks: string[]; completed?: boolean }[] = [];

    for (let d = 1; d <= Math.min(daysLeft, 30); d++) {
      dailyPlan.push({
        day: d,
        title: `Day ${d}`,
        tasks: [
          'Review key concepts',
          'Practice problems',
          'Summarize notes',
        ],
        completed: false,
      });
    }

    const plan = await prisma.studyPlan.create({
      data: {
        userId,
        examDate: date,
        dailyPlan: JSON.stringify(dailyPlan),
        progress: 0,
      },
    });

    await addStudyPlan(userId).catch(() => {});
    await addXp(userId, XP.STUDY_PLAN_CREATED, { updateAnalytics: true }).catch(() => {});

    return NextResponse.json({
      id: plan.id,
      userId: plan.userId,
      examDate: plan.examDate.toISOString(),
      dailyPlan: JSON.parse(plan.dailyPlan),
      progress: plan.progress,
      updatedAt: plan.updatedAt,
    });
  } catch (e) {
    console.error('Planner generate error:', e);
    const message = e instanceof Error ? e.message : 'Failed to generate plan';
    const status = message.includes('Foreign key') ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? 'Invalid user. Please log in again.' : message },
      { status }
    );
  }
}
