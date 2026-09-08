import { transformBboxToDisplay } from '../image/coordinate-transform.js';
import { createHighlightStyle, HIGHLIGHT_MODES } from './highlight-style.js';
import { logger } from '../utils/logger.js';

/**
 * Highlight Engine Subsystem
 *
 * Responsibilities:
 * - Render live active word/line highlights on top of the original image
 * - Render developer diagnostic bounding boxes
 * - Dynamic repositioning upon viewport resize
 */
export class HighlightEngine {
  constructor(overlay, originalDimensions = { width: 1920, height: 1080 }) {
    this.overlay = overlay;
    this.originalDimensions = originalDimensions;
    this.style = createHighlightStyle();
    this.currentToken = null;
    this.allTokens = [];
    this.diagnosticMode = false;
    this.onTokenClick = null;

    // Listen to overlay geometry updates to automatically re-render active highlights
    if (this.overlay) {
      this.overlay.onGeometryChange(() => {
        this.render();
      });
    }
  }

  setOriginalDimensions(dims) {
    if (dims && dims.width > 0 && dims.height > 0) {
      this.originalDimensions = { width: dims.width, height: dims.height };
      this.render();
    }
  }

  setStyle(customStyle) {
    this.style = createHighlightStyle(customStyle);
    this.render();
  }

  setDiagnosticMode(enabled) {
    this.diagnosticMode = Boolean(enabled);
    this.render();
  }

  setTokens(tokens) {
    this.allTokens = tokens || [];
    this.render();
  }

  highlightToken(token) {
    this.currentToken = token;
    this.render();
  }

  clearHighlight() {
    this.currentToken = null;
    this.render();
  }

  /**
   * Main render method: draws highlights and/or diagnostic bounding boxes
   */
  render() {
    if (!this.overlay || !this.overlay.overlayElement) return;

    const overlayEl = this.overlay.overlayElement;
    overlayEl.innerHTML = '';

    const displayedRect = this.overlay.getDisplayedRect();
    if (displayedRect.width <= 0 || displayedRect.height <= 0) return;

    // 1. Interactive Word Hitboxes (rendered under the active highlight)
    if (this.allTokens.length > 0) {
      for (const token of this.allTokens) {
        const isCurrent = this.currentToken && this.currentToken.id === token.id;
        const rect = transformBboxToDisplay(token.bbox, this.originalDimensions, displayedRect);

        if (this.diagnosticMode) {
          const box = document.createElement('div');
          box.className = `basira-diag-box ${isCurrent ? 'is-active' : ''}`;
          box.style.left = `${rect.x}px`;
          box.style.top = `${rect.y}px`;
          box.style.width = `${rect.width}px`;
          box.style.height = `${rect.height}px`;
          box.title = `[#${token.readingOrder}] "${token.text}" (${token.language}, ${token.confidence}%)`;

          const badge = document.createElement('span');
          badge.className = 'basira-diag-badge';
          badge.textContent = `${token.readingOrder}: ${token.text}`;
          box.appendChild(badge);

          if (this.onTokenClick) {
            box.style.cursor = 'pointer';
            box.style.pointerEvents = 'auto';
            box.addEventListener('click', (e) => {
              e.stopPropagation();
              this.onTokenClick(token);
            });
          }
          overlayEl.appendChild(box);
        } else {
          // Normal mode: transparent clickable hitbox with subtle hover feedback
          const hitbox = document.createElement('div');
          hitbox.className = `basira-word-hitbox ${isCurrent ? 'is-current' : ''}`;
          hitbox.style.left = `${rect.x}px`;
          hitbox.style.top = `${rect.y}px`;
          hitbox.style.width = `${rect.width}px`;
          hitbox.style.height = `${rect.height}px`;
          hitbox.title = `Click to read: "${token.text}"`;

          if (this.onTokenClick) {
            hitbox.addEventListener('click', (e) => {
              e.stopPropagation();
              this.onTokenClick(token);
            });
          }
          overlayEl.appendChild(hitbox);
        }
      }
    }

    // 2. Active Token / Line Highlight Layer
    if (this.currentToken && this.currentToken.bbox) {
      const rect = transformBboxToDisplay(this.currentToken.bbox, this.originalDimensions, displayedRect);

      const highlightEl = document.createElement('div');
      highlightEl.className = 'basira-live-highlight';
      highlightEl.style.left = `${rect.x}px`;
      highlightEl.style.top = `${rect.y}px`;
      highlightEl.style.width = `${rect.width}px`;
      highlightEl.style.height = `${rect.height}px`;
      highlightEl.style.backgroundColor = this.style.color;
      highlightEl.style.border = `${this.style.borderWidth}px solid ${this.style.borderColor}`;
      highlightEl.style.borderRadius = `${this.style.borderRadius}px`;
      highlightEl.style.transition = `all ${this.style.transitionDuration} cubic-bezier(0.16, 1, 0.3, 1)`;

      overlayEl.appendChild(highlightEl);
    }
  }
}
