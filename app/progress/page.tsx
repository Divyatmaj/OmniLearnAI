'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Award,
  AlertTriangle,
  TrendingUp,
  FileText,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { useSession } from '@/lib/use-session';

interface ProgressData {
  userId: string;
  xpPoints: number;
  badges: string[];
  topicsStudied: string[];
  worksheetsGenerated: number;
  studyPlansCreated: number;
  weakTopics: string[];
  analytics: Record<string, number>;
  updatedAt: string;
}

const XP_MAX = 700;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProgressPage() {
  const { user, loading: sessionLoading } = useSession();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !sessionLoading) {
      setLoading(false);
      return;
    }
    if (!user) return;
    (async () => {
      try {
        const res = await fetch('/api/progress', { credentials: 'include' });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? 'Failed to load progress');
          return;
        }
        setData(json);
      } catch {
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, sessionLoading]);

  if (sessionLoading || (user && loading)) {
    return (
      <main className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-md">
          <BarChart3 className="w-12 h-12 text-brand-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-semibold mb-2">Log in to view your progress</h2>
          <p className="text-gray-400 text-sm mb-6">Track XP, badges, worksheets, and study plans.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:opacity-90"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200">
          {error}
        </div>
      </main>
    );
  }

  const xp = data?.xpPoints ?? 0;
  const badges = data?.badges ?? [];
  const topicsStudied = data?.topicsStudied ?? [];
  const weakTopics = data?.weakTopics ?? [];
  const worksheetsGenerated = data?.worksheetsGenerated ?? 0;
  const studyPlansCreated = data?.studyPlansCreated ?? 0;
  const analytics = data?.analytics ?? {};
  const xpPercent = Math.min(100, (xp / XP_MAX) * 100);

  const weekData = (() => {
    const d = new Date();
    const out: { day: string; xp: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(d);
      date.setDate(d.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const dayKey = `d${key}`;
      out.push({
        day: DAY_LABELS[date.getDay()],
        xp: analytics[dayKey] ?? 0,
      });
    }
    return out;
  })();
  const maxWeekXp = Math.max(1, ...weekData.map((x) => x.xp));

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-primary/20 p-2.5 rounded-xl border border-brand-primary/30 backdrop-blur-sm">
            <BarChart3 className="w-7 h-7 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Progress Dashboard</h1>
            <p className="text-gray-400 text-sm">XP, badges, worksheets & study plans.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-brand-primary" />
              <h3 className="font-semibold">XP Points</h3>
            </div>
            <p className="text-3xl font-bold text-brand-primary">{xp}</p>
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary rounded-full transition-all duration-700 ease-out"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Progress to Study Master (700 XP)</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-brand-secondary" />
              <h3 className="font-semibold">Badges</h3>
            </div>
            <ul className="space-y-2">
              {badges.length ? (
                badges.map((b, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-secondary" />
                    {b}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">Earn badges at 100, 300, 700 XP and 5 study plans.</li>
              )}
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-brand-accent" />
              <h3 className="font-semibold">Weak Topics</h3>
            </div>
            <ul className="space-y-2">
              {weakTopics.length ? (
                weakTopics.map((w, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-accent" />
                    {w}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">Submit worksheet results to detect weak topics.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl flex items-center gap-4">
            <div className="bg-brand-primary/20 p-3 rounded-xl border border-brand-primary/30">
              <FileText className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{worksheetsGenerated}</p>
              <p className="text-sm text-gray-400">Worksheets generated</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl flex items-center gap-4">
            <div className="bg-brand-secondary/20 p-3 rounded-xl border border-brand-secondary/30">
              <Calendar className="w-6 h-6 text-brand-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{studyPlansCreated}</p>
              <p className="text-sm text-gray-400">Study plans created</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-brand-primary" />
            <h3 className="font-semibold">Topics studied</h3>
          </div>
          {topicsStudied.length ? (
            <ul className="flex flex-wrap gap-2">
              {topicsStudied.map((t, i) => (
                <li
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-sm text-gray-300 border border-white/10"
                >
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Complete topic explanations on the Learn page to track topics.</p>
          )}
        </div>

        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <h3 className="font-semibold mb-4">Weekly activity (XP)</h3>
          <div className="h-40 flex items-end gap-2 sm:gap-3">
            {weekData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-brand-primary/40 rounded-t min-h-[8px] transition-all duration-500"
                  style={{
                    height: `${Math.max(8, (d.xp / maxWeekXp) * 100)}%`,
                    maxHeight: '120px',
                  }}
                  title={`${d.day}: ${d.xp} XP`}
                />
                <span className="text-xs text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
        </div>
      </div>
    </main>
  );
}
