'use client';
import { motion } from 'framer-motion';

interface Props {
  steps?: string[] | null;
}

export default function TopicBreakdown({ steps: rawSteps }: Props) {
  const steps = Array.isArray(rawSteps) ? rawSteps : [];

  return (
    <div className="space-y-4">
      {steps.length === 0 ? (
        <p className="text-gray-500 text-sm">No breakdown steps available.</p>
      ) : (
        steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-brand-primary/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-sm border border-brand-primary/30">
              {idx + 1}
            </div>
            <p className="text-gray-200 font-medium">{step}</p>
          </motion.div>
        ))
      )}
    </div>
  );
}
