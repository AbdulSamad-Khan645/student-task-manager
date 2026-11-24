// Small helpers around a Web Storage-like object (window.localStorage in the
// browser, an in-memory stand-in in tests). Anything with getItem/setItem/
// removeItem works, which keeps the auth and task modules testable in Node.

export function createMemoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
    clear: () => data.clear(),
  };
}

export function readJSON(storage, key, fallback) {
  const raw = storage.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}
