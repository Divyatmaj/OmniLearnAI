/**
 * Admin route protection. Requires ADMIN_SECRET header to match env var.
 */

const ADMIN_HEADER = 'x-admin-secret';

export function requireAdmin(req: Request): { ok: false; status: number; error: string } | { ok: true } {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.trim().length < 12) {
    return { ok: false, status: 503, error: 'Admin access is not configured.' };
  }
  const header = req.headers.get(ADMIN_HEADER);
  if (!header || header !== secret) {
    return { ok: false, status: 401, error: 'Unauthorized.' };
  }
  return { ok: true };
}
