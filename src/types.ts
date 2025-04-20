import { ReactNode } from "react";
import {UseBoundStore, StoreApi} from "zustand";

/**
 * Represents an asynchronous effect tied to a Zustand store.
 */
export interface Effect<State, Args extends any[] = []> {
    /** Unique identifier for this effect. */
    readonly __id: string;
    /** Type identifier for this effect. */
    readonly __type: "Effect";
    /** Key of the store this effect is tied to. */
    __key: keyof State;
    /** Tracks how many times the effect has been triggered. */
    readonly __valueCounter: number;
    /** Array of promises for managing concurrent triggers. */
     readonly __triggers: Promise<void>[];
    /** Function access to the store. */
    __store: () => StoreApi<State>;
    /** Indicates if the effect is currently executing. */
    isLoading: boolean;
    /** Triggers the effect manually. */
    trigger: (...args: Args) => Promise<void>;
}

/**
 * Represents an asynchronous query tied to a Zustand store.
 */
export interface Query<State, T> {
    /** A unique identifier for the query. */
    readonly __id: string;
    /** Identifies the object as a query. */
    readonly __type: "Query";
    /** The key in the store tied to the query. */
    __key: keyof State;
    /** Dependencies that trigger the query when changed. */
    readonly __deps: Dependencies<State>;
    /**  A delay (in ms) between query triggers. */
    readonly __debounce: number;
    /**
     * True if the query has not yet loaded data or the data is stale.
     * Not true if the data is fresh or a load is in progress.
     */
    readonly __needsLoad: boolean;
    /**
     * True if the query should wait until it's needed to load.
     * Otherwise the query will load eagerly when dependencies change.
     */
    readonly __lazy: boolean;
    /** Max number of retries or a function that overrides the default retry behavior. */
    readonly __retry?: number | ((attempt: number, error: any) => boolean);
    /** A function that overrides the default retry delay behavior. */
    readonly __retryDelay?: (attempt: number) => number;
    /** The current promise representing the ongoing query, if any. */
    __trigger: Promise<T> | undefined;
    /** Timestamp of when the query was triggered. */
    __triggerStart: number;
    /** The initial try to fetch the data. */
    __initialPromise: Promise<T> | undefined;
    /** Time in ms before data is considered stale. */
    __staleTime: number | undefined;
    /** Timeout for stale data. */
    __staleTimeout: number | undefined;
    /** Function to access the Zustand store. */
    __store: () => StoreApi<State>;
    /** Whether the query has been initialized. */
    __isInitialized: boolean;
    /** Timestamp of when the value was set. */
    __valueTimestamp: number;
    /** The current value returned by the query. */
    value: T | undefined;
    /** Indicates if the query is currently fetching data. */
    isLoading: boolean;
    /** Error caught in the promise. */
    error: any | undefined;
    /** Manually triggers the query. */
    trigger: () => Promise<T>;
    /** Mark the data as stale (i.e. needs a load). */
    markStale: () => void;
    /** Manually set the value of the query. This is useful for optimistic updates, setting initial values, or setting values loaded in server components.
     * 
     * @param value - The value to set.
     * @returns The updated query.
     */
    setValue: (value: T) => Query<State, T>; 
    /** 
     * Manually set the value of the query without updating the store. This is useful for batch updates when you want to make changes to multiple parts of the store then do one update.
     * 
     * @param value - The value to set.
     * @returns The updated query.
     */
    withValue: (value: T) => Query<State, T>; 
}

export type Primitive = string | number | boolean | null | undefined | bigint | symbol;

export interface QueryValue<T> {
    /** The current value returned by the query. */
    value: T | undefined;
    /** Indicates if the query is currently fetching data. */
    isLoading: boolean;
    /** Error caught in the promise. */
    error: any | undefined;
}


/**
 * Dependencies for triggering a query. When one of the dependencies changes the query will be triggered.
 *
 * @param s - The current store state.
 * @returns An array of `Query<Store, any> | Effect<Store, any> | Primitive`.
 */
export type Dependencies<Store> = (s: Store) => (Query<Store, any> | Effect<Store, any> | Primitive)[];

export interface GlobalQueryOptions {
    /** If set to `true`, the query will fetch data as needed. Default is `true`. */
    readonly lazy?: boolean;
    /** The delay (in ms) between query triggers. Default is 300ms. */
    readonly debounce?: number;
    /** Max number of retries or a function that overrides the default retry behavior. Default is 5. */
    readonly retry?: number | ((attempt: number, error: any) => boolean);
    /** A function that overrides the default retry delay behavior. */
    readonly retryDelay?: (attempt: number) => number;
    /** Time in ms before data is considered stale. */
    readonly staleTime?: number;
}

interface IndividualQueryOptions<T> {
    /** The initial value of the query. */
    readonly initialValue?: T;
}

export type QueryOptions<T> = GlobalQueryOptions & IndividualQueryOptions<T>;

export interface GlobalOptions {
    query?: GlobalQueryOptions;
}

export interface SetValueOptions<State, T> {
    /** If `true`, the store will be updated with the new value. Defaults to `true`. */
    readonly __updateStore?: boolean;
    /** If `true`, this value is the initial value for the query. */
    readonly __isInitialValue?: boolean;
    /** Timestamp of the server value. */
    readonly __timestamp?: number;
}


