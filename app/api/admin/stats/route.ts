import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

/** GET /api/admin/stats - Usage analytics (counts). Requires X-Admin-Secret header. */
export async function GET(req: Request) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const [userCount, planCount, worksheetCount, contactCount] = await Promise.all([
      prisma.user.count(),
      prisma.studyPlan.count(),
      prisma.worksheet.count(),
      prisma.contactMessage.count(),
    ]);

    return NextResponse.json({
      users: userCount,
      studyPlans: planCount,
      worksheets: worksheetCount,
      contactMessages: contactCount,
    });
  } catch (e) {
    console.error('Admin stats error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
