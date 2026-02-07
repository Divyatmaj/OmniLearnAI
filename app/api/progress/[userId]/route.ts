import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProgressPayload } from '@/lib/progress';

/** GET /api/progress/:userId - Fetch progress. Use "me" for current session user. Auth required. */
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }
    const requestedId = params.userId?.trim();
    if (requestedId !== 'me' && requestedId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
    const userId = session.userId;
    const payload = await getProgressPayload(userId);
    if (!payload) {
      return NextResponse.json({ error: 'Failed to load progress.' }, { status: 500 });
    }
    return NextResponse.json(payload);
  } catch (e) {
    console.error('Progress get error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
