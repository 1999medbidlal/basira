import { OcrProvider } from './ocr-engine.js';

export class ArabicOCRProvider extends OcrProvider {
  async initialize() { return true; }

  async recognize(imageSource, options = {}) {
    // Convert the image to a format we can send to Python
    const response_img = await fetch(imageSource);
    const imageBlob = await response_img.blob();
    
    const formData = new FormData();
    formData.append('file', imageBlob, 'image.png');

    // Send to your Python engine
    const response = await fetch('http://127.0.0.1:8000/api/ocr', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    // Return to Basira
    return {
      text: data.tokens.map(t => t.text).join(' '),
      tokens: data.tokens,
      blocks: [], lines: []
    };
  }
}