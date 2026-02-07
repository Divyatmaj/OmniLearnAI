'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Users, BarChart3, Trash2, Loader2, Lock } from 'lucide-react';

const ADMIN_KEY_STORAGE = 'omnilearn_admin_key';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

interface Stats {
  users: number;
  studyPlans: number;
  worksheets: number;
  contactMessages: number;
}

function getAdminHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const key = sessionStorage.getItem(ADMIN_KEY_STORAGE);
  return key ? { 'X-Admin-Secret': key } : {};
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [keyPromptValue, setKeyPromptValue] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: getAdminHeaders() });
      const data = await res.json();
      if (res.status === 401) {
        setShowKeyPrompt(true);
        setError(null);
        return;
      }
      if (res.ok) setUsers(data.users ?? []);
      else setError(data.error ?? 'Failed to load users');
    } catch {
      setError('Network error.');
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: getAdminHeaders() });
      const data = await res.json();
      if (res.status === 401) {
        setShowKeyPrompt(true);
        return;
      }
      if (res.ok) setStats(data);
    } catch {}
  }, []);

  const submitAdminKey = () => {
    if (!keyPromptValue.trim()) return;
    sessionStorage.setItem(ADMIN_KEY_STORAGE, keyPromptValue.trim());
    setAdminKey(keyPromptValue.trim());
    setKeyPromptValue('');
    setShowKeyPrompt(false);
    setError(null);
    loadUsers();
    loadStats();
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadUsers(), loadStats()]);
      setLoading(false);
    })();
  }, [loadUsers, loadStats]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/user/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      if (res.ok) await loadUsers();
      else {
        const data = await res.json();
        setError(data.error ?? 'Delete failed');
      }
    } catch {
      setError('Network error.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading && !showKeyPrompt) {
    return (
      <main className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </main>
    );
  }

  if (showKeyPrompt) {
    return (
      <main className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-semibold">Admin Access</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Enter your admin secret (set via ADMIN_SECRET in .env.local) to access this panel.
          </p>
          <input
            type="password"
            value={keyPromptValue}
            onChange={(e) => setKeyPromptValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitAdminKey()}
            placeholder="Admin secret"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={submitAdminKey}
            disabled={!keyPromptValue.trim()}
            className="mt-4 w-full py-2 rounded-lg bg-brand-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
            <Settings className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-gray-400">Users, usage analytics, and content review.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.users ?? 0}</p>
              <p className="text-xs text-gray-500">Users</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-brand-secondary" />
            <div>
              <p className="text-2xl font-bold">{stats?.studyPlans ?? 0}</p>
              <p className="text-xs text-gray-500">Study plans</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-brand-accent" />
            <div>
              <p className="text-2xl font-bold">{stats?.worksheets ?? 0}</p>
              <p className="text-xs text-gray-500">Worksheets</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold">{stats?.contactMessages ?? 0}</p>
              <p className="text-xs text-gray-500">Messages</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
          <h3 className="p-4 border-b border-white/10 font-semibold">User list</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-4">Email</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.name ?? '—'}</td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                        aria-label="Delete user"
                      >
                        {deleting === u.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="p-8 text-center text-gray-500">No users yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
