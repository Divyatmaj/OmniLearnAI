'use client';

import { useState } from 'react';
import { Mail, Send, Loader2, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setLoading(true);
    setError(null);
    setSent(false);
    try {
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to send');
        return;
      }
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
            <Mail className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Contact</h1>
            <p className="text-gray-400">Send a message or find us online.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
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
                  Message sent. We&apos;ll get back to you at your email.
                </div>
              )}
              <label className="block text-sm font-medium text-gray-400">Name</label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="block text-sm font-medium text-gray-400">Message</label>
              <textarea
                required
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
                    <Send className="w-5 h-5" />
                    Send
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand-primary" />
                Email & social
              </h3>
              <p className="text-gray-400 mb-2">support@omnilearnai.com</p>
              <p className="text-sm text-gray-500">
                We respond within 24–48 hours. For help with the app, use the Help (chat) button in the navbar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
