import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/** GET /api/auth/session - Return current user if session cookie is valid. */
export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: session.user });
  } catch (e) {
    console.error('Session error:', e);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
