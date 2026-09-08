import { normalizeTokenText, prepareSpeechText, detectDirection } from '../utils/text.js';
import { generateTokenId } from '../utils/ids.js';

/**
 * Token Model
 *
 * Canonical representation of a single recognizable reading unit (word).
 * Bounding boxes are stored strictly in ORIGINAL IMAGE coordinate space.
 */
export class Token {
  constructor(data) {
    this.id = data.id || generateTokenId(data.readingOrder ?? 0);
    this.text = data.text || '';
    this.normalizedText = data.normalizedText ?? normalizeTokenText(this.text);
    this.speechText = data.speechText ?? prepareSpeechText(this.text);
    this.language = data.language || 'en';
    this.direction = data.direction || detectDirection(this.text);

    // Canonical bounding box in original image space
    this.bbox = {
      x: Number(data.bbox?.x || 0),
      y: Number(data.bbox?.y || 0),
      width: Number(data.bbox?.width || 0),
      height: Number(data.bbox?.height || 0),
    };

    this.lineId = data.lineId || 'line-0';
    this.blockId = data.blockId || 'block-0';
    this.readingOrder = Number(data.readingOrder ?? 0);
    this.confidence = Number(data.confidence ?? 100);
    this.status = data.status || 'pending'; // 'pending' | 'current' | 'spoken' | 'skipped' | 'error'
  }

  setStatus(status) {
    this.status = status;
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      normalizedText: this.normalizedText,
      speechText: this.speechText,
      language: this.language,
      direction: this.direction,
      bbox: { ...this.bbox },
      lineId: this.lineId,
      blockId: this.blockId,
      readingOrder: this.readingOrder,
      confidence: this.confidence,
      status: this.status,
    };
  }
}
