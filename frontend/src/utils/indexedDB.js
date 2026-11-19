// IndexedDB Helper for browser-based file storage in Demo Mode

const DB_NAME = 'HealthVaultDemoDB';
const DB_VERSION = 1;
const STORE_NAME = 'demo_files';

export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const saveFileToIndexedDB = async (id, fileOrBlob, metadata = {}) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const record = {
        id,
        file: fileOrBlob,
        name: metadata.name || fileOrBlob.name || 'unnamed_file',
        type: metadata.type || fileOrBlob.type || 'application/octet-stream',
        size: metadata.size || fileOrBlob.size || 0,
        createdAt: new Date().toISOString()
      };

      const request = store.put(record);
      request.onsuccess = () => resolve(record);
      request.onerror = (e) => reject(new Error('Failed to save file to IndexedDB: ' + e.target.error?.message));
    });
  } catch (err) {
    console.error('IndexedDB Save Error:', err);
    throw err;
  }
};

export const getFileFromIndexedDB = async (id) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = (e) => {
        resolve(e.target.result || null);
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  } catch (err) {
    console.error('IndexedDB Read Error:', err);
    return null;
  }
};

export const deleteFileFromIndexedDB = async (id) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('IndexedDB Delete Error:', err);
    return false;
  }
};
