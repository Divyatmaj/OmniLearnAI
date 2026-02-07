import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProgressPayload } from '@/lib/progress';

/** GET /api/progress - Return current user progress (session). Creates progress if missing. */
export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }
    const payload = await getProgressPayload(session.userId);
    if (!payload) {
      return NextResponse.json({ error: 'Failed to load progress.' }, { status: 500 });
    }
    return NextResponse.json(payload);
  } catch (e) {
    console.error('Progress GET error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
