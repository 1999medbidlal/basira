import { describe, it, expect, vi } from 'vitest';
import { ReaderController } from '../../src/reader/reader-controller.js';
import { DocumentModel } from '../../src/document/document-model.js';
import { Token } from '../../src/document/token-model.js';
import { READER_STATUS } from '../../src/reader/reader-state.js';

describe('Reader Controller State Machine', () => {
  it('manages transitions: idle -> playing -> paused -> playing -> stopped', async () => {
    const tokens = [
      new Token({ id: 't1', text: 'Hello', bbox: { x: 10, y: 10, width: 50, height: 20 }, readingOrder: 0 }),
      new Token({ id: 't2', text: 'Basira', bbox: { x: 70, y: 10, width: 60, height: 20 }, readingOrder: 1 }),
    ];

    const doc = new DocumentModel({
      source: { width: 1000, height: 800 },
      reading: { tokens, direction: 'ltr' },
    });

    const highlightEngine = {
      highlightToken: vi.fn(),
      clearHighlight: vi.fn(),
      setTokens: vi.fn(),
    };

    const speechEngine = {
      speak: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      setRate: vi.fn(),
    };

    const controller = new ReaderController(highlightEngine, speechEngine);

    // Initial state
    expect(controller.state.status).toBe(READER_STATUS.IDLE);

    // Load document
    controller.loadDocument(doc);
    expect(controller.state.totalTokens).toBe(2);
    expect(controller.state.currentIndex).toBe(0);

    // Play
    controller.play();
    expect(controller.state.status).toBe(READER_STATUS.PLAYING);

    // Pause
    controller.pause();
    expect(controller.state.status).toBe(READER_STATUS.PAUSED);
    expect(speechEngine.pause).toHaveBeenCalled();

    // Resume
    controller.resume();
    expect(controller.state.status).toBe(READER_STATUS.PLAYING);
    expect(speechEngine.resume).toHaveBeenCalled();

    // Stop
    controller.stop();
    expect(controller.state.status).toBe(READER_STATUS.STOPPED);
    expect(speechEngine.stop).toHaveBeenCalled();
    expect(highlightEngine.clearHighlight).toHaveBeenCalled();
  });

  it('steps forward, backward, and restarts correctly', async () => {
    const tokens = [
      new Token({ id: 't1', text: 'One', bbox: { x: 10, y: 10, width: 40, height: 20 }, readingOrder: 0 }),
      new Token({ id: 't2', text: 'Two', bbox: { x: 60, y: 10, width: 40, height: 20 }, readingOrder: 1 }),
      new Token({ id: 't3', text: 'Three', bbox: { x: 110, y: 10, width: 50, height: 20 }, readingOrder: 2 }),
    ];

    const doc = new DocumentModel({
      source: { width: 1000, height: 800 },
      reading: { tokens, direction: 'ltr' },
    });

    const highlightEngine = {
      highlightToken: vi.fn(),
      clearHighlight: vi.fn(),
      setTokens: vi.fn(),
    };

    const speechEngine = {
      speak: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      setRate: vi.fn(),
    };

    const controller = new ReaderController(highlightEngine, speechEngine);
    controller.loadDocument(doc);

    // Step forward
    controller.stepForward();
    expect(controller.state.currentIndex).toBe(1);
    expect(highlightEngine.highlightToken).toHaveBeenCalled();

    // Step forward again
    controller.stepForward();
    expect(controller.state.currentIndex).toBe(2);

    // Step backward
    controller.stepBackward();
    expect(controller.state.currentIndex).toBe(1);

    // Restart
    controller.restart();
    expect(controller.state.currentIndex).toBe(0);
    expect(controller.state.status).toBe(READER_STATUS.PLAYING);
  });
});

