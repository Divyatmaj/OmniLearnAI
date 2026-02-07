'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Loader2,
  FileDown,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Target,
} from 'lucide-react';
import type { WorksheetContent } from '@/lib/worksheet-types';
import { useSession } from '@/lib/use-session';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Expert'];

export default function WorksheetPage() {
  const { user, loading: sessionLoading } = useSession();
  const userId = user?.id ?? null;
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [worksheetId, setWorksheetId] = useState<string | null>(null);
  const [content, setContent] = useState<WorksheetContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const trimmed = topic.trim();
    if (!trimmed) {
      setError('Please enter a topic.');
      return;
    }
    if (!userId) {
      setError('Please log in to generate a worksheet.');
      return;
    }
    submittingRef.current = true;
    setLoading(true);
    setError(null);
    setWorksheetId(null);
    setContent(null);
    try {
      const res = await fetch('/api/worksheet/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: trimmed, difficulty }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.status === 401) {
        setError(data.error ?? 'Please log in to generate a worksheet.');
        return;
      }
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate worksheet.');
        return;
      }
      setWorksheetId(data.id);
      setContent(data.content ?? null);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleDownloadPdf = async () => {
    if (!userId) {
      setError('Please log in to download the PDF.');
      return;
    }
    if (worksheetId) {
      setPdfLoading(true);
      try {
        const res = await fetch('/api/worksheet/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ worksheetId }),
          credentials: 'include',
        });
        if (res.status === 401 || res.status === 403) {
          const data = await res.json();
          setError(data.error ?? 'Not authorized to download.');
          return;
        }
        if (!res.ok) {
          setError('Failed to generate PDF.');
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Worksheet-${(content?.title || topic || 'OmniLearnAI').replace(/[<>:"/\\|?*]/g, '_')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        setError('Download failed.');
      } finally {
        setPdfLoading(false);
      }
    } else if (content) {
      setPdfLoading(true);
      try {
        const res = await fetch('/api/worksheet/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) {
          setError('Failed to generate PDF.');
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Worksheet-${(content.title || topic || 'OmniLearnAI').replace(/[<>:"/\\|?*]/g, '_')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        setError('Download failed.');
      } finally {
        setPdfLoading(false);
      }
    }
  };

  const hasContent = content && (content.title || content.explanation?.overview || content.solvedExamples?.length || content.practiceQuestions?.sectionA?.length || content.challengeQuestions?.length);

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
            <FileText className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Worksheet Generator</h1>
            <p className="text-gray-400">AI-powered school-style worksheets. Choose topic and difficulty, then generate and download PDF.</p>
          </div>
        </div>

        {!sessionLoading && !userId && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex flex-wrap items-center gap-2">
            <span>You must be logged in to generate worksheets.</span>
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
              <label className="block text-sm font-medium text-gray-400">Topic</label>
              <input
                type="text"
                required
                placeholder="e.g. Quadratic Equations"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <label className="block text-sm font-medium text-gray-400">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-sm rounded-lg border transition-all ${
                      difficulty === d
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={loading || !userId}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary px-4 py-3 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Generate worksheet
                  </>
                )}
              </button>
            </form>
          </aside>

          <section className="lg:col-span-8">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p>Generating your worksheet...</p>
              </div>
            )}

            {!loading && !userId && (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                <FileDown className="w-16 h-16 mb-4 opacity-50" />
                <p>Log in to generate and view worksheets.</p>
                <Link href="/auth/login" className="mt-4 text-brand-primary hover:underline">
                  Log in
                </Link>
              </div>
            )}

            {!loading && userId && !hasContent && (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                <p>Enter a topic and click Generate worksheet to create an AI-powered worksheet.</p>
              </div>
            )}

            {!loading && hasContent && content && (
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold">{content.title || topic}</h2>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary/20 border border-brand-primary/30 rounded-lg hover:bg-brand-primary/30 text-sm font-medium disabled:opacity-50"
                  >
                    {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download PDF
                  </button>
                </div>

                <p className="text-gray-400 text-sm">Difficulty: {difficulty}</p>

                {content.explanation?.overview && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-brand-primary">
                      <BookOpen className="w-5 h-5" />
                      Explanation
                    </h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{content.explanation.overview}</p>
                    {content.explanation.keyConcepts?.length > 0 && (
                      <>
                        <h4 className="mt-4 font-medium text-gray-400">Key concepts</h4>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 mt-1">
                          {content.explanation.keyConcepts.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {content.explanation.formulas?.length > 0 && (
                      <>
                        <h4 className="mt-4 font-medium text-gray-400">Formulas</h4>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 mt-1">
                          {content.explanation.formulas.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

                {content.solvedExamples?.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-brand-primary">
                      <HelpCircle className="w-5 h-5" />
                      Solved Examples
                    </h3>
                    <div className="space-y-6">
                      {content.solvedExamples.map((ex, i) => (
                        <div key={i} className="border-l-2 border-brand-primary/50 pl-4">
                          <p className="font-medium text-gray-200 mb-1">Q: {ex.question}</p>
                          <p className="text-gray-400 text-sm">Solution: {ex.solution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {((content.practiceQuestions?.sectionA?.length ?? 0) +
                  (content.practiceQuestions?.sectionB?.length ?? 0) +
                  (content.practiceQuestions?.sectionC?.length ?? 0) > 0) && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-brand-primary">
                      <Lightbulb className="w-5 h-5" />
                      Practice Questions
                    </h3>
                    {content.practiceQuestions.sectionA?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-400 mb-2">Section A (MCQ)</h4>
                        <ol className="list-decimal list-inside text-gray-300 space-y-2">
                          {content.practiceQuestions.sectionA.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {content.practiceQuestions.sectionB?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-400 mb-2">Section B (Short Answer)</h4>
                        <ol className="list-decimal list-inside text-gray-300 space-y-2">
                          {content.practiceQuestions.sectionB.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {content.practiceQuestions.sectionC?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-400 mb-2">Section C (Long Answer)</h4>
                        <ol className="list-decimal list-inside text-gray-300 space-y-2">
                          {content.practiceQuestions.sectionC.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {content.challengeQuestions?.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-brand-primary">
                      <Target className="w-5 h-5" />
                      Challenge Questions
                    </h3>
                    <ol className="list-decimal list-inside text-gray-300 space-y-2">
                      {content.challengeQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
