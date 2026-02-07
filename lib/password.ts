/**
 * Password hashing utilities. Uses bcrypt for secure storage.
 * Supports legacy plaintext passwords for backward compatibility during migration.
 */

import { hash, compare } from 'bcryptjs';

const SALT_ROUNDS = 10;

/** Check if stored value looks like a bcrypt hash. */
function isBcryptHash(stored: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(stored);
}

/**
 * Hash a plaintext password for storage.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * Verify password against stored hash.
 * Supports bcrypt hashes and legacy plaintext (for migration); plaintext comparison is insecure.
 */
export async function verifyPassword(
  plainPassword: string,
  storedHash: string | null
): Promise<boolean> {
  if (!storedHash) return false;
  if (isBcryptHash(storedHash)) {
    return compare(plainPassword, storedHash);
  }
  // Legacy: plaintext stored (insecure; migrate on next password change)
  return storedHash === plainPassword;
}
