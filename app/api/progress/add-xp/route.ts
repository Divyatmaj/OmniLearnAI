import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addXp, XP } from '@/lib/progress';

/** POST /api/progress/add-xp - Add XP (topic=10, worksheet=25, studyPlan=30, streak5=50). Auth required. */
export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const { amount, type } = body as { amount?: number; type?: 'topic' | 'worksheet' | 'studyPlan' | 'streak5' };
    let xp = typeof amount === 'number' ? amount : 0;
    if (xp === 0 && type) {
      switch (type) {
        case 'topic':
          xp = XP.TOPIC_EXPLAINED;
          break;
        case 'worksheet':
          xp = XP.WORKSHEET_GENERATED;
          break;
        case 'studyPlan':
          xp = XP.STUDY_PLAN_CREATED;
          break;
        case 'streak5':
          xp = XP.STREAK_5_DAYS;
          break;
        default:
          break;
      }
    }
    if (xp <= 0) {
      return NextResponse.json({ error: 'Invalid amount or type. Use amount (number) or type: topic, worksheet, studyPlan, streak5.' }, { status: 400 });
    }
    await addXp(session.userId, xp, { updateAnalytics: true });
    const payload = await import('@/lib/progress').then((m) => m.getProgressPayload(session.userId));
    return NextResponse.json(payload ?? { ok: true });
  } catch (e) {
    console.error('Progress add-xp error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to add XP' },
      { status: 500 }
    );
  }
}
