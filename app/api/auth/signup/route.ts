import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { sessionCookieOptions } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

/** POST /api/auth/signup - Register new user and log them in (session + cookie). */
export async function POST(req: Request) {
  try {
    const { prisma } = await import('@/lib/db');
    const body = await req.json();
    const { email, name, password } = body as {
      email?: string;
      name?: string;
      password?: string;
    };

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = password ? await hashPassword(String(password)) : null;

    const user = await prisma.user.create({
      data: {
        email: String(email).trim().toLowerCase(),
        name: name?.trim() ?? null,
        passwordHash,
      },
    });

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
    const { name: cookieName, value, options } = sessionCookieOptions(token);
    res.cookies.set(cookieName, value, {
      ...options,
      maxAge: options.maxAge as number,
    });
    return res;
  } catch (e) {
    console.error('Auth signup error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Signup failed' },
      { status: 500 }
    );
  }
}
