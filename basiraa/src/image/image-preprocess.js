import { logger } from '../utils/logger.js';

/**
 * Image Preprocessing Subsystem
 *
 * Generates TEMPORARY in-memory derivative canvases for OCR enhancement.
 * Never mutates or replaces the source image.
 */
export async function createOcrDerivative(imageElementOrBlob, options = {}) {
  const {
    grayscale = true,
    enhanceContrast = true,
    scale = 1.0,
    contrastLevel = 1.2,
  } = options;

  logger.log('IMAGE', 'Creating temporary OCR derivative', options);

  if (typeof document === 'undefined') {
    // Node environment fallback for testing
    return imageElementOrBlob;
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const processImage = (img) => {
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (grayscale || enhanceContrast) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Grayscale luminance
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // Contrast enhancement
          if (enhanceContrast) {
            gray = ((gray / 255 - 0.5) * contrastLevel + 0.5) * 255;
            gray = Math.max(0, Math.min(255, gray));
          }

          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        ctx.putImageData(imgData, 0, 0);
      }

      canvas.toBlob((blob) => {
        resolve(blob || canvas);
      }, 'image/png');
    };

    if (imageElementOrBlob instanceof HTMLImageElement) {
      if (imageElementOrBlob.complete) {
        processImage(imageElementOrBlob);
      } else {
        imageElementOrBlob.onload = () => processImage(imageElementOrBlob);
      }
    } else if (imageElementOrBlob instanceof Blob) {
      const img = new Image();
      const url = URL.createObjectURL(imageElementOrBlob);
      img.onload = () => {
        processImage(img);
        URL.revokeObjectURL(url);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    } else {
      resolve(imageElementOrBlob);
    }
  });
}
