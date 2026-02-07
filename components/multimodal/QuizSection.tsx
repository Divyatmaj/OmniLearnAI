'use client';
import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import type { QuizItem } from '@/lib/types';

interface Props {
  quiz: QuizItem[] | undefined | null;
}

export default function QuizSection({ quiz: rawQuiz }: Props) {
  const quiz = Array.isArray(rawQuiz) ? rawQuiz : [];
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const handleSelect = (option: string) => {
    if (selected || quiz.length === 0) return;
    setSelected(option);
    const correct = option === quiz[currentStep].answer;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    setSelected(null);
    setIsCorrect(null);
    setCurrentStep((s) => s + 1);
  };

  if (quiz.length === 0) {
    return (
      <div className="bg-white/5 p-8 rounded-2xl text-center border border-white/10">
        <p className="text-gray-400">No quiz questions available for this topic.</p>
      </div>
    );
  }

  if (currentStep >= quiz.length) {
    return (
      <div className="bg-white/5 p-8 rounded-2xl text-center border border-white/10">
        <h3 className="text-3xl font-bold text-white mb-2">Quiz Complete! 🎉</h3>
        <p className="text-gray-400 mb-6">You scored {score} out of {quiz.length}</p>
        <button
          onClick={() => {
            setCurrentStep(0);
            setScore(0);
          }}
          className="bg-brand-primary px-6 py-2 rounded-lg text-white font-medium hover:bg-brand-secondary transition-colors"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  const q = quiz[currentStep];

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <span className="text-brand-accent font-bold">Question {currentStep + 1} of {quiz.length}</span>
        <span className="text-xs text-gray-500 uppercase tracking-widest">Knowledge Check</span>
      </div>

      <h3 className="text-xl text-white font-semibold mb-6">{q.question}</h3>

      <div className="grid gap-3">
        {(q.options ?? []).map((option, idx) => (
          <button
            key={idx}
            disabled={!!selected}
            onClick={() => handleSelect(option)}
            className={`w-full p-4 rounded-xl border text-left transition-all ${
              selected === option
                ? isCorrect ? 'bg-green-500/20 border-green-500 text-green-200' : 'bg-red-500/20 border-red-500 text-red-200'
                : selected && option === q.answer ? 'bg-green-500/20 border-green-500 text-green-200' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              {option}
              {selected === option && (
                isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />
              )}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-6 p-4 bg-brand-primary/10 rounded-xl border border-brand-primary/20 quiz-explanation-in">
          <p className="text-sm text-brand-primary font-medium mb-1">Explanation:</p>
          <p className="text-gray-300 text-sm italic">{q.explanation}</p>
          <button
            onClick={nextQuestion}
            className="mt-4 flex items-center gap-2 text-white bg-brand-primary px-4 py-2 rounded-lg text-sm ml-auto"
          >
            Next Question <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
