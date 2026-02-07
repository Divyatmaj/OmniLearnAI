import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { buildWorksheetPdf } from '@/lib/worksheet-pdf';
import { parseWorksheetContent, type WorksheetContent } from '@/lib/worksheet-types';

/** POST /api/worksheet/pdf - Return worksheet as PDF. Send either worksheetId or content JSON. Auth required for worksheetId. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { worksheetId, content: bodyContent } = body as {
      worksheetId?: string;
      content?: unknown;
    };

    let content: WorksheetContent | null = null;

    if (worksheetId) {
      const session = await getSession(req);
      if (!session) {
        return NextResponse.json(
          { error: 'Please log in to download this worksheet.' },
          { status: 401 }
        );
      }
      const worksheet = await prisma.worksheet.findUnique({
        where: { id: worksheetId },
      });
      if (!worksheet) {
        return NextResponse.json({ error: 'Worksheet not found.' }, { status: 404 });
      }
      if (worksheet.userId !== session.userId) {
        return NextResponse.json(
          { error: 'Not authorized to download this worksheet.' },
          { status: 403 }
        );
      }
      content = parseWorksheetContent(worksheet.content);
    } else if (bodyContent && typeof bodyContent === 'object') {
      content = parseWorksheetContent(JSON.stringify(bodyContent));
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Provide worksheetId or content object.' },
        { status: 400 }
      );
    }

    const pdfBuffer = buildWorksheetPdf(content);
    const filename = `Worksheet-${(content.title || 'OmniLearnAI').replace(/[<>:"/\\|?*]/g, '_')}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (e) {
    console.error('Worksheet PDF error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
