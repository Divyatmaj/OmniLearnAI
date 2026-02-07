import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/auth/google - PLACEHOLDER: accepts email/name from client with NO verification.
 * SECURITY: Anyone can impersonate any user by POSTing arbitrary email/name.
 * Replace with real Google OAuth (server-side flow + token verification) before production.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name } = body as { email?: string; name?: string };

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email from Google is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name?.trim() ?? null,
          passwordHash: null,
        },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (e) {
    console.error('Auth Google error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Google sign-in failed' },
      { status: 500 }
    );
  }
}
