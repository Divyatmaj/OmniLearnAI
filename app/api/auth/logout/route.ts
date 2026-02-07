import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionToken } from '@/lib/auth';

/** POST /api/auth/logout - Delete session and clear cookie. */
export async function POST(req: Request) {
  try {
    const token = getSessionToken(req);
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set('omnilearn_session', '', { path: '/', maxAge: 0 });
    return res;
  } catch (e) {
    console.error('Logout error:', e);
    const res = NextResponse.json({ ok: true });
    res.cookies.set('omnilearn_session', '', { path: '/', maxAge: 0 });
    return res;
  }
}
