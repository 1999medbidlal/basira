import { getImageDimensions, computeImageHash } from './image-metadata.js';
import { logger } from '../utils/logger.js';
import { BasiraError, ERROR_MESSAGES } from '../utils/errors.js';

/**
 * Image Manager Subsystem
 *
 * Responsibilities:
 * - Immutable source file & blob management
 * - Object URL creation and lifecycle revocation
 * - Dimension extraction
 * - Image state emission
 */
export class ImageManager {
  constructor() {
    this.currentSource = null;
    this.currentBlob = null;
    this.currentUrl = null;
    this.dimensions = { width: 0, height: 0 };
    this.imageHash = null;
    this.listeners = new Set();
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.getState());
      } catch (err) {
        logger.error('IMAGE', 'Error in image state listener', err);
      }
    }
  }

  getState() {
    return {
      hasImage: Boolean(this.currentUrl),
      url: this.currentUrl,
      width: this.dimensions.width,
      height: this.dimensions.height,
      hash: this.imageHash,
      blob: this.currentBlob,
    };
  }

  /**
   * Loads an immutable image from a File or Blob
   */
  async loadImage(source) {
    if (!source) {
      throw new BasiraError('No image provided', ERROR_MESSAGES.IMAGE_LOAD_FAILED);
    }

    logger.log('IMAGE', 'Loading new image source', { type: source.type, size: source.size });

    // Clean up previous URL if any
    this.cleanup();

    try {
      this.currentBlob = source;
      this.currentUrl = URL.createObjectURL(source);
      this.dimensions = await getImageDimensions(source);
      this.imageHash = await computeImageHash(source);

      logger.log('IMAGE', 'Image loaded successfully', {
        width: this.dimensions.width,
        height: this.dimensions.height,
        hash: this.imageHash,
      });

      this.notify();
      return this.getState();
    } catch (err) {
      this.cleanup();
      logger.error('IMAGE', 'Failed to load image', err);
      throw new BasiraError('Image load failed', ERROR_MESSAGES.IMAGE_LOAD_FAILED);
    }
  }

  /**
   * Loads from an existing Image element or data URL directly (useful for tests and synthetic canvases)
   */
  async loadFromDataUrl(dataUrl, width, height) {
    this.cleanup();
    this.currentUrl = dataUrl;
    this.dimensions = { width: width || 800, height: height || 600 };
    this.imageHash = await computeImageHash(dataUrl);
    this.notify();
    return this.getState();
  }

  cleanup() {
    if (this.currentUrl && this.currentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.currentUrl);
    }
    this.currentSource = null;
    this.currentBlob = null;
    this.currentUrl = null;
    this.dimensions = { width: 0, height: 0 };
    this.imageHash = null;
  }
}
