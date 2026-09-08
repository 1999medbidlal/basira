import { generateUUID } from '../utils/ids.js';
import { Token } from './token-model.js';

/**
 * Canonical Document Model
 */
export class DocumentModel {
  constructor(data = {}) {
    this.id = data.id || generateUUID();
    this.source = {
      width: Number(data.source?.width || 0),
      height: Number(data.source?.height || 0),
      mimeType: data.source?.mimeType || 'image/jpeg',
      name: data.source?.name || 'document.jpg',
      hash: data.source?.hash || '',
    };

    this.ocr = {
      provider: data.ocr?.provider || 'tesseract',
      status: data.ocr?.status || 'idle', // 'idle' | 'processing' | 'complete' | 'error'
      language: data.ocr?.language || 'eng',
      confidence: Number(data.ocr?.confidence || 0),
      blocks: data.ocr?.blocks || [],
      lines: data.ocr?.lines || [],
      tokens: (data.ocr?.tokens || []).map((t) => (t instanceof Token ? t : new Token(t))),
    };

    this.reading = {
      direction: data.reading?.direction || 'ltr',
      tokens: (data.reading?.tokens || []).map((t) => (t instanceof Token ? t : new Token(t))),
      currentIndex: Number(data.reading?.currentIndex || 0),
    };
  }

  getCurrentToken() {
    if (this.reading.currentIndex >= 0 && this.reading.currentIndex < this.reading.tokens.length) {
      return this.reading.tokens[this.reading.currentIndex];
    }
    return null;
  }

  setReadingIndex(index) {
    if (index >= 0 && index < this.reading.tokens.length) {
      this.reading.currentIndex = index;
      return this.getCurrentToken();
    }
    return null;
  }

  toJSON() {
    return {
      id: this.id,
      source: { ...this.source },
      ocr: {
        ...this.ocr,
        tokens: this.ocr.tokens.map((t) => t.toJSON()),
      },
      reading: {
        ...this.reading,
        tokens: this.reading.tokens.map((t) => t.toJSON()),
      },
    };
  }
}
