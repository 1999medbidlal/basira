import { describe, it, expect } from 'vitest';
import { parseSvgTokens, isSvgSource } from '../../src/ocr/svg-text-parser.js';

describe('SVG Text Parser Subsystem', () => {
  it('correctly detects SVG sources', () => {
    expect(isSvgSource('/assets/sample-english.svg')).toBe(true);
    expect(isSvgSource('<svg width="100"></svg>')).toBe(true);
    expect(isSvgSource('page.jpg')).toBe(false);
  });

  it('extracts tokens with accurate bounding boxes from English SVG content', async () => {
    const sampleSvg = `
      <svg width="1200" height="800">
        <text x="100" y="140" font-size="40">Chapter 1: Reading</text>
        <text x="100" y="240" font-size="24">Basira visual assistant</text>
      </svg>
    `;

    const result = await parseSvgTokens(sampleSvg);
    expect(result).toBeDefined();
    expect(result.words.length).toBe(6);
    expect(result.words[0].text).toBe('Chapter');
    expect(result.words[0].bbox.x0).toBeGreaterThanOrEqual(100);
    expect(result.words[0].bbox.y0).toBeGreaterThanOrEqual(0);
    expect(result.language).toBe('eng');
  });

  it('extracts tokens with RTL layout from Arabic SVG content', async () => {
    const sampleArabicSvg = `
      <svg width="1200" height="800" direction="rtl">
        <text x="1100" y="140" font-size="40">بصيرة مساعد قرائي</text>
      </svg>
    `;

    const result = await parseSvgTokens(sampleArabicSvg);
    expect(result).toBeDefined();
    expect(result.language).toBe('ara');
    expect(result.words.length).toBe(3);
    expect(result.words[0].text).toBe('بصيرة');
  });
});
