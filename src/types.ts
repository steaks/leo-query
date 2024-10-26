import {StoreApi} from "zustand/vanilla";

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
    /** Function to access the Zustand store. */
    __store: () => StoreApi<State>;
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
}

type Primitive = string | number | boolean | null | undefined | bigint | symbol;

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

export interface QueryOptions {
    /** If set to `true`, the query will fetch data as needed. Default is `true`. */
    readonly lazy?: boolean;
    /** The delay (in ms) between query triggers. Default is 300ms. */
    readonly debounce?: number;
    /** Max number of retries or a function that overrides the default retry behavior. */
    readonly retry?: number | ((attempt: number, error: any) => boolean);
    /** A function that overrides the default retry delay behavior. */
    readonly retryDelay?: (attempt: number) => number;
}