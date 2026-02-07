'use client';

import { useState, useEffect, useCallback } from 'react';

export type SessionUser = { id: string; email: string; name: string | null };

/**
 * Fetches current user from server session (cookie). Use this to know if the user is logged in.
 * All auth API calls must use credentials: 'include' so the cookie is sent.
 */
export function useSession(): {
  user: SessionUser | null;
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { user, loading, refetch };
}
