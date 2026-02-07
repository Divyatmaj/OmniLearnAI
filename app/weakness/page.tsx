'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Target, Upload, FileText, Loader2, BarChart3, Plus, Trash2 } from 'lucide-react';
import { useSession } from '@/lib/use-session';

type SubjectRow = { name: string; marks: string; maxMarks: string };

const defaultSubject = (): SubjectRow => ({ name: '', marks: '', maxMarks: '100' });

export default function WeaknessPage() {
  const { user, loading: sessionLoading } = useSession();
  const [tab, setTab] = useState<'upload' | 'marksheet'>('marksheet');
  const [fileUrl, setFileUrl] = useState('');
  const [reportId, setReportId] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Marksheet analysis state
  const [studentName, setStudentName] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [examType, setExamType] = useState('');
  const [subjects, setSubjects] = useState<SubjectRow[]>([defaultSubject(), defaultSubject(), defaultSubject()]);
  const [marksheetAnalysis, setMarksheetAnalysis] = useState('');
  const [marksheetLoading, setMarksheetLoading] = useState(false);
  const marksheetSubmittingRef = useRef(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReportId(null);
    setSummary('');
    setTopics([]);
    try {
      const res = await fetch('/api/weakness/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputFileUrl: fileUrl.trim() || undefined,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Upload failed');
        return;
      }
      setReportId(data.id);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!reportId) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/weakness/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          summary: 'Sample weakness summary based on answer sheet. Focus on practice in algebra and geometry.',
          topicsDetected: ['Algebra', 'Geometry', 'Word problems'],
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Analysis failed');
        return;
      }
      setSummary(data.summary ?? '');
      setTopics(data.topicsDetected ?? []);
    } catch {
      setError('Network error.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMarksheetAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (marksheetSubmittingRef.current) return;
    setError(null);
    setMarksheetAnalysis('');
    const payload = {
      studentName: studentName.trim() || 'Student',
      class: classGrade.trim() || '—',
      examType: examType.trim() || 'Exam',
      subjects: subjects
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          marks: Number(s.marks) || 0,
          maxMarks: Math.max(1, Number(s.maxMarks) || 100),
        })),
    };
    if (payload.subjects.length === 0) {
      setError('Add at least one subject with name and marks.');
      return;
    }
    marksheetSubmittingRef.current = true;
    setMarksheetLoading(true);
    try {
      const res = await fetch('/api/marksheet/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Analysis failed');
        return;
      }
      setMarksheetAnalysis(data.analysis ?? '');
    } catch {
      setError('Network error.');
    } finally {
      setMarksheetLoading(false);
      marksheetSubmittingRef.current = false;
    }
  };

  const addSubjectRow = () => setSubjects((s) => [...s, defaultSubject()]);
  const removeSubjectRow = (i: number) =>
    setSubjects((s) => (s.length <= 1 ? s : s.filter((_, idx) => idx !== i)));
  const updateSubject = (i: number, field: keyof SubjectRow, value: string) =>
    setSubjects((s) => s.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
            <Target className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Weakness Detector</h1>
            <p className="text-gray-400">Marksheet analysis or answer sheet upload for topic suggestions.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            type="button"
            onClick={() => { setTab('marksheet'); setError(null); }}
            className={`px-4 py-2 rounded-t-lg font-medium flex items-center gap-2 transition-colors ${
              tab === 'marksheet'
                ? 'bg-brand-primary/20 text-brand-primary border border-b-0 border-white/10 -mb-px'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Marksheet Analysis
          </button>
          <button
            type="button"
            onClick={() => { setTab('upload'); setError(null); }}
            className={`px-4 py-2 rounded-t-lg font-medium flex items-center gap-2 transition-colors ${
              tab === 'upload'
                ? 'bg-brand-primary/20 text-brand-primary border border-b-0 border-white/10 -mb-px'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Answer Sheet
          </button>
        </div>

        {tab === 'marksheet' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-4">
              <form
                onSubmit={handleMarksheetAnalyze}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                    {error}
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-400">Student name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
                <label className="block text-sm font-medium text-gray-400">Class / Grade</label>
                <input
                  type="text"
                  placeholder="e.g. 10"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                />
                <label className="block text-sm font-medium text-gray-400">Exam type</label>
                <input
                  type="text"
                  placeholder="e.g. Mid-term, Annual"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-400">Subjects & marks</label>
                  <button
                    type="button"
                    onClick={addSubjectRow}
                    className="text-brand-primary text-sm font-medium flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="space-y-3">
                  {subjects.map((row, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Subject"
                        className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm"
                        value={row.name}
                        onChange={(e) => updateSubject(i, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Marks"
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm"
                        value={row.marks}
                        onChange={(e) => updateSubject(i, 'marks', e.target.value)}
                      />
                      <span className="text-gray-500 text-sm">/</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Max"
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm"
                        value={row.maxMarks}
                        onChange={(e) => updateSubject(i, 'maxMarks', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeSubjectRow(i)}
                        className="p-2 text-gray-400 hover:text-red-300 rounded-lg"
                        aria-label="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={marksheetLoading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-primary px-4 py-3 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-50 transition-all"
                >
                  {marksheetLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      Get performance analysis
                    </>
                  )}
                </button>
              </form>
            </aside>
            <section className="lg:col-span-8">
              {marksheetAnalysis ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:text-brand-primary prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{marksheetAnalysis}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                  <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                  <p>Enter student details and subject marks, then click &quot;Get performance analysis&quot;.</p>
                  <p className="text-sm mt-2">You’ll get weak subjects, root causes, strategies, and a 30-day plan.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {tab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-4">
              <form
                onSubmit={handleUpload}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                    {error}
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-400">
                  Answer sheet URL or path
                </label>
                <input
                  type="text"
                  placeholder="e.g. /uploads/answer-sheet.pdf"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-primary px-4 py-3 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload
                    </>
                  )}
                </button>
                {reportId && (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full flex items-center justify-center gap-2 bg-brand-secondary/80 px-4 py-3 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-50 transition-all"
                  >
                    {analyzing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Analyze
                      </>
                    )}
                  </button>
                )}
              </form>
            </aside>
            <section className="lg:col-span-8">
              {(summary || topics.length > 0) && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-6">
                  <h3 className="text-lg font-semibold">Weakness summary</h3>
                  <p className="text-gray-300">{summary}</p>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Topic suggestions</h4>
                    <ul className="flex flex-wrap gap-2">
                      {topics.map((t, i) => (
                        <li
                          key={i}
                          className="px-3 py-1.5 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-sm"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {!reportId && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                  <Upload className="w-16 h-16 mb-4 opacity-50" />
                  <p>Enter a file URL and upload to create a report, then run Analyze.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
