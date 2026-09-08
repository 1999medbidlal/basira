import { Token } from '../document/token-model.js';
import { DocumentModel } from '../document/document-model.js';
import { computeReadingOrder } from './reading-order.js';
import { detectDocumentLanguage, tesseractLangToIso } from './language-detector.js';
import { isArabicText } from '../utils/text.js';
import { logger } from '../utils/logger.js';
import { generateTokenId, generateLineId, generateBlockId } from '../utils/ids.js';

/**
 * OCR Normalizer Subsystem
 *
 * Converts raw OCR provider output (e.g. Tesseract.js Page/Blocks/Paragraphs/Lines/Words)
 * into canonical Document and Token models.
 *
 * Mandatory invariant: Canonical bbox MUST be in original image space.
 */
export function normalizeOcrResult(rawResult, imageMetadata = {}) {
  logger.log('NORMALIZER', 'Normalizing raw OCR result', { imageMetadata });

  const originalWidth = imageMetadata.width || rawResult.imageWidth || (rawResult.data && rawResult.data.imageWidth) || 1920;
  const originalHeight = imageMetadata.height || rawResult.imageHeight || (rawResult.data && rawResult.data.imageHeight) || 1080;
  const provider = rawResult.provider || 'tesseract';
  const language = rawResult.language || 'eng';

  const rawWords = rawResult.words || (rawResult.data && rawResult.data.words) || [];
  const rawBlocks = rawResult.blocks || (rawResult.data && rawResult.data.blocks) || [];
  const rawLines = rawResult.lines || (rawResult.data && rawResult.data.lines) || [];

  const rawConfidence = rawResult.confidence || (rawResult.data && rawResult.data.confidence) || 90;

  const tokens = [];

  if (rawWords && rawWords.length > 0) {
    for (let i = 0; i < rawWords.length; i++) {
      const w = rawWords[i];
      const text = (w.text || '').trim();
      if (!text) continue;

      // Extract bbox in original pixel space
      // Tesseract word bbox format: { x0, y0, x1, y1 } or { x, y, width, height } or { bbox: { x0, y0, x1, y1 } }
      let x = 0, y = 0, width = 0, height = 0;

      if (w.bbox) {
        if (typeof w.bbox.x0 === 'number') {
          x = w.bbox.x0;
          y = w.bbox.y0;
          width = w.bbox.x1 - w.bbox.x0;
          height = w.bbox.y1 - w.bbox.y0;
        } else if (typeof w.bbox.x === 'number') {
          x = w.bbox.x;
          y = w.bbox.y;
          width = w.bbox.width;
          height = w.bbox.height;
        }
      } else if (typeof w.x0 === 'number') {
        x = w.x0;
        y = w.y0;
        width = w.x1 - w.x0;
        height = w.y1 - w.y0;
      }

      // Safeguard against inverted or negative dimensions
      width = Math.max(1, width);
      height = Math.max(1, height);

      const isTokenArabic = isArabicText(text);
      const tokenIso = isTokenArabic ? 'ar' : tesseractLangToIso(language);

      const token = new Token({
        id: generateTokenId(i),
        text,
        language: tokenIso,
        bbox: { x, y, width, height },
        confidence: Number(w.confidence || 90),
        lineId: w.lineId || generateLineId(0),
        blockId: w.blockId || generateBlockId(0),
      });

      tokens.push(token);
    }
  }

  // Determine document direction and compute reading order
  const detectedLang = detectDocumentLanguage(tokens);
  const documentDirection = detectedLang === 'ara' || language === 'ara' ? 'rtl' : 'ltr';

  const orderedTokens = computeReadingOrder(tokens, documentDirection);

  const documentModel = new DocumentModel({
    source: {
      width: originalWidth,
      height: originalHeight,
      mimeType: imageMetadata.mimeType || 'image/jpeg',
      name: imageMetadata.name || 'document.jpg',
      hash: imageMetadata.hash || '',
    },
    ocr: {
      provider,
      status: 'complete',
      language,
      confidence: rawConfidence,
      blocks: rawBlocks,
      lines: rawLines,
      tokens: orderedTokens,
    },
    reading: {
      direction: documentDirection,
      tokens: orderedTokens,
      currentIndex: 0,
    },
  });

  logger.log('NORMALIZER', `Normalization complete: ${orderedTokens.length} tokens`, {
    direction: documentDirection,
    language,
  });

  return documentModel;
}
