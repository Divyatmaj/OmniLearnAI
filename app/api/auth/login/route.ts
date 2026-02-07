import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sessionCookieOptions } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';
import { randomBytes } from 'crypto';

/** POST /api/auth/login - Login; creates DB session and sets HTTP-only cookie. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(password ?? '', user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: { token, userId: user.id, expiresAt },
    });

    const res = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    const { name, value, options } = sessionCookieOptions(token);
    res.cookies.set(name, value, {
      ...options,
      maxAge: options.maxAge as number,
    });
    return res;
  } catch (e) {
    console.error('Auth login error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Login failed' },
      { status: 500 }
    );
  }
}
