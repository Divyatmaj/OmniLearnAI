import { NextResponse } from 'next/server';

/** Simple FAQ-based placeholder for website help. */
const FAQ: { q: string; a: string }[] = [
  { q: 'How do I generate a lesson?', a: 'Go to the Home page, enter a topic, set difficulty and language, then click Generate Module.' },
  { q: 'What is the Study Planner?', a: 'Enter your exam date to get a daily study plan. You can edit tasks and track progress.' },
  { q: 'How do I get a worksheet?', a: 'Use the Worksheet Generator: pick a topic and difficulty, then generate and download the PDF.' },
  { q: 'Where is my progress?', a: 'Check the Progress Dashboard for XP, badges, and weakness insights.' },
  { q: 'How do I contact support?', a: 'Use the Contact page to send a message. We\'ll reply to your email.' },
];

/** POST /api/chatbot/help - Returns FAQ answer for a question (simple keyword match). */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = (body?.question ?? body?.q ?? '').toString().toLowerCase();

    if (!question) {
      return NextResponse.json(
        { answer: 'Ask me anything about OmniLearnAI. Try: "How do I generate a lesson?"' }
      );
    }

    for (const faq of FAQ) {
      const words = faq.q.toLowerCase().split(/\s+/).filter(Boolean);
      if (words.some((w) => question.includes(w))) {
        return NextResponse.json({ answer: faq.a });
      }
    }

    return NextResponse.json({
      answer: 'I\'m a simple help bot. Try asking: "How do I generate a lesson?" or "What is the Study Planner?"',
    });
  } catch (e) {
    console.error('Chatbot help error:', e);
    return NextResponse.json(
      { answer: 'Something went wrong. Please try again or use the Contact page.' },
      { status: 500 }
    );
  }
}
