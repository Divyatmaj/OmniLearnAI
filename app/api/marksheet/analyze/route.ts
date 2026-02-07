import { NextResponse } from 'next/server';
import { generateMarksheetAnalysis } from '@/lib/marksheet-analysis';

type SubjectInput = { name: string; marks: number; maxMarks: number };

/** POST /api/marksheet/analyze - Full academic performance analysis from marksheet data. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentName,
      class: classGrade,
      examType,
      subjects,
    } = body as {
      studentName?: string;
      class?: string;
      examType?: string;
      subjects?: SubjectInput[];
    };

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: 'Provide at least one subject with marks and maxMarks.' },
        { status: 400 }
      );
    }

    const normalized = subjects.map((s) => ({
      name: String(s?.name ?? '').trim() || 'Subject',
      marks: Number(s?.marks) || 0,
      maxMarks: Math.max(1, Number(s?.maxMarks) || 100),
    }));

    const analysis = await generateMarksheetAnalysis({
      studentName: String(studentName ?? '').trim() || 'Student',
      class: String(classGrade ?? '').trim() || '—',
      examType: String(examType ?? '').trim() || 'Exam',
      subjects: normalized,
    });

    return NextResponse.json({ analysis });
  } catch (e) {
    console.error('Marksheet analyze error:', e);
    const rawMsg = e instanceof Error ? e.message : String(e);
    if (rawMsg.includes('GROQ_API_KEY')) {
      return NextResponse.json(
        { error: 'Missing GROQ_API_KEY. Add it to .env.local for marksheet analysis.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: rawMsg || 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
