import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

/** DELETE /api/admin/user/:id - Delete user (cascades). Requires X-Admin-Secret header. */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Admin delete user error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to delete user' },
      { status: 500 }
    );
  }
}
