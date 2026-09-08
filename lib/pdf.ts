import { PDFParse } from 'pdf-parse';
import zlib from 'zlib';

function decodePdfString(str: string): string {
  // Hex string: <48656c6c6f> or <00480065006c006c006f>
  if (str.startsWith('<') && str.endsWith('>')) {
    const hex = str.slice(1, -1).replace(/\s+/g, '');
    if (hex.length % 2 === 0) {
      const buf = Buffer.from(hex, 'hex');
      // Detect UTF-16BE
      if (hex.toLowerCase().startsWith('feff') || (buf.length >= 4 && buf[0] === 0 && buf[2] === 0)) {
        return buf.swap16().toString('utf8').replace(/\0/g, '');
      }
      return buf.toString('latin1');
    }
  }

  // Literal string: (Hello World)
  if (str.startsWith('(') && str.endsWith(')')) {
    return str
      .slice(1, -1)
      .replace(/\\([0-9]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
      .replace(/\\([nrtbf\\()])/g, (_, ch) => {
        const map: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' };
        return map[ch] || ch;
      });
  }

  return '';
}

/**
 * Robust stream parser that handles flate, raw deflate, literal strings,
 * hex strings (ASCII & UTF-16BE), and kerning arrays from any PDF version.
 */
function extractAllPdfText(buffer: Buffer): string {
  try {
    const content = buffer.toString('binary');
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    const chunks: string[] = [];

    let match: RegExpExecArray | null;
    while ((match = streamRegex.exec(content)) !== null) {
      const raw = Buffer.from(match[1], 'binary');
      let decompressed = '';

      try {
        decompressed = zlib.inflateSync(raw).toString('latin1');
      } catch {
        try {
          decompressed = zlib.inflateRawSync(raw).toString('latin1');
        } catch {
          try {
            decompressed = zlib.unzipSync(raw).toString('latin1');
          } catch {
            decompressed = raw.toString('latin1');
          }
        }
      }

      // 1. Extract from text blocks (BT ... ET)
      const btRegex = /BT[\s\S]*?ET/g;
      let btMatch: RegExpExecArray | null;
      let hasBt = false;
      while ((btMatch = btRegex.exec(decompressed)) !== null) {
        hasBt = true;
        const block = btMatch[0];

        // Match (str) Tj or <hex> Tj
        const tjRegex = /(\([^)]*\)|<[0-9a-fA-F\s]+>)\s*Tj/g;
        let tj: RegExpExecArray | null;
        while ((tj = tjRegex.exec(block)) !== null) {
          const decoded = decodePdfString(tj[1]);
          if (decoded) chunks.push(decoded);
        }

        // Match [ ... ] TJ
        const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
        let arr: RegExpExecArray | null;
        while ((arr = tjArrayRegex.exec(block)) !== null) {
          const inner = arr[1];
          const itemRegex = /(\([^)]*\)|<[0-9a-fA-F\s]+>)/g;
          let item: RegExpExecArray | null;
          let line = '';
          while ((item = itemRegex.exec(inner)) !== null) {
            const decoded = decodePdfString(item[1]);
            if (decoded) line += decoded;
          }
          if (line) chunks.push(line);
        }
      }

      // If no BT blocks in stream, look for Tj directly in decompressed stream
      if (!hasBt) {
        const tjRegex = /(\([^)]*\)|<[0-9a-fA-F\s]{4,}>)\s*Tj/g;
        let tj: RegExpExecArray | null;
        while ((tj = tjRegex.exec(decompressed)) !== null) {
          const decoded = decodePdfString(tj[1]);
          if (decoded) chunks.push(decoded);
        }
      }
    }

    const text = chunks.join(' ').replace(/\s+/g, ' ').trim();
    if (text.length > 20) return text;

    return '';
  } catch (err) {
    console.warn('Fallback PDF extraction error:', err);
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

    // Catch errors on getTextPromise immediately to prevent unhandled rejections
    const getTextPromise = parser
      .getText()
      .then((data: any) => data?.text || '')
      .catch((err: any) => {
        console.warn('Primary PDFParse getText error caught:', err?.message || err);
        return '';
      });

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('PDFParse timed out after 4000ms')), 4000)
    );

    const rawText = await Promise.race([getTextPromise, timeoutPromise]).catch(() => '');
    const cleaned = cleanPdfText(rawText);

    if (cleaned.length > 20) {
      return cleaned;
    }
  } catch (primaryErr: any) {
    console.warn('Primary PDFParse attempt bypassed:', primaryErr?.message || primaryErr);
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      try {
        await parser.destroy();
      } catch {
        // ignore cleanup errors
      }
    }
  }

  // Fallback: extract text directly from streams and objects
  const fallbackText = extractAllPdfText(buffer);
  const cleanedFallback = cleanPdfText(fallbackText);

  if (cleanedFallback.length > 20) {
    return cleanedFallback;
  }

  throw new Error('Could not extract readable text from uploaded PDF. Please ensure the file contains selectable text rather than scanned images.');
}
