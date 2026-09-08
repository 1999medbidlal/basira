import { logger } from '../utils/logger.js';

/**
 * Token Manager Subsystem
 *
 * Manages the ordered token queue and token progression.
 */
export class TokenManager {
  constructor(tokens = []) {
    this.tokens = tokens;
    this.currentIndex = 0;
  }

  setTokens(tokens) {
    this.tokens = tokens || [];
    this.currentIndex = 0;
    this.resetStatuses();
  }

  getTokens() {
    return this.tokens;
  }

  getCount() {
    return this.tokens.length;
  }

  getCurrentToken() {
    if (this.currentIndex >= 0 && this.currentIndex < this.tokens.length) {
      return this.tokens[this.currentIndex];
    }
    return null;
  }

  getTokenAt(index) {
    if (index >= 0 && index < this.tokens.length) {
      return this.tokens[index];
    }
    return null;
  }

  setIndex(index) {
    if (index >= 0 && index < this.tokens.length) {
      this.currentIndex = index;
      return this.getCurrentToken();
    }
    return null;
  }

  advance() {
    if (this.currentIndex < this.tokens.length - 1) {
      this.currentIndex++;
      return this.getCurrentToken();
    }
    return null;
  }

  isLast() {
    return this.currentIndex >= this.tokens.length - 1;
  }

  resetStatuses() {
    for (const t of this.tokens) {
      t.status = 'pending';
    }
  }

  markCurrentSpoken() {
    const current = this.getCurrentToken();
    if (current) {
      current.status = 'spoken';
    }
  }
}
