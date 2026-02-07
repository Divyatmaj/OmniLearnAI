'use client';
import { useState } from 'react';
import { Sparkles, GraduationCap, Languages, FileDown, Rocket, CheckCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DiagramRenderer from '@/components/multimodal/DiagramRenderer';
import QuizSection from '@/components/multimodal/QuizSection';
import TopicBreakdown from '@/components/multimodal/TopicBreakdown';
import VideoVisualizer from '@/components/multimodal/VideoVisualizer';
import { downloadPDF } from '@/lib/utils';
import type { LearningContent } from '@/lib/types';
import { isLearningContent } from '@/lib/types';
import { AGE_MIN, AGE_MAX, AGE_DEFAULT } from '@/lib/constants';

function clampAge(value: number): number {
  if (Number.isNaN(value)) return AGE_DEFAULT;
  return Math.min(AGE_MAX, Math.max(AGE_MIN, value));
}

export default function LearnPage() {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<LearningContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'Intermediate',
    age: AGE_DEFAULT,
    language: 'English'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: clampAge(formData.age)
        })
      });
      const data = await res.json();

      if (!res.ok) {
        const message = typeof data?.error === 'string' ? data.error : 'Failed to generate content.';
        setError(message);
        setContent(null);
        return;
      }

      if (!isLearningContent(data)) {
        setError('Invalid content format from server. Please try again.');
        setContent(null);
        return;
      }
      setContent(data);
    } catch (err) {
      setError('Network or unexpected error. Check your connection and try again.');
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10);
    setFormData({ ...formData, age: Number.isNaN(raw) ? AGE_DEFAULT : clampAge(raw) });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-12 border-b border-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
              <Sparkles className="w-5 h-5 text-brand-primary" />
            </div>
            <span className="text-brand-primary uppercase tracking-[0.2em] text-xs font-bold">Next-Gen Personalized Learning</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">Learn</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Generate multimodal learning modules from any topic. High-fidelity explanations,
            interactive diagrams, audio lessons, and verification—personalized for you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Controls Panel */}
          <aside className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Error</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 backdrop-blur-sm">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject / Topic</label>
                <input
                  required
                  placeholder="e.g. Quantum Entanglement"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Age Group</label>
                  <input
                    type="number"
                    min={AGE_MIN}
                    max={AGE_MAX}
                    placeholder={String(AGE_DEFAULT)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    value={formData.age}
                    onChange={handleAgeChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 appearance-none"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option className="bg-gray-900" value="English">English</option>
                    <option className="bg-gray-900" value="Spanish">Spanish</option>
                    <option className="bg-gray-900" value="French">French</option>
                    <option className="bg-gray-900" value="German">German</option>
                    <option className="bg-gray-900" value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Expert'].map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setFormData({ ...formData, difficulty: lev })}
                      className={`py-2 text-xs rounded-lg border transition-all ${
                        formData.difficulty === lev
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {lev}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full group relative overflow-hidden bg-brand-primary px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-brand-secondary disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing...</span>
                  </div>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    Generate Module
                  </>
                )}
              </button>
            </form>
          </aside>

          {/* Results Area */}
          <section className="lg:col-span-8 min-h-[600px]">
            {!content && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-20">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <GraduationCap className="w-10 h-10 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ready to learn?</h3>
                  <p className="text-gray-500">Select a topic and customize your learning experience.</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-8 animate-pulse">
                <div className="h-64 bg-white/5 rounded-3xl" />
                <div className="h-12 w-3/4 bg-white/5 rounded-xl" />
                <div className="h-48 bg-white/5 rounded-3xl" />
              </div>
            )}

            {content && (
              <div id="export-content" className="space-y-12 pb-20">
                {/* 1. Video & Audio Header */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold">{content.topic}</h2>
                    <button
                      onClick={() => downloadPDF('export-content', `OmniLearnAI-${content.topic}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-sm"
                    >
                      <FileDown className="w-4 h-4" /> Export worksheet
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-brand-primary uppercase tracking-tighter flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified Content
                      </span>
                      <p className="text-sm text-gray-400 italic">{content.accuracyNote}</p>
                      <VideoVisualizer
                        textForAudio={content.videoScript ?? content.explanation}
                        topic={content.topic}
                        videoImageDataUrl={content.videoImageDataUrl}
                        videoDataUrl={content.videoDataUrl}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase">Topic Breakdown</h4>
                      <TopicBreakdown steps={content.breakdown} />
                    </div>
                  </div>
                </div>

                {/* 2. Main Explanation */}
                <div className="prose prose-invert max-w-none bg-white/5 p-8 rounded-3xl border border-white/10 prose-headings:text-brand-secondary prose-strong:text-brand-accent">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.explanation}</ReactMarkdown>
                </div>

                {/* 3. Mental Model / Diagram */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-accent" />
                    Conceptual Diagram
                  </h3>
                  <DiagramRenderer code={content.diagramCode} />
                </div>

                {/* 4. Knowledge Check */}
                <div className="space-y-6">
                  <div className="bg-brand-primary/20 w-fit px-3 py-1 rounded-full text-xs font-bold text-brand-primary border border-brand-primary/30">
                    INTERACTIVE QUIZ
                  </div>
                  <QuizSection quiz={content.quiz} />
                </div>

              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
             OmniLearnAI
          </div>
          <p className="text-gray-500 text-sm">Powered by Groq (Llama 3.3) & Omni Multimodal Engine v1.0</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs text-gray-400">
              <Languages className="w-4 h-4" /> 10+ Languages Supported
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
