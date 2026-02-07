import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

/** POST /api/progress/add - Add XP / update badges / weaknesses / analytics. Auth required. */
export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }
    const userId = session.userId;

    const body = await req.json();
    const {
      xpPoints,
      badges,
      weaknesses,
      analytics,
    } = body as {
      xpPoints?: number;
      badges?: string[];
      weaknesses?: string[];
      analytics?: Record<string, unknown>;
    };

    const existing = await prisma.progress.findUnique({
      where: { userId },
    });

    const data: {
      xpPoints?: number;
      badges?: string;
      topicsStudied?: string;
      worksheetsGenerated?: number;
      studyPlansCreated?: number;
      weaknesses?: string;
      analytics?: string;
    } = {};

    if (typeof xpPoints === 'number') {
      data.xpPoints = (existing?.xpPoints ?? 0) + xpPoints;
    }
    if (Array.isArray(badges)) {
      data.badges = JSON.stringify(badges);
    }
    if (Array.isArray(weaknesses)) {
      data.weaknesses = JSON.stringify(weaknesses);
    }
    if (analytics && typeof analytics === 'object') {
      data.analytics = JSON.stringify(analytics);
    }

    const progress = await prisma.progress.upsert({
      where: { userId },
      create: {
        userId,
        xpPoints: data.xpPoints ?? 0,
        badges: data.badges ?? '[]',
        topicsStudied: '[]',
        worksheetsGenerated: 0,
        studyPlansCreated: 0,
        weaknesses: data.weaknesses ?? '[]',
        analytics: data.analytics ?? '{}',
      },
      update: data,
    });

    const parseJson = <T>(s: string, fallback: T): T => {
      try { return JSON.parse(s) as T; } catch { return fallback; }
    };
    return NextResponse.json({
      userId: progress.userId,
      xpPoints: progress.xpPoints,
      badges: parseJson(progress.badges, [] as string[]),
      weaknesses: parseJson(progress.weaknesses, [] as string[]),
      analytics: parseJson(progress.analytics, {} as Record<string, unknown>),
      updatedAt: progress.updatedAt,
    });
  } catch (e) {
    console.error('Progress add error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to update progress' },
      { status: 500 }
    );
  }
}
