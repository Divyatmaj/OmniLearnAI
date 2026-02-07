'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Loader2, GraduationCap, Sparkles, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Signup failed');
        return;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('omnilearn-user', JSON.stringify({ id: data.id, email: data.email, name: data.name }));
      }
      window.location.href = '/learn';
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'AI-powered learning modules',
    'Study planner & worksheets',
    'Progress tracking & XP',
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-secondary/10 via-transparent to-brand-accent/10">
        <div className="absolute inset-0 bg-[#0a0a0c]/40 z-10" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-secondary/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-brand-accent/10 blur-[80px] rounded-full" />
        <div className="relative z-20 flex flex-col justify-center px-12 xl:px-20">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
              <GraduationCap className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="font-bold text-xl">OmniLearnAI</span>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl xl:text-5xl font-bold mb-6 leading-tight"
          >
            Start learning
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-accent">
              smarter today
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg max-w-md mb-8"
          >
            Create your free account and unlock personalized AI learning, study plans, and more.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 mb-12"
          >
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-brand-primary" />
                </div>
                <span>{b}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 w-full max-w-md aspect-video"
          >
            <Image
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"
              alt="Education"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-2 mt-8 text-sm text-gray-400"
          >
            <Sparkles className="w-4 h-4 text-brand-secondary" />
            <span>Free to start • No credit card required</span>
          </motion.div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
              <GraduationCap className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="font-bold text-xl">OmniLearnAI</span>
          </div>

          <h2 className="text-3xl font-bold mb-2">Create account</h2>
          <p className="text-gray-400 mb-8">Get started with OmniLearnAI in seconds</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Name (optional)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Optional for demo; recommended for real use</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary px-4 py-3.5 rounded-xl font-semibold hover:bg-brand-secondary disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
