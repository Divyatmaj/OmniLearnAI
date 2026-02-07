import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** POST /api/contact/submit - Save contact form message. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Missing name, email, or message' },
        { status: 400 }
      );
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim(),
        message: String(message).trim(),
      },
    });

    return NextResponse.json({
      id: contact.id,
      createdAt: contact.createdAt,
    });
  } catch (e) {
    console.error('Contact submit error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to submit message' },
      { status: 500 }
    );
  }
}
