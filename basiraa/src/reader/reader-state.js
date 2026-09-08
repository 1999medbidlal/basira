/**
 * Reader State Constants & Observable State Container
 */

export const READER_STATUS = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  COMPLETED: 'completed',
  ERROR: 'error',
};

export class ReaderState {
  constructor(initial = {}) {
    this.status = initial.status || READER_STATUS.IDLE;
    this.currentIndex = initial.currentIndex || 0;
    this.totalTokens = initial.totalTokens || 0;
    this.speed = initial.speed || 1.0;
    this.direction = initial.direction || 'ltr';
    this.listeners = new Set();
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  set(updates) {
    let changed = false;
    for (const [key, value] of Object.entries(updates)) {
      if (this[key] !== value) {
        this[key] = value;
        changed = true;
      }
    }
    if (changed) {
      this.notify();
    }
  }

  notify() {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('ReaderState listener error', err);
      }
    }
  }

  getSnapshot() {
    return {
      status: this.status,
      currentIndex: this.currentIndex,
      totalTokens: this.totalTokens,
      speed: this.speed,
      direction: this.direction,
    };
  }
}
