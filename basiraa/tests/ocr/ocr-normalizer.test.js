import { describe, it, expect } from 'vitest';
import { normalizeOcrResult } from '../../src/ocr/ocr-normalizer.js';

describe('OCR Normalizer Subsystem', () => {
  it('normalizes raw Tesseract output with x0/y0 bounding boxes into canonical tokens in original image coordinates', () => {
    const rawTesseractOutput = {
      provider: 'tesseract',
      language: 'eng',
      confidence: 92,
      words: [
        { text: 'Basira', bbox: { x0: 100, y0: 150, x1: 220, y1: 190 }, confidence: 95 },
        { text: 'reads', bbox: { x0: 230, y0: 152, x1: 310, y1: 190 }, confidence: 91 },
        { text: 'books', bbox: { x0: 320, y0: 150, x1: 410, y1: 190 }, confidence: 94 },
      ],
    };

    const imageMetadata = { width: 1920, height: 1080, name: 'page.jpg' };
    const doc = normalizeOcrResult(rawTesseractOutput, imageMetadata);

    expect(doc.source.width).toBe(1920);
    expect(doc.source.height).toBe(1080);
    expect(doc.reading.direction).toBe('ltr');
    expect(doc.reading.tokens.length).toBe(3);

    const firstToken = doc.reading.tokens[0];
    expect(firstToken.text).toBe('Basira');
    expect(firstToken.bbox.x).toBe(100);
    expect(firstToken.bbox.y).toBe(150);
    expect(firstToken.bbox.width).toBe(120); // 220 - 100
    expect(firstToken.bbox.height).toBe(40); // 190 - 150
  });

  it('detects Arabic document language and sets RTL direction', () => {
    const rawArabicOutput = {
      provider: 'tesseract',
      language: 'ara',
      confidence: 88,
      words: [
        { text: 'الكتاب', bbox: { x0: 300, y0: 100, x1: 420, y1: 140 } },
        { text: 'المفتوح', bbox: { x0: 150, y0: 100, x1: 280, y1: 140 } },
      ],
    };

    const doc = normalizeOcrResult(rawArabicOutput, { width: 1200, height: 800 });

    expect(doc.reading.direction).toBe('rtl');
    expect(doc.reading.tokens[0].text).toBe('الكتاب');
    expect(doc.reading.tokens[1].text).toBe('المفتوح');
  });
});
