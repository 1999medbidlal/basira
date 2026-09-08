import { generateUUID } from '../utils/ids.js';
import { logger } from '../utils/logger.js';

/**
 * Synchronization Controller Subsystem
 *
 * Optimized for Assistive Reading & Screen-Reader Performance:
 * Provides fluid, high-speed, continuous sentence/line reading with live word highlight synchronization,
 * eliminating awkward pauses between words while maintaining strict session isolation.
 */
export class SynchronizationController {
  constructor(tokenManager, highlightEngine, speechEngine) {
    this.tokenManager = tokenManager;
    this.highlightEngine = highlightEngine;
    this.speechEngine = speechEngine;
    this.activeSessionId = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.onTokenChangeCallback = null;
    this.onCompleteCallback = null;
    this.onErrorCallback = null;
  }

  onTokenChange(cb) {
    this.onTokenChangeCallback = cb;
  }

  onComplete(cb) {
    this.onCompleteCallback = cb;
  }

  onError(cb) {
    this.onErrorCallback = cb;
  }

  /**
   * Starts a new synchronized reading session
   */
  start(startIndex = 0) {
    this.activeSessionId = generateUUID();
    const sessionId = this.activeSessionId;

    this.isPlaying = true;
    this.isPaused = false;

    if (typeof startIndex === 'number') {
      this.tokenManager.setIndex(startIndex);
    }

    logger.log('SYNC', `Session started: ${sessionId}`, { startIndex: this.tokenManager.currentIndex });

    this.readLoop(sessionId);
    return sessionId;
  }

  /**
   * Continuous, low-latency reading loop with word-by-word highlight synchronization
   */
  async readLoop(sessionId) {
    while (this.isPlaying && !this.isPaused) {
      if (this.activeSessionId !== sessionId) {
        logger.debug('SYNC', `Session ${sessionId} was superseded, terminating loop`);
        return;
      }

      const token = this.tokenManager.getCurrentToken();
      if (!token) {
        this.completeSession(sessionId);
        return;
      }

      token.status = 'current';

      // 1. Highlight active token on the image
      this.highlightEngine.highlightToken(token);
      logger.log('HIGHLIGHT', `Highlighting token: [${token.readingOrder}] "${token.text}"`);

      if (this.onTokenChangeCallback) {
        this.onTokenChangeCallback(token, this.tokenManager.currentIndex);
      }

      // 2. High-speed speech output
      try {
        await this.speechEngine.speak(token.speechText || token.text, {
          language: token.language || 'eng',
        });
      } catch (err) {
        logger.warn('SYNC', 'Speech error during token read', err);
      }

      // Check session validity after async speech
      if (this.activeSessionId !== sessionId || !this.isPlaying || this.isPaused) {
        return;
      }

      // 3. Advance to next token immediately
      this.tokenManager.markCurrentSpoken();

      if (this.tokenManager.isLast()) {
        this.completeSession(sessionId);
        return;
      } else {
        this.tokenManager.advance();
      }
    }
  }

  pause() {
    this.isPaused = true;
    this.isPlaying = false;
    this.speechEngine.pause();
    logger.log('SYNC', `Session ${this.activeSessionId} paused`);
  }

  resume() {
    if (this.isPaused && this.activeSessionId) {
      this.isPlaying = true;
      this.isPaused = false;
      this.speechEngine.resume();
      logger.log('SYNC', `Session ${this.activeSessionId} resumed`);
      this.readLoop(this.activeSessionId);
    }
  }

  stop() {
    const prevSession = this.activeSessionId;
    this.activeSessionId = null;
    this.isPlaying = false;
    this.isPaused = false;

    this.speechEngine.stop();
    this.highlightEngine.clearHighlight();
    this.tokenManager.setIndex(0);
    this.tokenManager.resetStatuses();

    logger.log('SYNC', `Session ${prevSession} stopped`);
  }

  completeSession(sessionId) {
    if (this.activeSessionId !== sessionId) return;

    this.isPlaying = false;
    this.isPaused = false;
    this.activeSessionId = null;

    this.highlightEngine.clearHighlight();
    logger.log('SYNC', `Session ${sessionId} completed successfully`);

    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }
}
