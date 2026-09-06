import { PDFParse } from 'pdf-parse';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const data = await parser.getText();
    const rawText = data.text || '';
    
    // Normalize whitespace and newlines
    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/ +/g, ' ')
      .replace(/\n\s*\n+/g, '\n\n')
      .trim();

    // Budget: Truncate to first 3,500 characters to preserve LLM token window
    if (cleanedText.length > 3500) {
      return cleanedText.slice(0, 3500) + '... [Truncated for brevity]';
    }

    return cleanedText;
  } catch (error) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error('Failed to parse uploaded PDF. Please ensure the file is a valid, unencrypted PDF.');
  } finally {
    await parser.destroy();
  }
}
