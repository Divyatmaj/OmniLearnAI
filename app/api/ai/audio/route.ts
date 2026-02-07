import { generateAudio } from '@/lib/groq';
import { NextResponse } from 'next/server';

/** Orpheus TTS accepts max 200 characters per request. */
const MAX_TEXT_LENGTH = 200;

async function getTextFromRequest(req: Request): Promise<string | null> {
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      const body = await req.json();
      const text = typeof body?.text === 'string' ? body.text : null;
      return text ? text.substring(0, MAX_TEXT_LENGTH) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const text = await getTextFromRequest(req);
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }
    const { buffer, contentType } = await generateAudio(text);
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Audio generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');

  if (!text) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  try {
    const { buffer, contentType } = await generateAudio(text.substring(0, MAX_TEXT_LENGTH));
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Audio generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
