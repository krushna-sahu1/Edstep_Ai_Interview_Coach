import { PDFParse } from 'pdf-parse';
import zlib from 'zlib';

/**
 * Fallback stream parser to extract text from PDF streams when pdf-parse/pdfjs-dist
 * fails, times out, or encounters missing worker/font dependencies.
 */
function extractTextFallback(buffer: Buffer): string {
  try {
    const content = buffer.toString('binary');
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    const extractedChunks: string[] = [];

    let match: RegExpExecArray | null;
    while ((match = streamRegex.exec(content)) !== null) {
      const rawStream = Buffer.from(match[1], 'binary');
      let decompressed: string;
      try {
        decompressed = zlib.inflateSync(rawStream).toString('utf-8');
      } catch {
        try {
          decompressed = zlib.unzipSync(rawStream).toString('utf-8');
        } catch {
          decompressed = rawStream.toString('utf-8');
        }
      }

      // Match PDF text blocks: BT ... ET
      const btRegex = /BT[\s\S]*?ET/g;
      let btMatch: RegExpExecArray | null;
      while ((btMatch = btRegex.exec(decompressed)) !== null) {
        const block = btMatch[0];

        // Extract (string) Tj
        const tjRegex = /\(([^)]+)\)\s*Tj/g;
        let tjMatch: RegExpExecArray | null;
        while ((tjMatch = tjRegex.exec(block)) !== null) {
          extractedChunks.push(tjMatch[1]);
        }

        // Extract [(str1) -10 (str2)] TJ
        const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
        let arrayMatch: RegExpExecArray | null;
        while ((arrayMatch = arrayTjRegex.exec(block)) !== null) {
          const inner = arrayMatch[1];
          const innerStrings = inner.match(/\(([^)]+)\)/g);
          if (innerStrings) {
            extractedChunks.push(innerStrings.map((s) => s.slice(1, -1)).join(' '));
          }
        }
      }
    }

    const raw = extractedChunks
      .join(' ')
      .replace(/\\([0-9]{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
    return raw.replace(/\s+/g, ' ').trim();
  } catch (err) {
    console.warn('Fallback PDF extraction warning:', err);
    return '';
  }
}

function cleanPdfText(rawText: string): string {
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();

  // Budget: Truncate to first 3,500 characters to preserve LLM token window
  if (cleaned.length > 3500) {
    return cleaned.slice(0, 3500) + '... [Truncated for brevity]';
  }

  return cleaned;
}

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF buffer is empty.');
  }

  let parser: any = null;

  try {
    parser = new PDFParse({ data: new Uint8Array(buffer) });

    // Race parser.getText() against a 5-second timeout to prevent indefinite hangs
    const getTextPromise = parser.getText().then((data: any) => data?.text || '');
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('PDFParse timed out after 5000ms')), 5000)
    );

    const rawText = await Promise.race([getTextPromise, timeoutPromise]);
    const cleaned = cleanPdfText(rawText);

    if (cleaned.length > 20) {
      return cleaned;
    }
  } catch (primaryErr: any) {
    console.warn('Primary PDFParse attempt failed or timed out:', primaryErr?.message || primaryErr);
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      try {
        await parser.destroy();
      } catch {
        // ignore cleanup errors
      }
    }
  }

  // Fallback to direct stream text extraction
  const fallbackText = extractTextFallback(buffer);
  const cleanedFallback = cleanPdfText(fallbackText);

  if (cleanedFallback.length > 20) {
    return cleanedFallback;
  }

  throw new Error('Failed to extract readable text from uploaded PDF. Please ensure the file is an unencrypted, text-based PDF.');
}
