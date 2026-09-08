import { describe, it, expect } from 'vitest';
import { DocumentModel } from '../../src/document/document-model.js';
import { Token } from '../../src/document/token-model.js';
import { validateDocument, validateToken } from '../../src/document/validation.js';

describe('Document and Token Models Invariant Validation', () => {
  it('instantiates valid document and tokens with canonical coordinates', () => {
    const token = new Token({
      id: 'token-1',
      text: 'Basira',
      bbox: { x: 100, y: 200, width: 80, height: 30 },
      readingOrder: 0,
    });

    const doc = new DocumentModel({
      id: 'doc-123',
      source: { width: 1920, height: 1080 },
      reading: { tokens: [token], direction: 'ltr' },
    });

    const tokenValidation = validateToken(token, doc.source);
    expect(tokenValidation.valid).toBe(true);

    const docValidation = validateDocument(doc);
    expect(docValidation.valid).toBe(true);
  });

  it('detects invalid out-of-bound tokens', () => {
    const invalidToken = new Token({
      id: 'bad-token',
      text: 'Error',
      bbox: { x: -50, y: 2000, width: 0, height: -10 },
    });

    const validation = validateToken(invalidToken, { width: 1000, height: 800 });
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});
