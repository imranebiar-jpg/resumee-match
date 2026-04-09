import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker from pdfjs-dist
// In Vite, we can import the worker as a URL
// @ts-ignore - Vite specific import
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF. Please ensure the file is a valid, non-encrypted PDF.');
  }
}
