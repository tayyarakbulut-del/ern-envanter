import { StoredMediaFile, InventoryDatabase } from '../types/inventory';

const DB_NAME = 'itam_media_vault_db';
const STORE_NAME = 'files';
const DB_VERSION = 1;

// In-memory cache for generated object URLs to avoid memory leaks and repeated IndexedDB lookups
const urlCache = new Map<string, string>();

/**
 * Open or upgrade the isolated IndexedDB for binary media storage
 * (Ensures database JSON in localStorage remains small and never bloated)
 */
function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'path' });
        store.createIndex('folder', 'folder', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores an uploaded file (Photo or Scanned Signed Document) in the isolated file vault
 * Returns the relative file path to be saved in the database JSON
 */
export async function storeFile(
  file: File,
  folder: 'assets' | 'documents'
): Promise<StoredMediaFile> {
  const db = await openMediaDb();

  const fileExt = file.name.split('.').pop() || (folder === 'assets' ? 'jpg' : 'pdf');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const path = `/uploads/${folder}/${folder === 'assets' ? 'ast' : 'doc'}_${timestamp}_${randomId}.${fileExt}`;

  const mediaItem: StoredMediaFile & { blob: Blob } = {
    path,
    name: file.name,
    size: file.size,
    type: file.type || (folder === 'assets' ? 'image/jpeg' : 'application/pdf'),
    folder,
    uploadedAt: new Date().toISOString(),
    blob: file,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(mediaItem);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  // Create and cache blob URL
  const blobUrl = URL.createObjectURL(file);
  urlCache.set(path, blobUrl);

  return {
    path,
    name: file.name,
    size: file.size,
    type: mediaItem.type,
    folder,
    uploadedAt: mediaItem.uploadedAt,
    dataUrl: blobUrl,
  };
}

/**
 * Resolves a virtual `/uploads/...` file path to a usable browser URL (blob URL or sample fallback)
 */
export async function resolveFileUrl(path?: string): Promise<string> {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Check in-memory cache
  if (urlCache.has(path)) {
    return urlCache.get(path)!;
  }

  try {
    const db = await openMediaDb();
    const item = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(path);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (item && item.blob) {
      const blobUrl = URL.createObjectURL(item.blob);
      urlCache.set(path, blobUrl);
      return blobUrl;
    }
  } catch (err) {
    console.warn('Could not read from IndexedDB media vault:', err);
  }

  // Fallback for demo sample items that use default path notation
  const fallbackUrl = generateHardwareSampleGraphic(path);
  if (fallbackUrl) {
    urlCache.set(path, fallbackUrl);
    return fallbackUrl;
  }

  return '';
}

/**
 * Deletes a file from the separate media vault
 */
export async function deleteStoredFile(path: string): Promise<void> {
  try {
    const db = await openMediaDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(path);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    if (urlCache.has(path)) {
      URL.revokeObjectURL(urlCache.get(path)!);
      urlCache.delete(path);
    }
  } catch (err) {
    console.error('Failed to delete file from media vault:', err);
  }
}

/**
 * Lists all stored files in the media vault
 */
export async function listAllMediaFiles(): Promise<StoredMediaFile[]> {
  try {
    const db = await openMediaDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results: StoredMediaFile[] = (req.result || []).map((item: any) => ({
          path: item.path,
          name: item.name,
          size: item.size,
          type: item.type,
          folder: item.folder,
          uploadedAt: item.uploadedAt,
        }));
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return [];
  }
}

/**
 * Calculates storage diagnostics to prove to the user that database JSON is not bloated
 */
export async function getStorageVaultStats(db: InventoryDatabase) {
  const storedFiles = await listAllMediaFiles();
  
  const rawDbString = typeof window !== 'undefined' ? localStorage.getItem('itam_inventory_db') || JSON.stringify(db) : JSON.stringify(db);
  const dbJsonSizeBytes = new Blob([rawDbString]).size;

  const assetImages = storedFiles.filter(f => f.folder === 'assets');
  const signedDocs = storedFiles.filter(f => f.folder === 'documents');

  const mediaTotalBytes = storedFiles.reduce((acc, f) => acc + (f.size || 0), 0);

  return {
    dbJsonSizeBytes,
    dbJsonSizeFormatted: formatBytes(dbJsonSizeBytes),
    mediaTotalBytes,
    mediaTotalFormatted: formatBytes(mediaTotalBytes),
    storedFilesCount: storedFiles.length,
    assetImagesCount: assetImages.length,
    signedDocsCount: signedDocs.length,
    files: storedFiles,
  };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Pre-seeds high-definition vector hardware illustrations for sample assets
 * so the app looks stunning immediately without dead image links.
 */
function generateHardwareSampleGraphic(path: string): string {
  let label = 'IT Donanım';
  let sub = 'Kurumsal Envanter';
  let color = '#2563EB'; // Blue
  let bg = '#111827';

  if (path.includes('xps') || path.includes('laptop') || path.includes('thinkpad')) {
    label = 'Kurumsal Laptop';
    sub = 'İş İstasyonu';
    color = '#0284C7';
  } else if (path.includes('macbook') || path.includes('apple')) {
    label = 'MacBook Pro';
    sub = 'Apple Silicon';
    color = '#6366F1';
  } else if (path.includes('cisco') || path.includes('switch') || path.includes('aruba')) {
    label = 'Gigabit Switch';
    sub = 'Ağ Omurga & Dağıtım';
    color = '#10B981';
  } else if (path.includes('ptp') || path.includes('airfiber') || path.includes('antenn')) {
    label = 'PtP Radyolink';
    sub = 'Noktadan Noktaya Yansıtıcı';
    color = '#8B5CF6';
  } else if (path.includes('phone') || path.includes('yealink')) {
    label = 'IP Masaüstü Telefon';
    sub = 'PoE HD Ses';
    color = '#F59E0B';
  } else if (path.includes('ap') || path.includes('unifi')) {
    label = 'Access Point';
    sub = 'Wi-Fi 6E';
    color = '#06B6D4';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
    <rect width="600" height="400" fill="${bg}"/>
    <circle cx="300" cy="180" r="140" fill="${color}" fill-opacity="0.12"/>
    <circle cx="300" cy="180" r="90" stroke="${color}" stroke-width="2" stroke-dasharray="6 6" stroke-opacity="0.4"/>
    <rect x="220" y="120" width="160" height="110" rx="12" fill="#1F2937" stroke="${color}" stroke-width="2"/>
    <path d="M250 160h100M250 180h60" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="360" cy="180" r="4" fill="${color}"/>
    <text x="300" y="280" text-anchor="middle" fill="#F3F4F6" font-family="system-ui, sans-serif" font-size="20" font-weight="700" letter-spacing="0.5">${label}</text>
    <text x="300" y="310" text-anchor="middle" fill="#9CA3AF" font-family="system-ui, sans-serif" font-size="13" font-weight="500">${sub}</text>
    <rect x="20" y="20" width="130" height="26" rx="6" fill="#1F2937" stroke="#374151"/>
    <text x="85" y="37" text-anchor="middle" fill="#E5E7EB" font-family="monospace" font-size="11">/uploads/assets/</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
