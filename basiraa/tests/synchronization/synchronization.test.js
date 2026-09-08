import { describe, it, expect, vi } from 'vitest';
import { SynchronizationController } from '../../src/reader/synchronization.js';
import { TokenManager } from '../../src/reader/token-manager.js';
import { Token } from '../../src/document/token-model.js';

describe('Synchronization Controller & Session Isolation', () => {
  it('prevents stale callbacks from an old session from modifying a new session', async () => {
    const tokens = [
      new Token({ id: 't1', text: 'First', bbox: { x: 10, y: 10, width: 50, height: 20 }, readingOrder: 0 }),
      new Token({ id: 't2', text: 'Second', bbox: { x: 70, y: 10, width: 50, height: 20 }, readingOrder: 1 }),
      new Token({ id: 't3', text: 'Third', bbox: { x: 130, y: 10, width: 50, height: 20 }, readingOrder: 2 }),
    ];

    const tokenManager = new TokenManager(tokens);
    const highlightEngine = {
      highlightToken: vi.fn(),
      clearHighlight: vi.fn(),
    };

    let speechResolve;
    const speechEngine = {
      speak: vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          speechResolve = resolve;
        });
      }),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
    };

    const sync = new SynchronizationController(tokenManager, highlightEngine, speechEngine);

    // Start Session 1
    const session1 = sync.start(0);
    expect(sync.activeSessionId).toBe(session1);
    expect(tokenManager.currentIndex).toBe(0);

    // Stop session 1 and start session 2 before speechResolve is called
    sync.stop();
    expect(sync.activeSessionId).toBeNull();

    const session2 = sync.start(1);
    expect(sync.activeSessionId).toBe(session2);
    expect(tokenManager.currentIndex).toBe(1);

    // Now resolve the dangling promise from Session 1
    if (speechResolve) speechResolve();

    // Session 2 should maintain its proper state without being corrupted by Session 1
    expect(sync.activeSessionId).toBe(session2);
  });
});
