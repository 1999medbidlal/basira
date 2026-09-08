import { describe, it, expect } from 'vitest';
import { computeReadingOrder, clusterTokensIntoLines } from '../../src/ocr/reading-order.js';

describe('Reading Order Engine', () => {
  it('correctly orders English multi-line tokens left-to-right, top-to-bottom', () => {
    // 2 lines of 3 words each
    const tokens = [
      { id: 't2', text: 'world', bbox: { x: 200, y: 100, width: 80, height: 30 } },
      { id: 't1', text: 'Hello', bbox: { x: 100, y: 100, width: 80, height: 30 } },
      { id: 't3', text: 'again', bbox: { x: 300, y: 102, width: 70, height: 28 } },
      { id: 't5', text: 'is', bbox: { x: 180, y: 200, width: 40, height: 30 } },
      { id: 't4', text: 'This', bbox: { x: 100, y: 198, width: 60, height: 30 } },
      { id: 't6', text: 'Basira', bbox: { x: 240, y: 200, width: 90, height: 30 } },
    ];

    const ordered = computeReadingOrder(tokens, 'ltr');

    expect(ordered.map((t) => t.text)).toEqual(['Hello', 'world', 'again', 'This', 'is', 'Basira']);
    expect(ordered.map((t) => t.readingOrder)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('correctly orders Arabic multi-line tokens right-to-left, top-to-bottom', () => {
    // Line 1: 'بسم' (x=300), 'الله' (x=200), 'الرحمن' (x=100) -> ordered RTL: x=300 first, then 200, then 100
    // Line 2: 'الحمد' (x=250), 'لله' (x=150)
    const tokens = [
      { id: 'a2', text: 'الله', bbox: { x: 200, y: 50, width: 80, height: 30 } },
      { id: 'a3', text: 'الرحمن', bbox: { x: 100, y: 52, width: 90, height: 30 } },
      { id: 'a1', text: 'بسم', bbox: { x: 300, y: 48, width: 70, height: 30 } },
      { id: 'a5', text: 'لله', bbox: { x: 150, y: 120, width: 60, height: 30 } },
      { id: 'a4', text: 'الحمد', bbox: { x: 250, y: 118, width: 80, height: 30 } },
    ];

    const ordered = computeReadingOrder(tokens, 'rtl');

    expect(ordered.map((t) => t.text)).toEqual(['بسم', 'الله', 'الرحمن', 'الحمد', 'لله']);
    expect(ordered.map((t) => t.readingOrder)).toEqual([0, 1, 2, 3, 4]);
  });

  it('correctly handles mixed lines with Arabic and numbers', () => {
    const tokens = [
      { id: 'm1', text: 'رقم', bbox: { x: 300, y: 100, width: 50, height: 25 } },
      { id: 'm2', text: 'الصفحة', bbox: { x: 200, y: 100, width: 80, height: 25 } },
      { id: 'm3', text: '42', bbox: { x: 140, y: 100, width: 30, height: 25 } },
    ];

    const ordered = computeReadingOrder(tokens, 'rtl');
    expect(ordered.map((t) => t.text)).toEqual(['رقم', 'الصفحة', '42']);
  });
});
