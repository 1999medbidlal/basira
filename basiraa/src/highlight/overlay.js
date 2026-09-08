import { logger } from '../utils/logger.js';

/**
 * Overlay Container Subsystem
 *
 * Manages the transparent overlay layer positioned strictly over the rendered image element.
 * Listens to container & image resizing and notifies when geometry changes.
 */
export class Overlay {
  constructor(containerElement, imageElement) {
    this.containerElement = containerElement;
    this.imageElement = imageElement;
    this.overlayElement = null;
    this.resizeObserver = null;
    this.onGeometryChangeCallbacks = new Set();

    this.init();
  }

  init() {
    if (!this.containerElement) return;

    // Create or find overlay element
    let overlay = this.containerElement.querySelector('.basira-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'basira-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      this.containerElement.appendChild(overlay);
    }
    this.overlayElement = overlay;

    // Observe resizing of the image element
    if (typeof ResizeObserver !== 'undefined' && this.imageElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateGeometry();
      });
      this.resizeObserver.observe(this.imageElement);
    }

    if (this.imageElement) {
      this.imageElement.addEventListener('load', () => {
        this.updateGeometry();
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.updateGeometry());
    }
  }

  onGeometryChange(callback) {
    this.onGeometryChangeCallbacks.add(callback);
    return () => this.onGeometryChangeCallbacks.delete(callback);
  }

  getDisplayedRect() {
    if (!this.imageElement) {
      return { width: 0, height: 0, offsetX: 0, offsetY: 0 };
    }

    const rect = this.imageElement.getBoundingClientRect();
    const containerRect = this.containerElement ? this.containerElement.getBoundingClientRect() : rect;

    return {
      width: rect.width,
      height: rect.height,
      offsetX: rect.left - containerRect.left,
      offsetY: rect.top - containerRect.top,
    };
  }

  updateGeometry() {
    const displayedRect = this.getDisplayedRect();

    if (this.overlayElement) {
      this.overlayElement.style.left = `${displayedRect.offsetX}px`;
      this.overlayElement.style.top = `${displayedRect.offsetY}px`;
      this.overlayElement.style.width = `${displayedRect.width}px`;
      this.overlayElement.style.height = `${displayedRect.height}px`;
    }

    for (const cb of this.onGeometryChangeCallbacks) {
      try {
        cb(displayedRect);
      } catch (err) {
        logger.error('HIGHLIGHT', 'Error in geometry change callback', err);
      }
    }
  }

  clear() {
    if (this.overlayElement) {
      this.overlayElement.innerHTML = '';
    }
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.clear();
    this.onGeometryChangeCallbacks.clear();
  }
}
