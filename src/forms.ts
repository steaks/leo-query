import { QueryValue, LeoRequest } from "./types";
import { useState, useEffect, Dispatch, SetStateAction, useRef } from "react";
import { equals } from "./src";

/**
 * React hook that creates local state synchronized with a query's value.
 * Useful for form inputs or other UI components that need local state management tied to a query.
 * The local state will automatically update when the query's value changes.
 * 
 * @param query - The query value object to synchronize state with.
 * @param initialValue - Initial value for the local state. Guarantees non-undefined state.
 * @returns A tuple containing the current state value and a setter function, similar to React's `useState`.
 * 
 * @example
 * ```tsx
 * const [name, setName] = useQueryState(userQuery, '');
 * 
 * return (
 *   <input 
 *     value={name} 
 *     onChange={(e) => setName(e.target.value)} 
 *   />
 * );
 * ```
 */
export function useQueryState<T>(query: QueryValue<T>, initialValue: T): [T, Dispatch<SetStateAction<T>>];
/**
 * React hook that creates local state synchronized with a query's value.
 * Maps a property from the query value using a selector function.
 * 
 * @param query - The query value object to synchronize state with.
 * @param selector - Function to extract a property from the query value. Only the selected property is managed locally.
 * @returns A tuple containing the current state value and a setter function, similar to React's `useState`.
 * 
 * @example
 * ```tsx
 * // Query returns { name: 'John', age: 30 }
 * const [name, setName] = useQueryState(userQuery, (user) => user.name, '');
 * 
 * return (
 *   <input 
 *     value={name} 
 *     onChange={(e) => setName(e.target.value)} 
 *   />
 * );
 * ```
 */
export function useQueryState<Q, T>(query: QueryValue<Q>, selector: (value: Q) => T): [T, Dispatch<SetStateAction<T>>];
/**
 * React hook that creates local state synchronized with a query's value.
 * Maps a property from the query value using a selector function.
 * 
 * @param query - The query value object to synchronize state with.
 * @param selector - Function to extract a property from the query value. Only the selected property is managed locally.
 * @param initialValue - Initial value for the local state. Guarantees non-undefined state.
 * @returns A tuple containing the current state value and a setter function, similar to React's `useState`.
 * 
 * @example
 * ```tsx
 * // Query returns { name: 'John', age: 30 }
 * const [name, setName] = useQueryState(userQuery, (user) => user.name, '');
 * 
 * return (
 *   <input 
 *     value={name} 
 *     onChange={(e) => setName(e.target.value)} 
 *   />
 * );
 * ```
 */
export function useQueryState<Q, T>(query: QueryValue<Q>, selector: (value: Q) => T, initialValue: T): [T, Dispatch<SetStateAction<T>>];
/**
 * React hook that creates local state synchronized with a query's value.
 * 
 * @param query - The query value object to synchronize state with.
 * @param selector - Optional function to extract a property from the query value. When provided, only the selected property is managed locally.
 * @param initialValue - Optional initial value for the local state.
 * @returns A tuple containing the current state value (may be undefined) and a setter function, similar to React's `useState`.
 * 
 * @example
 * ```tsx
 * // Without initial value - state may be undefined
 * const [name, setName] = useQueryState(userQuery, (user) => user.name);
 * 
 * return (
 *   <input 
 *     value={name || ''} 
 *     onChange={(e) => setName(e.target.value)} 
 *   />
 * );
 * ```
 */
export function useQueryState<Q, T = Q>(query: QueryValue<Q>, selector?: (value: Q) => T, initialValue?: T): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  let _selector: (value: Q) => T | undefined;
  if (selector && typeof selector === 'function') {
    _selector = selector;
  } else {
    _selector = (value: Q) => value as unknown as T;
  }

  let _initialValue: T | undefined;
  if (selector && typeof selector !== 'function') {
    _initialValue = selector;
  } else if (initialValue !== undefined) {
    _initialValue = initialValue;
  } else {
    _initialValue = undefined;
  }

  const [state, setState] = useState<T | undefined>(_initialValue);

  useEffect(() => {
    if (query.value !== undefined) {
      const value = _selector(query.value);
      if (!equals(value, state)) {
        setState(value);
      }
    }
  }, [query.value]);

  return [state, setState];
};

/**
 * React hook that tracks whether a message should be displayed based on a query or effect request.
 * The message automatically expires after a specified timeout. When a new request is provided,
 * any existing timer is cleared and a new countdown begins from the start.
 * Useful for displaying temporary success or error messages that should disappear after a few seconds.
 * 
 * @param request - The query or effect request object to track. When this changes to a new request, the expiration timer resets and starts counting down again. Can be `query.lastCompletedRequest` or `effect.lastCompletedRequest`.
 * @param timeout - The duration in milliseconds before the message expires. The timer starts immediately when a request is provided.
 * @returns A boolean indicating whether the message has expired. Returns `false` initially and whenever a new request is provided, `true` after the timeout expires.
 * 
 * @example
 * ```tsx
 * // With an effect request
 * const { lastCompletedRequest, isLoading } = useDogStore(s => ({
 *   lastCompletedRequest: s.increasePopulation.lastCompletedRequest,
 *   isLoading: s.increasePopulation.isLoading
 * }));
 * 
 * const messageExpired = useMessageExpired(lastCompletedRequest, 3000);
 * const showMessage = lastCompletedRequest && !isLoading && !messageExpired;
 * 
 * return (
 *   <>
 *     <button onClick={trigger}>Submit</button>
 *     {showMessage && lastCompletedRequest.status === 'success' && <p>Success!</p>}
 *     {showMessage && lastCompletedRequest.status === 'error' && <p>Error!</p>}
 *   </>
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // With a query request
 * const dogs = useDogStoreAsync(state => state.dogs);
 * const messageExpired = useMessageExpired(dogs.lastCompletedRequest, 3000);
 * 
 * if (dogs.isLoading) return <Loading />;
 * if (dogs.error && !messageExpired) return <Error />;
 * return <div>{dogs.value}</div>;
 * ```
 */
export const useMessageExpired = <R>(request: LeoRequest<R> | undefined, timeout: number): boolean => {
  const [messageExpired, setMessageExpired] = useState(false);
  const timeoutRef = useRef<number>(0);
  useEffect(() => {
    if (request) {
      clearTimeout(timeoutRef.current);
      if (messageExpired) {
        setMessageExpired(false);
      }
      const timeoutId = setTimeout(() => setMessageExpired(true), timeout) as unknown as number;
      timeoutRef.current = timeoutId;
    }
    return () => {
      clearTimeout(timeoutRef.current);
    }
  }, [request, timeout]);
  return messageExpired;
};