import {isQuery, isEffect, setSync} from "./src";

/**
 * Handle queries and effects appropriately when merging persisted state with current state. 
 * Queries values are loaded from persisted state. Effects are ignored.
 * 
 * @param persistedState - The persisted state.
 * @param currentState - The current state.
 * @returns The merged state.
 */
export const merge = <T extends object>(persistedState: unknown, currentState: T): T => {
  const leoPersistedState = {...persistedState as Record<string, unknown>} as Record<string, unknown>;
  Object
    .entries(currentState)
    .forEach(([key, currentValue]) => {
      if (!currentValue) return;
      // Queries - Only read the value persisted. Use the current state's query metadata.
      if (isQuery(currentValue)) {
        try {
          const persistedValue = leoPersistedState[key] as any;
          if (persistedValue && persistedValue.value !== undefined) {
            leoPersistedState[key] = setSync(currentValue, persistedValue.value, /*error*/undefined, {__updateStore: false});
          } else {
            leoPersistedState[key] = currentValue; 
          }
        } catch (error) {
          console.error(`Failed to merge persisted state for query ${key}:`, error);
        }
      }
      // Effects - effects should not be persisted. So ignore any that were accidentally persisted.
      if (isEffect(currentValue)) {
        leoPersistedState[key] = currentValue; 
      }
    });
  return {...currentState, ...leoPersistedState};
};

/**
 * Handle queries and effects appropriately when persisting state.
 * Queries values are persisted. Effects are not persisted.
 * 
 * @param state - The state to partialize.
 * @returns The partialized state.
 */
export const partialize = <T extends object>(state: T): Partial<T> => {
  const partialized = {...state};
  Object
    .entries(partialized)
    .forEach(([key, value]) => {
      if (!value) return;
      // Queries - Only persist the value of the query. Ignore metadata. 
      if (isQuery(value)) {
        partialized[key as keyof T] = {value: value.value} as T[keyof T];
      }
      // Effects - Remove effects from being persisted.
      if (isEffect(value)) {
        delete partialized[key as keyof T];
      }
    });
  return partialized as Partial<T>;
};