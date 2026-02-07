/**
 * Sanitize a string for use as a filename (remove invalid characters).
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim() || 'OmniLearn-worksheet';
}

export const downloadPDF = async (elementId: string, filename: string): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn('PDF export: element not found:', elementId);
      return;
    }

    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${sanitizeFilename(filename)}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    if (typeof window !== 'undefined') {
      alert('Export failed. The page may be too large or contain unsupported content.');
    }
  }
};
