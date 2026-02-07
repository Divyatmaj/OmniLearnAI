import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addTopic, addXp, XP, getProgressPayload } from '@/lib/progress';

/** POST /api/progress/add-topic - Add topic to topicsStudied and +10 XP. Auth required. */
export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }
    await addTopic(session.userId, topic);
    await addXp(session.userId, XP.TOPIC_EXPLAINED, { updateAnalytics: true });
    const payload = await getProgressPayload(session.userId);
    return NextResponse.json(payload ?? { ok: true });
  } catch (e) {
    console.error('Progress add-topic error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to add topic' },
      { status: 500 }
    );
  }
}
