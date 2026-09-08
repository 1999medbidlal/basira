import { describe, it, expect } from 'vitest';
import {
  transformBboxToDisplay,
  transformDisplayToOriginal,
  clampBbox,
  computeBoundingUnion,
} from '../../src/image/coordinate-transform.js';

describe('Coordinate Transformation Subsystem & Round-Trip Proof', () => {
  const EPSILON = 1e-4;

  const assertRoundTrip = (originalSize, displayedRect, originalBbox) => {
    const displayBbox = transformBboxToDisplay(originalBbox, originalSize, displayedRect);
    const roundTripBbox = transformDisplayToOriginal(displayBbox, originalSize, displayedRect);

    expect(Math.abs(roundTripBbox.x - originalBbox.x)).toBeLessThan(EPSILON);
    expect(Math.abs(roundTripBbox.y - originalBbox.y)).toBeLessThan(EPSILON);
    expect(Math.abs(roundTripBbox.width - originalBbox.width)).toBeLessThan(EPSILON);
    expect(Math.abs(roundTripBbox.height - originalBbox.height)).toBeLessThan(EPSILON);
  };

  it('correctly scales bounding box from 1920x1080 to 960x540 (half scale)', () => {
    const originalSize = { width: 1920, height: 1080 };
    const displayedRect = { width: 960, height: 540 };
    const bbox = { x: 500, y: 300, width: 150, height: 50 };

    const transformed = transformBboxToDisplay(bbox, originalSize, displayedRect);

    expect(transformed.x).toBeCloseTo(250);
    expect(transformed.y).toBeCloseTo(150);
    expect(transformed.width).toBeCloseTo(75);
    expect(transformed.height).toBeCloseTo(25);
  });

  describe('Round-Trip Transformations Across Aspect Ratios and Viewports', () => {
    it('proves round-trip for landscape images (1920x1080) on various viewports', () => {
      const originalSize = { width: 1920, height: 1080 };
      const bbox = { x: 450, y: 300, width: 220, height: 60 };

      // Desktop viewport
      assertRoundTrip(originalSize, { width: 960, height: 540, offsetX: 0, offsetY: 0 }, bbox);
      // Tablet viewport
      assertRoundTrip(originalSize, { width: 700, height: 393.75, offsetX: 20, offsetY: 10 }, bbox);
      // Mobile viewport
      assertRoundTrip(originalSize, { width: 340, height: 191.25, offsetX: 15, offsetY: 5 }, bbox);
    });

    it('proves round-trip for portrait images (1080x1920) on various viewports', () => {
      const originalSize = { width: 1080, height: 1920 };
      const bbox = { x: 120, y: 600, width: 350, height: 80 };

      // Mobile portrait viewport
      assertRoundTrip(originalSize, { width: 360, height: 640, offsetX: 0, offsetY: 0 }, bbox);
      // Desktop fitted viewport
      assertRoundTrip(originalSize, { width: 450, height: 800, offsetX: 100, offsetY: 20 }, bbox);
    });

    it('proves round-trip for square images (1000x1000)', () => {
      const originalSize = { width: 1000, height: 1000 };
      const bbox = { x: 250, y: 400, width: 300, height: 150 };

      assertRoundTrip(originalSize, { width: 500, height: 500, offsetX: 25, offsetY: 25 }, bbox);
      assertRoundTrip(originalSize, { width: 300, height: 300, offsetX: 0, offsetY: 0 }, bbox);
    });

    it('proves round-trip for very wide banner documents (3000x500)', () => {
      const originalSize = { width: 3000, height: 500 };
      const bbox = { x: 1200, y: 150, width: 400, height: 100 };

      assertRoundTrip(originalSize, { width: 900, height: 150, offsetX: 0, offsetY: 50 }, bbox);
      assertRoundTrip(originalSize, { width: 360, height: 60, offsetX: 10, offsetY: 0 }, bbox);
    });

    it('proves round-trip for very tall scroll documents (500x3000)', () => {
      const originalSize = { width: 500, height: 3000 };
      const bbox = { x: 50, y: 1800, width: 380, height: 120 };

      assertRoundTrip(originalSize, { width: 150, height: 900, offsetX: 200, offsetY: 0 }, bbox);
      assertRoundTrip(originalSize, { width: 100, height: 600, offsetX: 0, offsetY: 0 }, bbox);
    });

    it('proves round-trip during dynamic responsive resizing simulation', () => {
      const originalSize = { width: 2400, height: 1600 };
      const bbox = { x: 500, y: 700, width: 300, height: 100 };

      const viewportWidths = [1920, 1440, 1280, 1024, 768, 480, 375, 320];

      for (const vpWidth of viewportWidths) {
        const dispW = vpWidth * 0.8;
        const dispH = dispW * (originalSize.height / originalSize.width);
        assertRoundTrip(originalSize, { width: dispW, height: dispH, offsetX: vpWidth * 0.1, offsetY: 20 }, bbox);
      }
    });
  });

  it('clamps coordinates to boundary limits', () => {
    const bounds = { width: 1000, height: 800 };
    const overflowBbox = { x: 950, y: 750, width: 100, height: 100 };

    const clamped = clampBbox(overflowBbox, bounds);
    expect(clamped.x).toBe(950);
    expect(clamped.y).toBe(750);
    expect(clamped.width).toBe(50);
    expect(clamped.height).toBe(50);
  });

  it('computes union bounding box correctly for multiple words in a line', () => {
    const boxes = [
      { x: 100, y: 50, width: 80, height: 20 },
      { x: 190, y: 48, width: 90, height: 24 },
      { x: 290, y: 50, width: 70, height: 20 },
    ];

    const union = computeBoundingUnion(boxes);
    expect(union.x).toBe(100);
    expect(union.y).toBe(48);
    expect(union.width).toBe(260);
    expect(union.height).toBe(24);
  });
});
