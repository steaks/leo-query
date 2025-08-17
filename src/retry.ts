import {Query} from "./types";
import {wait} from "./util";


const isOutOfDate = <State, R>(nitialPromise: Promise<R>, query: Query<State, R>) => {
  const state = query.__store().getState();
  const current = state[query.key] as Query<State, R>;
  return current.__initialPromise !== nitialPromise;
};

export const defaultRetry = (attempt: number, error: any): boolean =>
  attempt < 5; //Default to 5 max retries

/**
 * Default retry delay function. Defaults to exponential backoff.
 * @param attempt
 */
export const defaultRetryDelay = (attempt: number): number => {
  console.debug(`Attempt ${attempt}`);
  const delay = attempt === 0 ? 0 : Math.min((2 ** (attempt - 1)) * 1000, 30 * 1000);
  console.debug(`Delaying for ${delay}ms`);
  return delay;
}

export const retryDelay = <State, R>(attempt: number, query: Query<State, R>): number =>
  query.__retryDelay ? query.__retryDelay(attempt) : defaultRetryDelay(attempt);

export const shouldRetry = <State, R>(attempt: number, error: any, query: Query<State, R>): boolean => {
  if (typeof query.__retry === "number") {
    return attempt < query.__retry;
  }
  if (typeof query.__retry === "function") {
    return query.__retry(attempt, error);
  }
  return defaultRetry(attempt, error);
}

export const retry = async <State, R>(fn: () => Promise<R>, originalPromise: Promise<R>, prevError: any, query: Query<State, R>, attempt: number): Promise<R> => {
  if (isOutOfDate(originalPromise, query)) {
    throw prevError;
  }
  try {
    return await fn();
  } catch (error) {
    if (isOutOfDate(originalPromise, query)) {
      throw error;
    }
    if (!shouldRetry(attempt + 1, error, query)) {
      throw error;
    }
    const delay = retryDelay(attempt, query);
    await wait(delay);
    return retry(fn, originalPromise, error, query, attempt + 1);
  }
};

export const setupRetries = <State, R>(fn: () => Promise<R>, initialTry: Promise<R>, query: Query<State, R>): Promise<R> =>
  initialTry.catch(async error => {
    if (isOutOfDate(initialTry, query)) {
      throw error;
    }
    if (!shouldRetry(0, error, query)) {
      throw error;
    }
    const delay = retryDelay(0, query);
    await wait(delay);
    return retry(fn, initialTry, error, query, 1);
  });