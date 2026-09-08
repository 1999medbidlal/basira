import { ReaderState, READER_STATUS } from './reader-state.js';
import { TokenManager } from './token-manager.js';
import { SynchronizationController } from './synchronization.js';
import { logger } from '../utils/logger.js';
import { BasiraError, ERROR_MESSAGES } from '../utils/errors.js';

/**
 * Reader Controller Subsystem
 *
 * High-level coordinator managing state machine and user playback actions:
 * play, pause, resume, stop, speed changes, and jump-to-word.
 */
export class ReaderController {
  constructor(highlightEngine, speechEngine) {
    this.highlightEngine = highlightEngine;
    this.speechEngine = speechEngine;
    this.tokenManager = new TokenManager([]);
    this.synchronizer = new SynchronizationController(this.tokenManager, this.highlightEngine, this.speechEngine);
    this.state = new ReaderState();
    this.document = null;

    this.setupListeners();
  }

  setupListeners() {
    this.synchronizer.onTokenChange((token, index) => {
      this.state.set({
        currentIndex: index,
        status: READER_STATUS.PLAYING,
      });
    });

    this.synchronizer.onComplete(() => {
      this.state.set({
        status: READER_STATUS.COMPLETED,
      });
    });
  }

  loadDocument(documentModel) {
    this.stop();
    this.document = documentModel;
    const tokens = documentModel.reading?.tokens || [];
    this.tokenManager.setTokens(tokens);
    this.highlightEngine.setTokens(tokens);

    this.state.set({
      status: READER_STATUS.IDLE,
      currentIndex: 0,
      totalTokens: tokens.length,
      direction: documentModel.reading?.direction || 'ltr',
    });

    logger.log('READER', `Loaded document: ${tokens.length} tokens`);
  }

  play(startIndex) {
    if (!this.document || this.tokenManager.getCount() === 0) {
      logger.warn('READER', 'Cannot play: No document loaded');
      return;
    }

    const start = typeof startIndex === 'number' ? startIndex : this.state.currentIndex;
    this.state.set({ status: READER_STATUS.PLAYING });
    this.synchronizer.start(start);
  }

  pause() {
    if (this.state.status === READER_STATUS.PLAYING) {
      this.synchronizer.pause();
      this.state.set({ status: READER_STATUS.PAUSED });
    }
  }

  resume() {
    if (this.state.status === READER_STATUS.PAUSED) {
      this.synchronizer.resume();
      this.state.set({ status: READER_STATUS.PLAYING });
    }
  }

  stop() {
    this.synchronizer.stop();
    this.state.set({
      status: READER_STATUS.STOPPED,
      currentIndex: 0,
    });
  }

  setSpeed(speed) {
    const s = Number(speed) || 1.0;
    this.speechEngine.setRate(s);
    this.state.set({ speed: s });
  }

  jumpToToken(tokenOrIndex) {
    const idx = typeof tokenOrIndex === 'number'
      ? tokenOrIndex
      : this.tokenManager.getTokens().findIndex((t) => t.id === tokenOrIndex.id);

    if (idx >= 0) {
      const wasPlaying = this.state.status === READER_STATUS.PLAYING;
      this.synchronizer.stop();
      this.tokenManager.setIndex(idx);
      const token = this.tokenManager.getCurrentToken();
      if (token) {
        this.highlightEngine.highlightToken(token);
      }
      this.state.set({ currentIndex: idx });

      if (wasPlaying) {
        this.play(idx);
      }
    }
  }

  stepForward() {
    const nextIdx = this.state.currentIndex + 1;
    if (nextIdx < this.tokenManager.getCount()) {
      this.jumpToToken(nextIdx);
    }
  }

  stepBackward() {
    const prevIdx = Math.max(0, this.state.currentIndex - 1);
    this.jumpToToken(prevIdx);
  }

  restart() {
    this.jumpToToken(0);
    this.play(0);
  }
}

