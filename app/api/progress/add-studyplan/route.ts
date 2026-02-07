import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addStudyPlan, addXp, XP, getProgressPayload } from '@/lib/progress';

/** POST /api/progress/add-studyplan - Increment studyPlansCreated and +30 XP. Auth required. */
export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }
    await addStudyPlan(session.userId);
    await addXp(session.userId, XP.STUDY_PLAN_CREATED, { updateAnalytics: true });
    const payload = await getProgressPayload(session.userId);
    return NextResponse.json(payload ?? { ok: true });
  } catch (e) {
    console.error('Progress add-studyplan error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to add study plan' },
      { status: 500 }
    );
  }
}
