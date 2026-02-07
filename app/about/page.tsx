'use client';

import { Info, Target, Eye, Users, Award } from 'lucide-react';

const SECTIONS = [
  {
    icon: Target,
    title: 'Mission',
    body: 'Make personalized, multimodal learning accessible to every student. We combine AI-generated explanations, diagrams, and practice so you learn faster and retain more.',
  },
  {
    icon: Eye,
    title: 'Vision',
    body: 'A world where every learner has a tailored tutor: adaptive content, instant feedback, and clear progress—all in one platform.',
  },
  {
    icon: Users,
    title: 'Team',
    body: 'OmniLearnAI is built by educators and engineers who care about learning outcomes. We iterate based on feedback from students and teachers.',
  },
  {
    icon: Award,
    title: 'Achievements',
    body: 'Trusted by learners for AI-powered lessons, study planning, and weakness detection. We continue to add features like worksheets and progress dashboards.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
            <Info className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">About OmniLearnAI</h1>
            <p className="text-gray-400">Mission, vision, team, and achievements.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SECTIONS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-brand-primary" />
                <h2 className="text-xl font-semibold">{title}</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
