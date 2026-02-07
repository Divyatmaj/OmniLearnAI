'use client';

import { useState, useCallback } from 'react';
import { X, Send } from 'lucide-react';

interface ChatbotModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChatbotModal({ open, onClose }: ChatbotModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = useCallback(async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch('/api/chatbot/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();
      setAnswer(data.answer ?? 'No answer.');
    } catch {
      setAnswer('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [question]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">Help & FAQ</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Ask a question..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
          />
          <button
            type="button"
            onClick={ask}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-primary px-4 py-3 rounded-xl font-medium hover:bg-brand-secondary disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Ask
              </>
            )}
          </button>
          {answer && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300">
              {answer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
