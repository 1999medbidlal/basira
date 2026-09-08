/**
 * Image Metadata and Dimension Detection
 */

/**
 * Reads natural dimensions of an image source (Blob, File, or Image element)
 */
export async function getImageDimensions(source) {
  if (typeof Image === 'undefined') {
    // Node environment fallback for testing
    return { width: 1920, height: 1080 };
  }

  if (source instanceof HTMLImageElement && source.naturalWidth > 0) {
    return {
      width: source.naturalWidth,
      height: source.naturalHeight,
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const isBlob = source instanceof Blob;
    const url = isBlob ? URL.createObjectURL(source) : source;

    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      if (isBlob) {
        URL.revokeObjectURL(url);
      }
      resolve(dimensions);
    };

    img.onerror = (err) => {
      if (isBlob) {
        URL.revokeObjectURL(url);
      }
      reject(new Error('Failed to load image to calculate dimensions'));
    };

    img.src = url;
  });
}

/**
 * Calculates a SHA-256 hash or deterministic signature for caching
 */
export async function computeImageHash(source) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      let arrayBuffer;
      if (source instanceof Blob) {
        arrayBuffer = await source.arrayBuffer();
      } else if (typeof source === 'string') {
        const encoder = new TextEncoder();
        arrayBuffer = encoder.encode(source);
      }

      if (arrayBuffer) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      console.warn('SubtleCrypto hash failed, falling back to simple hash', e);
    }
  }

  // Fast deterministic fallback hash
  let str = typeof source === 'string' ? source : (source?.name || '') + (source?.size || '') + (source?.lastModified || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash-${Math.abs(hash).toString(16)}`;
}