export interface UseBoundAsyncStoreOptions<T> {
  /**
   * Trigger suspense when the query's dependencies are loading.
   */
  readonly followDeps?: boolean;
  /**
   * If `true`, this value is the initial value for the query.
   */
  readonly initialValue?: T;
  /**
   * Value for the query. This value many not be initial value. Provide a timestamp to tell Leo Query when the value was created.
   * Leo Query will use this value if the timestamp is newer than the query value's current timestamp.
   */
  readonly value?: T;
  /**
   * Timestamp of the value. Leo Query will use this value if the timestamp is newer than the query value's current timestamp.
   */
  readonly timestamp?: number;
  /**
   * If `true`, the query will wait until the store has been hydrated before triggering a new fetch.
   */
  readonly hydration?: Promise<void>;
}


export type UseBoundAsyncStoreWithSuspense<T> = {
  /**
   * Select a query from the store. Handle async data concerns:
   *   - Fetch data for the query as needed
   *   - Leverage caching
   *   - Re-render component when query value updates
   *   - Trigger suspense when the query is loading
   *   - Consider dependencies
   * @param selector Select the query from the store.
   * @param opts Options
   */
  <R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions<R>): R;
  /**
   * Select an effect from the store. Handle async data concerns:
   *   - Trigger suspense when the effect is loading
   *   - Consider dependencies
   * @param selector Select the effect from the store.
   * @param opts Options
   */
  <Args extends any[] = []>(selector: (state: T) => Effect<T, Args>): () => Promise<void>
};

export type UseBoundAsyncStoreWithoutSuspense<T> = {
  /**
   * Select a query from the store. Handle async data concerns:
   *   - Fetch data for the query as needed
   *   - Leverage caching
   *   - Re-render component when query value updates
   *   - Trigger suspense when the query is loading
   *   - Consider dependencies
   * @param selector Select the query from the store.
   */
    <R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions<R>): QueryValue<R>;
  /**
   * Select an effect from the store. Handle async data concerns:
   *   - Trigger suspense when the effect is loading
   *   - Consider dependencies
   * @param selector Select the effect from the store.
   */
    <Args extends any[] = []>(selector: (state: T) => Effect<T, Args>): () => Promise<void>
};

export interface StoreProviderProps<T> {
  readonly children: ReactNode;
}

export interface StoreProviderPropsWithServerSideData<T, D> {
  readonly children: ReactNode;
  /**
   * Server side data to hydrate the store. This data will be passed to the stores creation function.
   */
  readonly serverSideData: D;
}

export interface StoreHooks<T> {
  /**
   * Promise that resolves when the store has been hydrated. Internal use only.
   */
  __resolve?: Function;
  /**
   * Hook to access the store.
   */
  readonly hook: UseBoundStore<StoreApi<T>>;
  /**
   * Hook to access a query or effect from the store.
   */
  readonly hookAsync: UseBoundAsyncStoreWithoutSuspense<T>;
  /**
   * Hook to access a query or effect from the store with suspense.
   */
  readonly hookAsyncSuspense: UseBoundAsyncStoreWithSuspense<T>;
  /**
   * The store.
   */
  readonly store: StoreApi<T>;
  /**
   * Whether the store has been hydrated. Only used when persist middleware is used.
   */ 
  hasHydrated: boolean;
  /**
   * Promise that resolves when the store has been hydrated. Only used when persist middleware is used.
   */
  hydration?: Promise<void>;
}

export interface StoreProvider<T> {
  /**
   * Provider for the store.
   */
  readonly Provider: React.FC<StoreProviderProps<T>>;
  /**
   * Context for the store.
   */
  readonly Context: React.Context<StoreHooks<T> | null>;
  /**
   * Hook to access the store.
   */
  readonly useStore: UseBoundStore<StoreApi<T>>;
  /**
   * Hook to access a query or effect from the store.
   */
  readonly useStoreAsync: UseBoundAsyncStoreWithoutSuspense<T>;
  /**
   * Hook to access a query or effect from the store with suspense.
   */
  readonly useStoreSuspense: UseBoundAsyncStoreWithSuspense<T>;
  /**
   * Hook to check if the store has been hydrated. Only used when persist middleware is used.
   */
  readonly useHasHydrated: () => boolean;
}

export interface StoreProviderWithServerSideData<T, D> {
  /**
   * Provider for the store.
   */
  readonly Provider: React.FC<StoreProviderPropsWithServerSideData<T, D>>;
  /**
   * Context for the store.
   */
  readonly Context: React.Context<StoreHooks<T> | null>;
  /**
   * Hook to access the store.
   */
  readonly useStore: UseBoundStore<StoreApi<T>>;
  /**
   * Hook to access a query or effect from the store.
   */
  readonly useStoreAsync: UseBoundAsyncStoreWithoutSuspense<T>;
  /**
   * Hook to access a query or effect from the store with suspense.
   */
  readonly useStoreSuspense: UseBoundAsyncStoreWithSuspense<T>;
  /**
   * Hook to check if the store has been hydrated. Only used when persist middleware is used.
   */
  readonly useHasHydrated: () => boolean;
}