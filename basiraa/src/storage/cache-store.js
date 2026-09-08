import { logger } from '../utils/logger.js';

const DB_NAME = 'basira_db';
const DB_VERSION = 1;
const STORE_OCR_CACHE = 'ocr_cache';

/**
 * IndexedDB Cache Store for OCR Results
 */
export class CacheStore {
  constructor() {
    this.db = null;
  }

  async getDb() {
    if (this.db) return this.db;
    if (typeof indexedDB === 'undefined') return null;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_OCR_CACHE)) {
          db.createObjectStore(STORE_OCR_CACHE, { keyPath: 'key' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        logger.warn('STORAGE', 'IndexedDB open failed', e);
        resolve(null); // Degrade gracefully
      };
    });
  }

  generateCacheKey(imageHash, language, config = {}) {
    const configStr = JSON.stringify(config);
    return `${imageHash || 'img'}:${language || 'eng'}:${configStr}`;
  }

  async get(key) {
    try {
      const db = await this.getDb();
      if (!db) return null;

      return new Promise((resolve) => {
        const tx = db.transaction(STORE_OCR_CACHE, 'readonly');
        const store = tx.objectStore(STORE_OCR_CACHE);
        const req = store.get(key);

        req.onsuccess = () => {
          const item = req.result;
          if (item) {
            logger.log('STORAGE', `OCR cache hit for key: ${key}`);
            resolve(item.data);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async set(key, data) {
    try {
      const db = await this.getDb();
      if (!db) return;

      return new Promise((resolve) => {
        const tx = db.transaction(STORE_OCR_CACHE, 'readwrite');
        const store = tx.objectStore(STORE_OCR_CACHE);
        store.put({
          key,
          data,
          createdAt: Date.now(),
        });

        tx.oncomplete = () => {
          logger.log('STORAGE', `OCR cached for key: ${key}`);
          resolve(true);
        };

        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      logger.warn('STORAGE', 'Failed to write cache to IndexedDB', e);
    }
  }
}
