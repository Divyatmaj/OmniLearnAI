import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addWorksheet, addXp, XP, getProgressPayload } from '@/lib/progress';

/** POST /api/progress/add-worksheet - Increment worksheetsGenerated and +25 XP. Auth required. */
export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }
    await addWorksheet(session.userId);
    await addXp(session.userId, XP.WORKSHEET_GENERATED, { updateAnalytics: true });
    const payload = await getProgressPayload(session.userId);
    return NextResponse.json(payload ?? { ok: true });
  } catch (e) {
    console.error('Progress add-worksheet error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to add worksheet' },
      { status: 500 }
    );
  }
}
