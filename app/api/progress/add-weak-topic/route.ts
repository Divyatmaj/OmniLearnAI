import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addWeakTopic, getProgressPayload } from '@/lib/progress';

/** POST /api/progress/add-weak-topic - Add topic to weakTopics (e.g. when score < 60%). Auth required. */
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
    await addWeakTopic(session.userId, topic);
    const payload = await getProgressPayload(session.userId);
    return NextResponse.json(payload ?? { ok: true });
  } catch (e) {
    console.error('Progress add-weak-topic error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to add weak topic' },
      { status: 500 }
    );
  }
}
