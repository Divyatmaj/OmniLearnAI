import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** POST /api/auth/reset - Forgot password: accept email and return success (no email sent; placeholder). */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body as { email?: string };

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    // Always return success to avoid email enumeration
    return NextResponse.json({
      message: user
        ? 'If an account exists, you will receive reset instructions.'
        : 'If an account exists, you will receive reset instructions.',
    });
  } catch (e) {
    console.error('Auth reset error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Request failed' },
      { status: 500 }
    );
  }
}
