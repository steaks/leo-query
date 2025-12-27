import { ReactNode } from "react";
import {UseBoundStore, StoreApi} from "zustand";

export type LeoRequestStatus = 'success' | 'error' | 'pending';

export interface Timing {
  /** The timestamp when the request started. */
  startTime: number;
  /** The timestamp when the request ended. */
  endTime?: number;
  /** The duration of the request. */
  duration?: number;
}

export interface EffectRequestDetails<Args extends any[]> {
  /** The arguments passed to the effect. */
  args: Args;
}

export interface LeoResponse<T> {
  /** The result of the effect. */
  result?: T;
  /** The error of the effect. */
  error?: any | undefined;
}

export interface LeoRequest<R> {
  /** The index of the request. */
  id: string;
  /** The response of the request. */
  response?: LeoResponse<R>;
  /** Timing information for the request. */
  timing: Timing;
  /** The status of the request. */
  status: LeoRequestStatus;
}

export interface EffectRequest<Args extends any[], R> extends LeoRequest<R> {
  type: "effect";
  details: EffectRequestDetails<Args>;
}

export interface QueryRequest<T> extends LeoRequest<T> {
  type: "query";
}

/**
 * Represents an asynchronous effect tied to a Zustand store.
 */
export interface Effect<State, Args extends any[] = [], R = void> {
    /** Unique identifier for this effect. */
    readonly __id: string;
    /** Type identifier for this effect. */
    readonly __type: "Effect";
    /** Tracks how many times the effect has been triggered. */
    readonly __valueCounter: number;
    /** Array of promises for managing concurrent triggers. */
    readonly __triggers: Promise<void>[];
    /** Function access to the store. */
    __store: () => StoreApi<State>;
    /** Key of the store this effect is tied to. */
    key: keyof State;
    /** Indicates if the effect is currently executing. */
    isLoading: boolean;
    /** Indicates if the effect is currently idle. */
    isIdle: boolean;
    /** The most recently started request of the effect (may still be pending). */
    lastStartedRequest: EffectRequest<Args, R> | undefined;
    /** The most recently completed request of the effect. */
    lastCompletedRequest: EffectRequest<Args, R> | undefined;
    /** History of all requests made by the effect. Useful for debugging. */
    readonly requests: EffectRequest<Args, R>[];
    /** Triggers the effect manually. */
    trigger: (...args: Args) => Promise<R>;
}

/**
 * Represents an asynchronous query tied to a Zustand store.
 */
export interface Query<State, T> {
    /** A unique identifier for the query. */
    readonly __id: string;
    /** Identifies the object as a query. */
    readonly __type: "Query";
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
    /** The key in the store tied to the query. */
    key: keyof State;
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
    /** The most recently started request of the query (may still be pending). */
    lastStartedRequest: QueryRequest<T> | undefined;
    /** The most recently completed request of the query. */
    lastCompletedRequest: QueryRequest<T> | undefined;
}

export type Primitive = string | number | boolean | null | undefined | bigint | symbol;

export interface QueryValue<T> {
    /** The current value returned by the query. */
    value: T | undefined;
    /** Indicates if the query is currently fetching data. */
    isLoading: boolean;
    /** Error caught in the promise. */
    error: any | undefined;
    /** The most recently completed request of the query. */
    lastCompletedRequest: QueryRequest<T> | undefined;
}


/**
 * Dependencies for triggering a query. When one of the dependencies changes the query will be triggered.
 *
 * @param s - The current store state.
 * @returns An array of `Query<Store, any> | Effect<Store, any> | Primitive`.
 */
export type Dependencies<Store> = (s: Store) => (Query<Store, any> | Effect<Store, any, any> | Primitive)[];

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

/**
 * Global options for Leo Query.
 */
export interface GlobalOptions {
    /**
     * Global query options.
     */
    query?: GlobalQueryOptions;
    /**
     * A function that generates a v4 UUID. If no function is provided Leo Query will fallback to crypto.randomUUID. Browsers typically have access to crypto.randomUUID, so this option is not needed. 
     * React Native does not have access to crypto.randomUUID, so this option is usually required.
     */
    uuidv4?: () => string;
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
   * Promise that resolves when the store has been hydrated by the persist middleware. The query will wait until this promise 
   * resolves rather than triggering a new fetch.
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
   * Select multiple queries from the store. Handle async data concerns:
   *   - Fetch data for the query as needed
   *   - Leverage caching
   *   - Re-render component when query value updates
   *   - Trigger suspense when the query is loading
   *   - Consider dependencies
   * @param selector Select the query from the store.
   * @param opts Options
   */
  <R extends any[]>(selectors: {[K in keyof R]: ((state: T) => Query<T, R[K]>) | {selector: ((state: T) => Query<T, R[K]>), opts: UseBoundAsyncStoreOptions<R[K]>}}): R;
  /**
   * Select an effect from the store. Handle async data concerns:
   *   - Trigger suspense when the effect is loading
   *   - Consider dependencies
   * @param selector Select the effect from the store.
   * @param opts Options
   */
  <Args extends any[], R>(selector: (state: T) => Effect<T, Args, R>): () => Promise<R>
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
   * Select multiple queries from the store. Handle async data concerns:
   *   - Fetch data for the query as needed
   *   - Leverage caching
   *   - Re-render component when query value updates
   *   - Trigger suspense when the query is loading
   *   - Consider dependencies
   * @param selector Select the query from the store.
   */
  <R extends any[]>(selectors: {[K in keyof R]: ((state: T) => Query<T, R[K]>) | {selector: ((state: T) => Query<T, R[K]>), opts: UseBoundAsyncStoreOptions<R[K]>}}): {[K in keyof R]: QueryValue<R[K]>};
  /**
   * Select an effect from the store. Handle async data concerns:
   *   - Trigger suspense when the effect is loading
   *   - Consider dependencies
   * @param selector Select the effect from the store.
   */
  <Args extends any[], R>(selector: (state: T) => Effect<T, Args, R>): () => Promise<void>
};

export interface StoreProviderProps<T> {
  readonly children: ReactNode;
}

export interface StoreProviderPropsWithServerSideData<T, D> {
  readonly children: ReactNode;
  /**
   * Server side data to use when initializing the store. This data will be passed to the store's creation function.
   */
  readonly serverSideData: D;
}

export interface StoreHooks<T> {
  /**
   * Promise that resolves when the store has been hydrated by the persist middleware. Internal use only.
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
   * Whether the store has been hydrated by the persist middleware.
   */ 
  hasHydrated: boolean;
  /**
   * Promise that resolves when the store has been hydrated by the persist middware. Undefined if persist middleware is not used.
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
   * Hook to check if the store has been hydrated by the persist middleware.
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
   * Hook to check if the store has been hydrated by the persist middleware.
   */
  readonly useHasHydrated: () => boolean;
}

export interface RequestPayload {
  query?: Query<any, any>;
  effect?: Effect<any, any, any>;
  request: EffectRequest<any, any> | QueryRequest<any>;
}

export interface LeoQueryEventTarget {
  addEventListener(type: "success", listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean): void;
  addEventListener(type: "error", listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean): void;
  addEventListener(type: "settled", listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: "success", listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: "error", listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: "settled", listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean): void;
  __dispatchEvent(evt: CustomEvent<RequestPayload>): void;
}