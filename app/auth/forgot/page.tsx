'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, Loader2 } from 'lucide-react';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSent(false);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Request failed');
        return;
      }
      setSent(true);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
            <KeyRound className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Forgot password</h1>
            <p className="text-gray-400 text-sm">We&apos;ll send reset instructions (placeholder).</p>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4"
        >
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
              {error}
            </div>
          )}
          {sent && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-200 text-sm">
              If an account exists, you will receive reset instructions.
            </div>
          )}
          <label className="block text-sm font-medium text-gray-400">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-primary px-4 py-3 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send reset link</>}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">
          <Link href="/auth/login" className="text-brand-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
