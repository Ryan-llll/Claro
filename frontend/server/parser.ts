import crypto from 'crypto';
import { parseOffice } from 'officeparser';
import AdmZip from 'adm-zip';

export interface SlideImage {
  mimeType: string;
  base64: string;
}

export interface ExtractedDocument {
  fileHash: string;
  text: string;
  charCount: number;
  slideImages?: SlideImage[];
}

/**
 * Computes a SHA-256 hash of the file buffer for instant database caching.
 */
export function computeFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Recursively extracts plain text from officeparser AST nodes if an object was returned.
 */
function extractTextNodes(node: any): string[] {
  if (!node) return [];
  if (typeof node === 'string') return [node];
  const results: string[] = [];
  if (node.text && typeof node.text === 'string' && node.text.trim()) {
    results.push(node.text.trim());
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      results.push(...extractTextNodes(child));
    }
  }
  if (Array.isArray(node.content)) {
    for (const item of node.content) {
      results.push(...extractTextNodes(item));
    }
  }
  return results;
}

/**
 * Extracts key slide images from a PowerPoint (.pptx) file.
 * College professors often use handwritten stylus ink, formula snips, or textbook screenshots.
 * By extracting the primary visual from each slide, Gemini can read math formulas and diagrams directly.
 */
function extractPptxSlideImages(buffer: Buffer): SlideImage[] {
  try {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    // Find all slide relationship manifests
    const relEntries = entries.filter(
      (e) => e.entryName.startsWith('ppt/slides/_rels/slide') && e.entryName.endsWith('.xml.rels')
    );

    // Sort naturally by slide number: slide1, slide2, ..., slide14
    relEntries.sort((a, b) => {
      const numA = parseInt(a.entryName.match(/slide(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.entryName.match(/slide(\d+)/)?.[1] || '0', 10);
      return numA - numB;
    });

    const slideImages: SlideImage[] = [];

    for (const rel of relEntries) {
      const content = rel.getData().toString('utf-8');
      const matches = [...content.matchAll(/Target=\"([^\"]+\.(?:png|jpe?g))\"/gi)];
      
      let bestEntry: any = null;
      let bestSize = 0;

      for (const m of matches) {
        const targetPath = m[1].replace(/^\.\.\//, 'ppt/');
        const entry = zip.getEntry(targetPath);
        if (entry && entry.header.size > bestSize) {
          bestSize = entry.header.size;
          bestEntry = entry;
        }
      }

      // Only pick substantial images (> 8KB) to filter out tiny bullet dots or decorative icons
      if (bestEntry && bestSize > 8192) {
        const ext = bestEntry.entryName.toLowerCase();
        const mimeType = ext.endsWith('.png') ? 'image/png' : 'image/jpeg';
        slideImages.push({
          mimeType,
          base64: bestEntry.getData().toString('base64'),
        });
      }
    }

    console.log(`[Parser] Extracted ${slideImages.length} high-resolution slide images from PPTX.`);
    return slideImages;
  } catch (err) {
    console.warn('[Parser] Note: could not extract slide images from PPTX:', err);
    return [];
  }
}

/**
 * Extracts plain text and slide visuals from PDF, DOCX, and PPTX documents.
 */
export async function extractTextAndHash(buffer: Buffer, fileName: string): Promise<ExtractedDocument> {
  const fileHash = computeFileHash(buffer);
  const lowerName = fileName.toLowerCase();

  let rawText = '';
  let slideImages: SlideImage[] = [];

  // 1. If it's a PowerPoint file, extract slide images for multimodal vision
  if (lowerName.endsWith('.pptx')) {
    slideImages = extractPptxSlideImages(buffer);
  }

  // 2. Extract text
  if (lowerName.endsWith('.txt')) {
    rawText = buffer.toString('utf-8');
  } else {
    try {
      const parsed = await parseOffice(buffer);
      if (typeof parsed === 'string') {
        rawText = parsed;
      } else if (parsed && typeof parsed === 'object') {
        const textPieces = extractTextNodes(parsed);
        rawText = textPieces.join('\n');
      }
    } catch (err) {
      console.warn(`[Parser] officeparser encountered an issue on ${fileName}:`, err);
    }
  }

  // Clean up whitespace, excess blank lines, XML tags, and null characters
  let cleanedText = rawText
    .replace(/<[^>]+>/g, ' ')
    .replace(/\0/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Filter out XML schema metadata or pure whitespace
  if (cleanedText.includes('http://schemas.openxmlformats') && cleanedText.length < 300) {
    cleanedText = '';
  }

  // Cap cleanly at 18,000 characters
  const MAX_CHARS = 18000;
  const truncatedText = cleanedText.length > MAX_CHARS 
    ? cleanedText.slice(0, MAX_CHARS) + '\n\n[...Content truncated for optimal lecture summary...]'
    : cleanedText;

  return {
    fileHash,
    text: truncatedText,
    charCount: truncatedText.length,
    slideImages: slideImages.length > 0 ? slideImages : undefined,
  };
}
