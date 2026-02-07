'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Calendar,
  FileText,
  BarChart3,
  Target,
  Sparkles,
  Star,
  ChevronRight,
  BookOpen,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

const features = [
  {
    icon: GraduationCap,
    title: 'AI-Powered Learning',
    description: 'Generate multimodal modules from any topic—explanations, diagrams, audio, and quizzes tailored to your level.',
  },
  {
    icon: Calendar,
    title: 'Study Planner',
    description: 'Create personalized exam schedules with daily tasks. Track progress and stay on top of your goals.',
  },
  {
    icon: FileText,
    title: 'Worksheet Generator',
    description: 'AI-generated practice worksheets for any subject. Export to PDF and practice at your own pace.',
  },
  {
    icon: BarChart3,
    title: 'Progress Dashboard',
    description: 'Earn XP, unlock badges, and track your learning journey. Weekly analytics keep you motivated.',
  },
  {
    icon: Target,
    title: 'Weakness Detector',
    description: 'Upload marksheets or answer sheets. Get AI-powered analysis of weak topics and improvement suggestions.',
  },
];

const reasons = [
  {
    icon: Zap,
    title: 'Personalized for You',
    text: 'Content adapts to your age, difficulty level, and language. Learn the way that works for you.',
  },
  {
    icon: Shield,
    title: 'Verified & Accurate',
    text: 'AI-generated content is structured for accuracy. Topic breakdowns and quizzes reinforce understanding.',
  },
  {
    icon: Globe,
    title: '10+ Languages',
    text: 'Learn in English, Spanish, French, German, Hindi, and more. Break language barriers.',
  },
];

const testimonials = [
  {
    name: 'Priya S.',
    role: 'Class 10 Student',
    text: 'OmniLearnAI helped me understand quantum physics in a way my textbook never did. The diagrams and audio explanations are amazing!',
    rating: 5,
  },
  {
    name: 'Arjun M.',
    role: 'Medical Student',
    text: 'The study planner and worksheet generator saved my exam prep. I could finally focus on my weak topics.',
    rating: 5,
  },
  {
    name: 'Dr. Sarah L.',
    role: 'Educator',
    text: 'I use it to create supplemental materials for my students. The quality and customization options are impressive.',
    rating: 5,
  },
];

const images = [
  {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600',
    alt: 'Students collaborating',
  },
  {
    src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600',
    alt: 'Books and learning',
  },
  {
    src: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600',
    alt: 'Focused study',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30 overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-secondary/15 blur-[80px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="text-center"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Education Platform
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
                Learn Smarter,
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
                Not Harder
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              OmniLearnAI is your all-in-one learning companion. Generate AI modules, plan exams, create worksheets,
              and detect weak spots—all personalized to you.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-primary text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-secondary transition-all hover:scale-[1.02]"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Product Explanation */}
      <section className="py-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What OmniLearnAI Does</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From any topic you enter, we generate rich learning modules with explanations, diagrams, audio lessons,
              and quizzes. Plus study planning, worksheets, and weakness analysis—all in one place.
            </p>
          </motion.div>

          {/* Education Images with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
          >
            {images.map((img, i) => (
              <motion.div
                key={img.alt}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>

          {/* Key Features */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-12"
          >
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use OmniLearnAI */}
      <section className="py-24 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-4"
          >
            Why Use OmniLearnAI?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gray-400 text-center mb-16 max-w-xl mx-auto"
          >
            Built for students, educators, and lifelong learners who want more from their study time.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center mb-4">
                  <r.icon className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{r.title}</h3>
                <p className="text-gray-400">{r.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-4"
          >
            What People Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gray-400 text-center mb-16"
          >
            Trusted by students and educators worldwide
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 text-center"
        >
          <div className="p-12 rounded-3xl bg-gradient-to-br from-brand-primary/20 via-brand-secondary/10 to-brand-accent/10 border border-white/10">
            <BookOpen className="w-16 h-16 text-brand-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of learners. Start free—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="px-8 py-4 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-all"
              >
                Create Free Account
              </Link>
              <Link
                href="/learn"
                className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/5 transition-all"
              >
                Try Learn (No Account)
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <GraduationCap className="w-6 h-6 text-brand-primary" />
            OmniLearnAI
          </div>
          <div className="flex items-center gap-6">
            <Link href="/learn" className="text-gray-400 hover:text-white text-sm">Learn</Link>
            <Link href="/planner" className="text-gray-400 hover:text-white text-sm">Planner</Link>
            <Link href="/worksheet" className="text-gray-400 hover:text-white text-sm">Worksheet</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
