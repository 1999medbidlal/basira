import { logger } from '../utils/logger.js';
import { BasiraError, ERROR_MESSAGES } from '../utils/errors.js';
import { normalizeOcrResult } from './ocr-normalizer.js';

/**
 * Base Abstract OCR Provider
 */
export class OcrProvider {
  async initialize(options = {}) {
    throw new Error('OcrProvider.initialize must be implemented');
  }

  async recognize(imageSource, options = {}) {
    throw new Error('OcrProvider.recognize must be implemented');
  }

  async terminate() {
    // Optional cleanup
  }
}

/**
 * OCR Engine Orchestrator
 *
 * Dispatches OCR requests to the configured provider, reports progress,
 * and passes output through the OCR Normalizer.
 */
export class OcrEngine {
  constructor(provider) {
    this.provider = provider;
    this.status = 'idle'; // 'idle' | 'initializing' | 'processing' | 'complete' | 'error'
    this.progress = 0;
    this.listeners = new Set();
  }

  setProvider(provider) {
    this.provider = provider;
  }

  onProgress(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(status, progress = 0, message = '') {
    this.status = status;
    this.progress = progress;
    for (const listener of this.listeners) {
      try {
        listener({ status, progress, message });
      } catch (err) {
        logger.error('OCR', 'Error in progress listener', err);
      }
    }
  }

  /**
   * Runs recognition on an image and returns a normalized DocumentModel
   */
  async processImage(imageSource, imageMetadata = {}, options = {}) {
    if (!this.provider) {
      throw new BasiraError('No OCR provider configured', ERROR_MESSAGES.OCR_FAILED);
    }

    try {
      this.notify('initializing', 10, 'Initializing OCR engine...');
      logger.log('OCR', 'Starting OCR recognition', { language: options.language || 'eng' });

      // Forward progress updates from provider if supported
      const progressCallback = (p) => {
        const percent = Math.round((p.progress || 0) * 100);
        this.notify('processing', Math.max(15, Math.min(95, percent)), p.status || 'Recognizing text...');
      };

      const rawResult = await this.provider.recognize(imageSource, {
        ...options,
        onProgress: progressCallback,
      });

      this.notify('processing', 98, 'Normalizing document structure...');

      const documentModel = normalizeOcrResult(rawResult, imageMetadata);

      this.notify('complete', 100, 'OCR Complete');
      return documentModel;
    } catch (err) {
      this.notify('error', 0, 'OCR Failed');
      logger.error('OCR', 'OCR execution error', err);
      throw new BasiraError(err.message || 'OCR failed', ERROR_MESSAGES.OCR_FAILED);
    }
  }

  async terminate() {
    if (this.provider?.terminate) {
      await this.provider.terminate();
    }
    this.status = 'idle';
    this.progress = 0;
  }
}
