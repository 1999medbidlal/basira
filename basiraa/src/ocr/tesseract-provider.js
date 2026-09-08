import { OcrProvider } from './ocr-engine.js';
import { logger } from '../utils/logger.js';
import { BasiraError, ERROR_MESSAGES } from '../utils/errors.js';
import { parseSvgTokens, isSvgSource } from './svg-text-parser.js';

/**
 * Local Tesseract.js OCR Provider
 *
 * Runs client-side OCR in a Web Worker.
 * Bounding boxes are retained in original image coordinate space.
 */
export class TesseractProvider extends OcrProvider {
  constructor() {
    super();
    this.worker = null;
    this.currentLanguage = null;
    this.tesseractModule = null;
  }

  async loadTesseract() {
    if (this.tesseractModule) return this.tesseractModule;

    try {
      if (typeof window !== 'undefined' && window.Tesseract) {
        this.tesseractModule = window.Tesseract;
        return this.tesseractModule;
      }
      const tesseract = await import('tesseract.js');
      this.tesseractModule = tesseract.default || tesseract;
      return this.tesseractModule;
    } catch (err) {
      logger.error('OCR', 'Failed to dynamically load tesseract.js', err);
      throw new BasiraError('Failed to load OCR library', ERROR_MESSAGES.OCR_FAILED);
    }
  }

  async initialize(options = {}) {
    const { language = 'eng', onProgress } = options;

    const Tesseract = await this.loadTesseract();

    if (this.worker && this.currentLanguage === language) {
      return this.worker;
    }

    if (this.worker) {
      await this.terminate();
    }

    logger.log('OCR', `Initializing Tesseract Worker for language: ${language}`);

    try {
      this.worker = await Tesseract.createWorker(language, 1, {
        logger: (m) => {
          if (onProgress && typeof onProgress === 'function') {
            onProgress(m);
          }
        },
      });

      this.currentLanguage = language;
      logger.log('OCR', 'Tesseract Worker initialized');
      return this.worker;
    } catch (err) {
      logger.error('OCR', 'Tesseract initialization error', err);
      throw new BasiraError('Could not initialize OCR worker', ERROR_MESSAGES.OCR_FAILED);
    }
  }

  async prepareImageForRecognition(imageSource) {
    if (typeof document === 'undefined') return imageSource;

    // If imageSource is an SVG Blob or svg data url, rasterize it onto a canvas
    if (imageSource instanceof Blob && (imageSource.type === 'image/svg+xml' || imageSource.type === '')) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(imageSource);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 1200;
          canvas.height = img.naturalHeight || 800;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas);
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(url);
          resolve(imageSource); // Fallback to raw source
        };
        img.src = url;
      });
    }

    return imageSource;
  }

  async recognize(imageSource, options = {}) {
    const { language = 'eng', onProgress } = options;

    // Fast path: if SVG source, extract vector text directly with 100% precision
    if (isSvgSource(imageSource)) {
      try {
        logger.log('OCR', 'Detected SVG source, using high-precision vector text parser');
        const svgResult = await parseSvgTokens(imageSource);
        if (svgResult && svgResult.words.length > 0) {
          if (onProgress) onProgress({ progress: 1.0, status: 'Extracted vector text' });
          return svgResult;
        }
      } catch (err) {
        logger.warn('OCR', 'SVG text extraction fallback to raster OCR', err);
      }
    }

    logger.log('OCR', `TesseractProvider recognizing image with language ${language}`);

    const Tesseract = await this.loadTesseract();
    const preparedSource = await this.prepareImageForRecognition(imageSource);

    try {
      // Direct call using Tesseract.recognize
      const result = await Tesseract.recognize(preparedSource, language, {
        logger: (m) => {
          if (onProgress && typeof onProgress === 'function') {
            onProgress(m);
          }
        },
      });

      logger.log('OCR', 'Tesseract recognition succeeded', {
        confidence: result.data?.confidence,
        wordsCount: result.data?.words?.length,
      });

      return {
        provider: 'tesseract',
        language,
        confidence: result.data?.confidence || 90,
        words: result.data?.words || [],
        blocks: result.data?.blocks || [],
        lines: result.data?.lines || [],
        text: result.data?.text || '',
        data: result.data,
      };
    } catch (err) {
      logger.error('OCR', 'Tesseract recognize failed', err);
      throw new BasiraError('OCR recognition failed', ERROR_MESSAGES.OCR_FAILED);
    }
  }

  async terminate() {
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch (err) {
        logger.warn('OCR', 'Error terminating Tesseract worker', err);
      }
      this.worker = null;
      this.currentLanguage = null;
    }
  }
}
