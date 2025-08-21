import { GlobalOptions } from "./types";

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
export const generateUUID = (config: GlobalOptions): string => {
  if (config.uuidv4) {
    return config.uuidv4();
  }

  // Fallback to crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  throw new Error('No UUID generator provided. Please provide a uuidv4 function in the global config. If you are using React Native, see the React Native guide in the docs for more information.');
};