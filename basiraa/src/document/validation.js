/**
 * Document & Token Invariant Validation
 */

export function validateToken(token, imageDimensions) {
  const errors = [];

  if (!token.id) errors.push('Token missing ID');
  if (!token.text || typeof token.text !== 'string') errors.push('Token missing text');
  if (!token.bbox) {
    errors.push('Token missing bounding box');
  } else {
    const { x, y, width, height } = token.bbox;
    if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
      errors.push('Bounding box coordinates must be numbers');
    }
    if (width <= 0 || height <= 0) {
      errors.push('Bounding box dimensions must be positive');
    }
    if (imageDimensions && (imageDimensions.width > 0 && imageDimensions.height > 0)) {
      if (x < 0 || y < 0 || x > imageDimensions.width || y > imageDimensions.height) {
        errors.push('Bounding box origin exceeds image bounds');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateDocument(doc) {
  const errors = [];

  if (!doc.id) errors.push('Document missing ID');
  if (!doc.source || doc.source.width <= 0 || doc.source.height <= 0) {
    errors.push('Document source dimensions invalid');
  }

  if (doc.reading?.tokens) {
    for (let i = 0; i < doc.reading.tokens.length; i++) {
      const result = validateToken(doc.reading.tokens[i], doc.source);
      if (!result.valid) {
        errors.push(`Token at index ${i} invalid: ${result.errors.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
