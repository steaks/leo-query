export const wait = async (timeout?: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, timeout);
  });
};

/**
 * Generate a UUID v4 string with fallbacks for browsers that don't support crypto.randomUUID
 * @returns A UUID v4 string
 */
export const generateUUID = (): string => {
  // First try native crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: Math.random based UUID (more collisions, still very few, but works everywhere)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};