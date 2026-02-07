import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

/** GET /api/admin/users - List all users. Requires X-Admin-Secret header. */
export async function GET(req: Request) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ users });
  } catch (e) {
    console.error('Admin users error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to list users' },
      { status: 500 }
    );
  }
}
