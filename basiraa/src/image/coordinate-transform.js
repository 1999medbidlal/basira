/**
 * Coordinate Transformation Subsystem
 *
 * Implements the core mathematical mappings between Original Image Space and Display Viewport Space.
 * Canonical coordinates are ALWAYS in original image pixel space.
 */

/**
 * Transforms an original image bounding box into display space coordinates
 *
 * @param {Object} bbox - Bounding box in original image space { x, y, width, height }
 * @param {Object} originalSize - Original image dimensions { width, height }
 * @param {Object} displayedRect - Rendered element geometry { width, height, offsetX?, offsetY? }
 * @returns {Object} Transformed box in display viewport space { x, y, width, height }
 */
export function transformBboxToDisplay(bbox, originalSize, displayedRect) {
  if (!bbox || !originalSize || !displayedRect) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const { width: origW, height: origH } = originalSize;
  const { width: dispW, height: dispH, offsetX = 0, offsetY = 0 } = displayedRect;

  if (origW <= 0 || origH <= 0 || dispW <= 0 || dispH <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const scaleX = dispW / origW;
  const scaleY = dispH / origH;

  return {
    x: bbox.x * scaleX + offsetX,
    y: bbox.y * scaleY + offsetY,
    width: bbox.width * scaleX,
    height: bbox.height * scaleY,
  };
}

/**
 * Transforms display coordinates back to original image space
 *
 * @param {Object} displayBbox - Bounding box in display space { x, y, width, height }
 * @param {Object} originalSize - Original image dimensions { width, height }
 * @param {Object} displayedRect - Rendered element geometry { width, height, offsetX?, offsetY? }
 * @returns {Object} Box in original image space { x, y, width, height }
 */
export function transformDisplayToOriginal(displayBbox, originalSize, displayedRect) {
  if (!displayBbox || !originalSize || !displayedRect) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const { width: origW, height: origH } = originalSize;
  const { width: dispW, height: dispH, offsetX = 0, offsetY = 0 } = displayedRect;

  if (origW <= 0 || origH <= 0 || dispW <= 0 || dispH <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const scaleX = origW / dispW;
  const scaleY = origH / dispH;

  return {
    x: (displayBbox.x - offsetX) * scaleX,
    y: (displayBbox.y - offsetY) * scaleY,
    width: displayBbox.width * scaleX,
    height: displayBbox.height * scaleY,
  };
}

/**
 * Clamps a bounding box to fit strictly inside the image boundaries
 */
export function clampBbox(bbox, bounds) {
  const x = Math.max(0, Math.min(bbox.x, bounds.width));
  const y = Math.max(0, Math.min(bbox.y, bounds.height));
  const width = Math.max(0, Math.min(bbox.width, bounds.width - x));
  const height = Math.max(0, Math.min(bbox.height, bounds.height - y));

  return { x, y, width, height };
}

/**
 * Compute the bounding union of multiple boxes
 */
export function computeBoundingUnion(boxes) {
  if (!boxes || boxes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const b of boxes) {
    if (!b) continue;
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }

  if (minX === Infinity) return { x: 0, y: 0, width: 0, height: 0 };

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
