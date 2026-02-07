'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/use-session';

interface DayPlan {
  day: number;
  title: string;
  tasks: string[];
  completed?: boolean;
}

interface PlanData {
  id: string;
  examDate: string;
  dailyPlan: DayPlan[];
  progress: number;
  updatedAt: string;
}

export default function PlannerPage() {
  const [examDate, setExamDate] = useState('');
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: sessionLoading } = useSession();
  const userId = user?.id ?? null;

  const fetchPlan = useCallback(async () => {
    if (!userId) {
      setPlan(null);
      return;
    }
    try {
      const res = await fetch('/api/planner/me', { credentials: 'include' });
      if (res.status === 401) {
        setPlan(null);
        return;
      }
      const data = await res.json();
      if (data.id && data.dailyPlan) setPlan(data);
      else setPlan(null);
    } catch {
      setPlan(null);
    }
  }, [userId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examDate) return;
    if (!userId) {
      setError('Please log in to create a study plan.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examDate }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.status === 401) {
        setError(data.error ?? 'Please log in to create a study plan.');
        return;
      }
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate plan');
        return;
      }
      setPlan({
        id: data.id,
        examDate: data.examDate,
        dailyPlan: data.dailyPlan,
        progress: data.progress,
        updatedAt: data.updatedAt,
      });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedPlan: DayPlan[], progress: number) => {
    if (!plan?.id) return;
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/planner/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          dailyPlan: updatedPlan,
          progress,
        }),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setPlan((p) => (p ? { ...p, dailyPlan: data.dailyPlan, progress: data.progress } : p));
      } else if (res.status === 401 || res.status === 403) {
        const data = await res.json();
        setError(data.error ?? 'Please log in to update your plan.');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleDayComplete = (dayIndex: number) => {
    if (!plan) return;
    const next = plan.dailyPlan.map((d, i) =>
      i === dayIndex ? { ...d, completed: !d.completed } : d
    );
    const completed = next.filter((d) => d.completed).length;
    const progress = next.length ? Math.round((completed / next.length) * 100) : 0;
    setPlan((p) => (p ? { ...p, dailyPlan: next, progress } : p));
    handleUpdate(next, progress);
  };

  const updateDayTitle = (dayIndex: number, title: string) => {
    if (!plan) return;
    const next = plan.dailyPlan.map((d, i) =>
      i === dayIndex ? { ...d, title } : d
    );
    const progress = plan.dailyPlan.length
      ? Math.round(
          (plan.dailyPlan.filter((d) => d.completed).length / plan.dailyPlan.length) * 100
        )
      : plan.progress;
    setPlan((p) => (p ? { ...p, dailyPlan: next, progress } : p));
    handleUpdate(next, progress);
  };

  const progressPercent =
    plan?.dailyPlan.length ?
      Math.round(
        (plan.dailyPlan.filter((d) => d.completed).length / plan.dailyPlan.length) * 100
      ) : plan?.progress ?? 0;

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
            <Calendar className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Study Planner</h1>
            <p className="text-gray-400">Set your exam date and get a daily plan.</p>
          </div>
        </div>

        {!sessionLoading && !userId && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex flex-wrap items-center gap-2">
            <span>You must be logged in to use the Study Planner.</span>
            <Link href="/auth/login" className="font-medium text-brand-primary hover:underline">
              Log in
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4">
            <form
              onSubmit={handleGenerate}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4"
            >
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                  {error}
                </div>
              )}
              <label className="block text-sm font-medium text-gray-400">
                Exam date
              </label>
              <input
                type="date"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !userId}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary px-4 py-3 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Generate plan
                  </>
                )}
              </button>
            </form>

            {plan && (
              <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Progress</h3>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">{progressPercent}% complete</p>
              </div>
            )}
          </aside>

          <section className="lg:col-span-8">
            {!sessionLoading && !userId && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                <Calendar className="w-16 h-16 mb-4 opacity-50" />
                <p>Log in to view and create study plans.</p>
                <Link href="/auth/login" className="mt-4 text-brand-primary hover:underline">
                  Log in
                </Link>
              </div>
            )}

            {userId && !plan && !loading && !sessionLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                <Calendar className="w-16 h-16 mb-4 opacity-50" />
                <p>Enter your exam date and generate a plan to get started.</p>
              </div>
            )}

            {plan && (
              <div className="space-y-4">
                <p className="text-gray-400">
                  Exam date: {new Date(plan.examDate).toLocaleDateString()}
                </p>
                {plan.dailyPlan.map((day, dayIndex) => (
                  <div
                    key={day.day}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => toggleDayComplete(dayIndex)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          day.completed
                            ? 'border-brand-primary bg-brand-primary/20 text-brand-primary'
                            : 'border-white/20 hover:bg-white/10'
                        }`}
                        aria-label={day.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        className="flex-1 bg-transparent font-semibold text-lg focus:outline-none focus:ring-0 border-0"
                        value={day.title}
                        onChange={(e) => updateDayTitle(dayIndex, e.target.value)}
                        onBlur={() =>
                          handleUpdate(plan.dailyPlan, plan.progress)
                        }
                      />
                    </div>
                    <ul className="space-y-1.5 pl-8 text-gray-300">
                      {day.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-brand-primary/50" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {saving && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
