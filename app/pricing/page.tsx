'use client';

import { CreditCard, Check, Zap } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with core learning features.',
    features: [
      '5 lessons per day',
      'Basic diagrams',
      'Quiz per topic',
      'Study planner (1 plan)',
      'Progress dashboard',
    ],
    cta: 'Get started',
    href: '/',
    primary: false,
  },
  {
    name: 'Premium',
    price: '$9',
    period: '/month',
    description: 'Unlimited learning and advanced tools.',
    features: [
      'Unlimited lessons',
      'Video scripts & diagrams',
      'Unlimited quizzes',
      'Unlimited study plans',
      'Worksheet generator',
      'Weakness detector',
      'Priority support',
    ],
    cta: 'Start trial',
    href: '#',
    primary: true,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-brand-primary/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-brand-primary/20 p-2 rounded-lg border border-brand-primary/30">
            <CreditCard className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Pricing</h1>
            <p className="text-gray-400">Free vs Premium. Choose what fits you.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border backdrop-blur-sm p-6 flex flex-col ${
                plan.primary
                  ? 'bg-brand-primary/10 border-brand-primary/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                {plan.primary && <Zap className="w-5 h-5 text-brand-primary" />}
                <h2 className="text-xl font-bold">{plan.name}</h2>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${
                  plan.primary
                    ? 'bg-brand-primary hover:bg-brand-secondary text-white'
                    : 'bg-white/10 hover:bg-white/20 border border-white/10'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-8">
          Checkout is a placeholder. Payment integration can be added later.
        </p>
      </div>
    </main>
  );
}
