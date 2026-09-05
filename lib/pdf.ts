import pdfParse from 'pdf-parse';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
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
  }
}
