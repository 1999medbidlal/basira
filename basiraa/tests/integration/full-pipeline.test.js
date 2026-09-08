import { describe, it, expect, vi } from 'vitest';
import { normalizeOcrResult } from '../../src/ocr/ocr-normalizer.js';
import { ReaderController } from '../../src/reader/reader-controller.js';
import { READER_STATUS } from '../../src/reader/reader-state.js';

describe('Basira Complete Integration Pipeline Test', () => {
  it('executes full reading pipeline: OCR -> Document -> Reading Order -> Sync -> State Transitions', async () => {
    // 1. Raw OCR Output from local engine
    const rawOcr = {
      provider: 'tesseract',
      language: 'eng',
      confidence: 95,
      words: [
        { text: 'Basira', bbox: { x0: 100, y0: 100, x1: 220, y1: 140 } },
        { text: 'Reading', bbox: { x0: 230, y0: 100, x1: 350, y1: 140 } },
        { text: 'Assistant', bbox: { x0: 360, y0: 100, x1: 500, y1: 140 } },
      ],
    };

    // 2. Normalize OCR into Canonical Document
    const documentModel = normalizeOcrResult(rawOcr, { width: 1920, height: 1080 });

    expect(documentModel.reading.tokens.length).toBe(3);
    expect(documentModel.reading.tokens[0].text).toBe('Basira');
    expect(documentModel.reading.tokens[1].text).toBe('Reading');
    expect(documentModel.reading.tokens[2].text).toBe('Assistant');

    // 3. Mock Highlighting and Speech with controllable delay
    const highlightedBoxes = [];
    const highlightEngine = {
      highlightToken: vi.fn().mockImplementation((token) => {
        highlightedBoxes.push(token.text);
      }),
      clearHighlight: vi.fn(),
      setTokens: vi.fn(),
    };

    const spokenTexts = [];
    let resolveFirstWord;
    const speechEngine = {
      speak: vi.fn().mockImplementation((text) => {
        spokenTexts.push(text);
        if (text === 'Basira') {
          return new Promise((resolve) => {
            resolveFirstWord = resolve;
          });
        }
        return Promise.resolve();
      }),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      setRate: vi.fn(),
    };

    // 4. Mount Reader Controller
    const controller = new ReaderController(highlightEngine, speechEngine);
    controller.loadDocument(documentModel);

    expect(controller.state.status).toBe(READER_STATUS.IDLE);

    // 5. Play
    controller.play(0);
    expect(controller.state.status).toBe(READER_STATUS.PLAYING);

    expect(spokenTexts).toContain('Basira');
    expect(highlightedBoxes).toContain('Basira');

    // 6. Pause during speech
    controller.pause();
    expect(controller.state.status).toBe(READER_STATUS.PAUSED);

    // 7. Resume & complete
    controller.resume();
    expect(controller.state.status).toBe(READER_STATUS.PLAYING);

    if (resolveFirstWord) resolveFirstWord();
    await new Promise((r) => setTimeout(r, 20));

    // 8. Stop
    controller.stop();
    expect(controller.state.status).toBe(READER_STATUS.STOPPED);
    expect(highlightEngine.clearHighlight).toHaveBeenCalled();
  });
});
