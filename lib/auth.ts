/**
 * Auth helpers: database-backed sessions (cookie) and userId validation.
 */

import { prisma } from '@/lib/db';

const SESSION_COOKIE = 'omnilearn_session';
const SESSION_DAYS = 7;

export type SessionUser = { id: string; email: string; name: string | null };

/**
 * Get session token from request Cookie header.
 */
export function getSessionToken(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1].trim() : null;
}

/**
 * Get current user from database session (cookie). Returns null if no cookie or session expired/invalid.
 */
export async function getSession(req: Request): Promise<{ userId: string; user: SessionUser } | null> {
  const token = getSessionToken(req);
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    userId: session.userId,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  };
}

/**
 * Returns the userId if it is non-empty and a User with that id exists; otherwise null.
 * Use when you need to validate a userId (e.g. from body) instead of session.
 */
export async function getValidUserId(userId: string | undefined | null): Promise<string | null> {
  const id = typeof userId === 'string' ? userId.trim() : '';
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Returns userId from session only. Never trusts body/query userId (prevents impersonation).
 * Use getSession() if you need the full session object.
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const session = await getSession(req);
  return session?.userId ?? null;
}

/** Cookie options for session (HTTP-only, 7 days). */
export function sessionCookieOptions(token: string): { name: string; value: string; options: Record<string, string | number | boolean> } {
  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    },
  };
}
