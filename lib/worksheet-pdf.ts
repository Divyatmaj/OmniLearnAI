/**
 * Build a school-style PDF from worksheet content (server-side, using jsPDF).
 */

import { jsPDF } from 'jspdf';
import type { WorksheetContent } from './worksheet-types';

const FONT_SIZE_TITLE = 18;
const FONT_SIZE_HEADING = 14;
const FONT_SIZE_BODY = 11;
const MARGIN = 20;
const LINE_HEIGHT = 6;
const SECTION_GAP = 10;

/** Split long text into lines that fit in width (approx chars per line). */
function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const words = text.split(/\s+/);
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = doc.getTextWidth(test);
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function addSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFontSize(FONT_SIZE_HEADING);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN, y);
  return y + LINE_HEIGHT + 2;
}

function addParagraph(doc: jsPDF, y: number, text: string, maxWidth: number): number {
  if (!text.trim()) return y;
  doc.setFontSize(FONT_SIZE_BODY);
  doc.setFont('helvetica', 'normal');
  const lines = wrapText(doc, text, maxWidth);
  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = MARGIN + LINE_HEIGHT;
    }
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  }
  return y + 2;
}

function addList(doc: jsPDF, y: number, items: string[], maxWidth: number): number {
  doc.setFontSize(FONT_SIZE_BODY);
  doc.setFont('helvetica', 'normal');
  for (const item of items) {
    if (y > 270) {
      doc.addPage();
      y = MARGIN + LINE_HEIGHT;
    }
    const lines = wrapText(doc, `• ${item}`, maxWidth);
    for (const line of lines) {
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
  }
  return y + 2;
}

function addNumberedList(doc: jsPDF, y: number, items: string[], maxWidth: number): number {
  doc.setFontSize(FONT_SIZE_BODY);
  doc.setFont('helvetica', 'normal');
  items.forEach((item, i) => {
    if (y > 270) {
      doc.addPage();
      y = MARGIN + LINE_HEIGHT;
    }
    const lines = wrapText(doc, `${i + 1}. ${item}`, maxWidth);
    for (const line of lines) {
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
  });
  return y + 2;
}

export function buildWorksheetPdf(content: WorksheetContent): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 2 * MARGIN;

  let y = MARGIN + LINE_HEIGHT;

  doc.setFontSize(FONT_SIZE_TITLE);
  doc.setFont('helvetica', 'bold');
  const titleLines = wrapText(doc, content.title || 'Worksheet', maxWidth);
  titleLines.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  });
  y += SECTION_GAP;

  if (content.explanation?.overview) {
    y = addSectionTitle(doc, y, 'Explanation');
    y = addParagraph(doc, y, content.explanation.overview, maxWidth);
  }

  if (content.explanation?.keyConcepts?.length) {
    y = addSectionTitle(doc, y, 'Key Concepts');
    y = addList(doc, y, content.explanation.keyConcepts, maxWidth);
  }

  if (content.explanation?.formulas?.length) {
    y = addSectionTitle(doc, y, 'Formulas');
    y = addList(doc, y, content.explanation.formulas, maxWidth);
  }

  if (content.solvedExamples?.length) {
    y = addSectionTitle(doc, y, 'Solved Examples');
    for (let i = 0; i < content.solvedExamples.length; i++) {
      const ex = content.solvedExamples[i];
      if (y > 260) {
        doc.addPage();
        y = MARGIN + LINE_HEIGHT;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(FONT_SIZE_BODY);
      doc.text(`Example ${i + 1}:`, MARGIN, y);
      y += LINE_HEIGHT;
      doc.setFont('helvetica', 'normal');
      y = addParagraph(doc, y, ex.question, maxWidth);
      doc.setFont('helvetica', 'bold');
      doc.text('Solution:', MARGIN, y);
      y += LINE_HEIGHT;
      doc.setFont('helvetica', 'normal');
      y = addParagraph(doc, y, ex.solution, maxWidth);
      y += 4;
    }
  }

  if (content.practiceQuestions) {
    y = addSectionTitle(doc, y, 'Practice Questions');
    if (content.practiceQuestions.sectionA?.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Section A (MCQ)', MARGIN, y);
      y += LINE_HEIGHT;
      doc.setFont('helvetica', 'normal');
      y = addNumberedList(doc, y, content.practiceQuestions.sectionA, maxWidth);
    }
    if (content.practiceQuestions.sectionB?.length) {
      if (y > 260) {
        doc.addPage();
        y = MARGIN + LINE_HEIGHT;
      }
      doc.setFont('helvetica', 'bold');
      doc.text('Section B (Short Answer)', MARGIN, y);
      y += LINE_HEIGHT;
      doc.setFont('helvetica', 'normal');
      y = addNumberedList(doc, y, content.practiceQuestions.sectionB, maxWidth);
    }
    if (content.practiceQuestions.sectionC?.length) {
      if (y > 260) {
        doc.addPage();
        y = MARGIN + LINE_HEIGHT;
      }
      doc.setFont('helvetica', 'bold');
      doc.text('Section C (Long Answer)', MARGIN, y);
      y += LINE_HEIGHT;
      doc.setFont('helvetica', 'normal');
      y = addNumberedList(doc, y, content.practiceQuestions.sectionC, maxWidth);
    }
  }

  if (content.challengeQuestions?.length) {
    y = addSectionTitle(doc, y, 'Challenge Questions');
    y = addNumberedList(doc, y, content.challengeQuestions, maxWidth);
  }

  return Buffer.from(doc.output('arraybuffer'));
}
