import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * usePersistedState - a drop-in replacement for useState whose value also
 * survives a page reload by being mirrored into window.localStorage.
 *
 * The lazy initialiser means the disk is read exactly once per mount instead
 * of on every render. Writes are wrapped in try/catch because localStorage is
 * synchronous and throws QuotaExceededError when the 5 MB budget is full.
 */
export function usePersistedState(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue));
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStorageError('');
    } catch (error) {
      // Most likely a full quota (photos are the big consumer).
      setStorageError(
        error?.name === 'QuotaExceededError'
          ? 'Local storage is full. Remove a photo or delete an old item.'
          : 'Changes could not be saved to this device.'
      );
    }
  }, [key, value]);

  return [value, setValue, storageError];
}

function readValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return typeof fallback === 'function' ? fallback() : fallback;
    return JSON.parse(raw);
  } catch {
    // Corrupted JSON (for example after an interrupted write) - start clean
    // rather than crash the whole application.
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}

/** Small helper so components can clear the app's own data safely. */
export function useResetStorage(key) {
  const keyRef = useRef(key);
  return useCallback(() => {
    window.localStorage.removeItem(keyRef.current);
    window.location.reload();
  }, []);
}
