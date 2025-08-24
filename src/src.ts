import {StoreApi, UseBoundStore} from "zustand";
import {
  Dependencies, 
  Effect, 
  Query, 
  QueryOptions, 
  QueryValue, 
  GlobalOptions, 
  SetValueOptions, 
  UseBoundAsyncStoreWithoutSuspense,
  UseBoundAsyncStoreWithSuspense,
  UseBoundAsyncStoreOptions,
  SuccessPayload,
  ErrorPayload,
  SettledPayload,
} from "./types";
import {wait, generateUUID} from "./util";
import {setupRetries} from "./retry";
import {useShallow} from "zustand/react/shallow";
import {events} from "./events";
import {useEffect} from "react";

const mountedQueriesTracker = {} as Record<string, Set<string>>;

const registerQuery = (queryId: string) => {
  mountedQueriesTracker[queryId] = new Set<string>();
};

const mountQuery = (hookId: string, queryId: string) => {
  mountedQueriesTracker[queryId].add(hookId); 
};

const unmountQueries = (hookId: string) => {
  Object
    .keys(mountedQueriesTracker)
    .forEach(queryId => { mountedQueriesTracker[queryId].delete(hookId); });
};

const isQueryMounted = (queryId: string) => 
  mountedQueriesTracker[queryId].size > 0;


export const isEffect = (v: any): v is Effect<any, any> =>
  v && (v as Effect<any, any>).__type === "Effect";

export const isQuery = (v: any): v is Query<any, any> =>
  v && (v as Query<any, any>).__type === "Query"

let globalOptions: GlobalOptions = {};

export const configure = (options: GlobalOptions) => {
  globalOptions = options;
};

/**
 * Bind queries and effects to the store so they can be triggered when dependencies change.
 * @param store
 */
const bind = <T extends object>(store: UseBoundStore<StoreApi<T>>) => {
  const state = store.getState();
  const init = store.getInitialState();
  Object
    .keys(init)
    .forEach(k => {
      const key = k as keyof T
      const v = state[key];
      const initV = init[key];
      if (isQuery(v) && v.key === "NOT_YET_SET") {
        v.key = key;
        v.__store = () => store;
      } else if (isEffect(v) && v.key === "NOT_SET_YET") {
        v.key = key;
        v.__store = () => store;
      }
      if (v !== initV && isQuery(initV) && initV.key === "NOT_YET_SET") {
        initV.key = key;
        initV.__store = () => store;
      } else if (v !== initV && isEffect(initV) && initV.key === "NOT_SET_YET") {
        initV.key = key;
        initV.__store = () => store;
      }
    });
};

export const equals = (a: any, b: any): boolean => {
  let aValue;
  let bValue;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => equals(v, b[i]));
  }
  if (isQuery(a)) {
    aValue = a.value;
  } else if (isEffect(a)) {
    aValue = a.__valueCounter;
  } else {
    aValue = a;
  }
  if (isQuery(b)) {
    bValue = b.value
  } else if (isEffect(b)) {
    bValue = b.__valueCounter;
  } else {
    bValue = b;
  }
  return aValue === bValue;
};

interface EffectParams<Args extends any[] = []> {
  fn: (...args: Args) => Promise<void>;
}

const effectParams = <Args extends any[] = []>(args: any): EffectParams<Args> => {
  const p = {
    fn: args[0] as (...args: Args) => Promise<void>,
  };
  if (!p.fn) {
    throw new Error("Invalid arguments");
  }
  return p;
};

/**
 * Hook up an asynchronous effect to Zustand. An effect may be a POST http requests that updates your database or a
 * simple promise. The promise will be executed when a dependency changes or is manually triggered.
 * @param fn - Function that executes the promise. The function name must match the key of the object tied to the store.
 */
export function effect<Store extends object, Args extends any[] = []>(fn: (...args: Args) => Promise<void>): Effect<Store, Args>;
export function effect<Store extends object, Args extends any[] = []>(): Effect<Store, Args> {
  const p = effectParams<Args>(arguments);
  const getStore: () => StoreApi<Store> = () => { throw new Error("Store not set yet"); };
  const e = {
    __id: generateUUID(globalOptions),
    __type: "Effect" as "Effect",
    __valueCounter: 0,
    __triggers: [],
    __store: getStore,
    key: "NOT_SET_YET" as keyof Store,
    isLoading: false,
    error: undefined,
    errors: [],
    trigger: async (...args: Args) => {
      const current = e.__store().getState()[e.key] as Effect<Store, Args>;
      const promise = p.fn(...args);
      e.__store().setState({
        [e.key]: {
          ...current,
          __triggers: [...current.__triggers, promise],
          isLoading: true
        }
      } as Partial<Store>);
      setTimeout(async () => {
        let error;
        try {
          await promise;
          events.__dispatchEvent(new CustomEvent<SuccessPayload>("success", {detail: {effect: e}}));
        } catch (ee) {
          error = ee;
          events.__dispatchEvent(new CustomEvent<ErrorPayload>("error", {detail: {effect: e, error}}));
        } finally {
          events.__dispatchEvent(new CustomEvent<SettledPayload>("settled", {detail: {effect: e, error}}));
        }
        const current = e.__store().getState()[e.key] as Effect<Store, Args>;
        const fetches = current.__triggers.filter(f => f !== promise);
        e.__store().setState({
          [e.key]: {
            ...current,
            __valueCounter: current.__valueCounter + 1,
            __triggers: fetches,
            isLoading: fetches.length > 0,
            error,
            errors: [...current.errors, error],
          }
        } as Partial<Store>);
      });
      return promise;
    }
  };
  return e;
}

interface QueryParams<State, R> {
  readonly fn: () => Promise<R>;
  readonly deps: Dependencies<State>;
  readonly options: QueryOptions<R>;
}

const queryParams = <State, R>(args: any): QueryParams<State, R> => {
  const p = {
    fn: args[0] as () => Promise<R>,
    deps: args[1] || (() => []) as Dependencies<State>,
    options: {...globalOptions.query, ...args[2]} as QueryOptions<R>
  };
  if (!p.fn || !p.deps) {
    throw new Error("Invalid arguments");
  }
  return p;
};

const setupStaleTimeout = <Store extends object, R>(query: Query<Store, R>): number | undefined => {
  clearTimeout(query.__staleTimeout);
  
  if (query.__staleTime !== undefined) {
    return setTimeout(() => {
      query.markStale();
    }, query.__staleTime) as unknown as number;
  }

  return undefined;
};

export const setSync = <Store extends object, R>(query: Query<Store, R>, value?: R, error?: any, options: SetValueOptions<Store, R> = {}): Query<Store, R> => {
  if (!query.isLoading && !query.error && equals(query.value, value)) {
    return query;
  }
  if (options.__isInitialValue && query.__isInitialized) {
    return query;
  }
  if (options.__timestamp && options.__timestamp < query.__valueTimestamp) {
    return query;
  }
  const staleTimeout = setupStaleTimeout(query);
  const next = {
    ...query,
    __isInitialized: true,
    __trigger: undefined,
    __triggerStart: 0,
    __initialPromise: undefined,
    __needsLoad: false,
    __staleTimeout: staleTimeout,
    __valueTimestamp: Date.now(),
    isLoading: false,
    value: error === undefined ? value : undefined,
    error
  };

  if (options.__updateStore || options.__updateStore === undefined) {
    query.__store().setState({
      [query.key]: next
    } as Partial<Store>);
  }

  return next;
};

/**
 * Hook up an asynchronous query to Zustand. A query can be an HTTP request or simple promise. The promise will be
 * executed when a dependency changes or is manually triggered.
 *
 * @param fn - Function that executes the promise. The function name must match the key of the object tied to the store.
 * @param deps - Dependencies in the store that will trigger the promise.
 * @param options - Options for the query
 */
export function query<Store extends object, R>(fn: () => Promise<R>, deps?: Dependencies<Store>, options?: QueryOptions<R>): Query<Store, R>;
export function query<Store extends object, R>(): Query<Store, R> {
  const p = queryParams<Store, R>(arguments);
  const getStore: () => StoreApi<Store> = () => { throw new Error("Store not set yet"); };
  const q = {
    __id: generateUUID(globalOptions),
    __type: "Query" as "Query",
    __deps: p.deps,
    __trigger: undefined as undefined | Promise<R>,
    __triggerStart: 0,
    __valueTimestamp: p.options.initialValue === undefined ? 0 : Date.now(),
    __initialPromise: undefined as undefined | Promise<R>,
    __debounce: p.options.debounce !== undefined ? p.options.debounce : 300,
    __lazy: p.options.lazy !== undefined ? p.options.lazy : true,
    __retry: p.options.retry,
    __retryDelay: p.options.retryDelay,
    __needsLoad: p.options.initialValue === undefined,
    __store: getStore,
    __staleTime: p.options.staleTime,
    __staleTimeout: undefined as number | undefined,
    __isInitialized: p.options.initialValue !== undefined,
    key: "NOT_YET_SET" as keyof Store,
    isLoading: false,
    value: p.options.initialValue as unknown as R,
    error: undefined,
    trigger: async (): Promise<R> => {
      const state = q.__store().getState();
      const current = state[q.key] as Query<Store, R>;
      const now = Date.now();
      if (current.__trigger && current.__triggerStart > now - current.__debounce) {
        return current.__trigger;
      }
      const queryDependencies = current.__deps(state).flatMap(v => {
        return isQuery(v) && v.value === undefined ? [v.__trigger || v.trigger()] : [];
      });
      const initialPromise = Promise.all(queryDependencies).then(p.fn);
      const promise = setupRetries(p.fn, initialPromise, q);
      q.__store().setState({
        [q.key]: {
          ...current,
          __trigger: promise,
          __triggerStart: now,
          __needsLoad: false,
          __initialPromise: initialPromise,
          __isInitialized: true,
          isLoading: true
        }
      } as Partial<Store>);
      setTimeout(async () => {
        let value = undefined;
        let error = undefined;
        try {
          value = await promise;
          events.__dispatchEvent(new CustomEvent<SuccessPayload>("success", {detail: {query: q}}));
        } catch (e) {
          error = e;
          events.__dispatchEvent(new CustomEvent<ErrorPayload>("error", {detail: {query: q, error}}));
        } finally {
          events.__dispatchEvent(new CustomEvent<SettledPayload>("settled", {detail: {query: q, error}}));
        }
        const next = q.__store().getState()[q.key] as Query<Store, R>;
        if (next.__trigger !== promise) {
          return;
        }

        setSync(next, value, error);
      });
      return promise;
    },
    markStale: () => {
      const state = q.__store().getState();
      const current = state[q.key] as Query<Store, R>;
      const staleTimeout = clearTimeout(current.__staleTimeout);

      q.__store().setState({
        [q.key]: {
          ...current,
          __needsLoad: true,
          __staleTimeout: staleTimeout,
        }
      } as Partial<Store>);
    },
    setValue: (value: R): Query<Store, R> => 
      setSync(q, value, /*error*/undefined),
    withValue: (value: R): Query<Store, R> => 
      setSync(q, value, /*error*/undefined, {__updateStore: false})
  };
  registerQuery(q.__id);
  return q;
}

type QueryOrEffect<T> = Query<T, any> | Effect<T, any>

const select = <T, R, Args extends any[]>(selector: (s: T) => QueryOrEffect<T>) => (state: T): ([Query<T, R>, ...QueryOrEffect<T>[]] | [Effect<T, Args>, ...QueryOrEffect<T>[]]) => {
  const value = selector(state);
  if (isQuery(value)) {
    const query = value as unknown as Query<T, any>;
    let deps = [] as QueryOrEffect<T>[];
    if (deps || deps === undefined) {
      const state = query.__store().getState();
      deps = query.__deps(state).flatMap(v => {
        return isQuery(v) || isEffect(v) ? [v] : [];
      }) as (Query<T, any> | Effect<T, any>)[];
    }
    return [query, ...deps];
  } else if (isEffect(value)) {
    const effect = value as unknown as Effect<T, any>;
    return [effect];
  } else {
    throw new Error("Must return Query or Effect");
  }
}

function useTrackMountedQueries<T extends object, R extends any[]>(selectors: { [K in keyof R]: ((state: T) => Query<T, R[K]>) | {selector: ((state: T) => Query<T, R[K]>), opts: UseBoundAsyncStoreOptions<R[K]>} }, store: UseBoundStore<StoreApi<T>>): void;
function useTrackMountedQueries<T extends object, R>(selector: (state: T) => Query<T, R>, store: UseBoundStore<StoreApi<T>>): void;
function useTrackMountedQueries<T extends object, Args extends any[] = []>(selector: (state: T) => Effect<T, Args>, store: UseBoundStore<StoreApi<T>>): void;
function useTrackMountedQueries<T extends object>(selector: any, store: UseBoundStore<StoreApi<T>>): void {
  useEffect(() => {
    const hookId = generateUUID(globalOptions);
    const state = store.getState();
    if (Array.isArray(selector)) {
      selector
        .map(s => typeof s === "function" ? s : s.selector)
        .map(s => s(state))
        .forEach((q: Query<any, any>) => { mountQuery(hookId, q.__id); });
    } else {
      const query = selector(state);
      if (isQuery(query)) {
        mountQuery(hookId, query.__id);
      }
    }
    return () => { unmountQueries(hookId); };
  }, []);
}

/**
 * React hook to retrieve queries or effects from your store. This hook will automatically trigger Suspense when a query is loading.
 * @param store - Your Zustand store
 */
const withSuspenseHook = <T extends object>(store: UseBoundStore<StoreApi<T>>): UseBoundAsyncStoreWithSuspense<T> => {
  subscribe(store);
  function useBoundAsyncStore<R extends any[]>(selectors: { [K in keyof R]: ((state: T) => Query<T, R[K]>) | {selector: ((state: T) => Query<T, R[K]>), opts: UseBoundAsyncStoreOptions<R[K]>} }): R;
  function useBoundAsyncStore<R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions<R>): R;
  function useBoundAsyncStore<Args extends any[] = []>(selector: (state: T) => Effect<T, Args>): (() => Promise<void>); 
  function useBoundAsyncStore(s: any, o?: any): any {
    useTrackMountedQueries(s, store);
    function single<R, Args extends any[] = []>(selector: (state: T) => Query<T, R> | Effect<T, Args>, opts?: UseBoundAsyncStoreOptions<R>): R | (() => Promise<void>) {
      const _opts = opts || {};
      const theSelector = select(selector);
      const value = store(useShallow(theSelector));
      if (isQuery(value[0])) {
        const v = withSuspense(value as [Query<T, R>, ...QueryOrEffect<T>[]], _opts as UseBoundAsyncStoreOptions<R>);
        if (v.error) {
          throw v.error;
        } else {
          return v.value!;
        }
      } else if (isEffect(value[0])) {
        return withSuspense(value as [Effect<T, Args>, ...QueryOrEffect<T>[]]);
      } else {
        throw new Error("Value must be Query or Effect");
      }
    }
    function multiple<R extends any[]>(selectors: { [K in keyof R]: ((state: T) => Query<T, R[K]>) | {selector: ((state: T) => Query<T, R[K]>), opts: UseBoundAsyncStoreOptions<R[K]>} }): R {
      const results = selectors.map(selector => {
        try {
          const value = typeof selector === "function" ? single(selector) : single(selector.selector, selector.opts);
          return {value};
        } catch (error) {
          return {error};
        }
      });
      const errors = results.filter(v => v.error).map(v => v.error!);
      if (errors.length > 0 && errors.every(e => e instanceof Promise)) {
        throw Promise.all(errors);
      }
      if (errors.length > 0) {
        throw errors.find(e => !(e instanceof Promise))!;
      }
      return results.map(v => v.value) as R;
    }
    return Array.isArray(s) ? multiple(s) : single(s, o);
  }
  return useBoundAsyncStore;
};

/**
 * React hook to retrieve queries or effects from your store. This hook will return information about the
 * state of the query (e.g. isLoading).
 * @param store - Your Zustand store
 */
const withoutSuspenseHook = <T extends object>(store: UseBoundStore<StoreApi<T>>): UseBoundAsyncStoreWithoutSuspense<T> => {
  subscribe(store);
  function useBoundAsyncStoreWithoutSuspense<R extends any[]>(selectors: {[K in keyof R]: ((state: T) => Query<T, R[K]>) | {selector: ((state: T) => Query<T, R[K]>), opts: UseBoundAsyncStoreOptions<R[K]>}}): {[K in keyof R]: QueryValue<R[K]>};
  function useBoundAsyncStoreWithoutSuspense<R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions<R>): QueryValue<R>;
  function useBoundAsyncStoreWithoutSuspense<Args extends any[] = []>(selector: (state: T) => Effect<T, Args>): (() => Promise<void>);
  function useBoundAsyncStoreWithoutSuspense(s: any, o?: any): any {
    useTrackMountedQueries(s, store);
    function single<R, Args extends any[] = []>(selector: (state: T) => Query<T, R> | Effect<T, Args>, opts?: UseBoundAsyncStoreOptions<R>): QueryValue<R> | (() => Promise<void>) {
      const _opts = opts || {};
      const theSelector = select(selector);
      const value = store(useShallow(theSelector));
      if (isQuery(value[0])) {
        const v = value[0] as Query<T, R>;
        try {
          return withSuspense(value as [Query<T, R>, ...QueryOrEffect<T>[]], _opts);
        } catch (e) {
          return {
            value: v.value,
            isLoading: true,
            error: v.error
          }
        }
      } else if (isEffect(value[0])) {
        try {
          return withSuspense(value as [Effect<T, Args>, ...QueryOrEffect<T>[]]);
        } catch (e) {
          return value[0].trigger;
        }
      } else {
        throw new Error("Value must be Query or Effect");
      }
    }
    function multiple<R extends any[]>(selectors: {[K in keyof R]: ((state: T) => Query<T, R[K]>) | {selector: ((state: T) => Query<T, R[K]>), opts: UseBoundAsyncStoreOptions<R[K]>}}): {[K in keyof R]: QueryValue<R[K]>} {
      return selectors.map(selector =>
        typeof selector === "function" ? single(selector) : single(selector.selector, selector.opts)
      ) as { [K in keyof R]: QueryValue<R[K]> };
    }
    return Array.isArray(s) ? multiple(s) : single(s, o);
  }
  return useBoundAsyncStoreWithoutSuspense;
};

export function hook<T extends object>(store: UseBoundStore<StoreApi<T>>): UseBoundAsyncStoreWithSuspense<T>;
export function hook<T extends object>(store: UseBoundStore<StoreApi<T>>, suspense: false): UseBoundAsyncStoreWithoutSuspense<T>;
export function hook<T extends object>(store: UseBoundStore<StoreApi<T>>, suspense: true): UseBoundAsyncStoreWithSuspense<T>;
export function hook<T extends object>(store: UseBoundStore<StoreApi<T>>, suspense?: boolean) {
  return suspense === undefined || suspense ? withSuspenseHook(store) : withoutSuspenseHook(store);
}

const subscriptions = new Set<UseBoundStore<StoreApi<any>>>();
/**
 * Subscribe your store to leo's listener so queries and effects will be triggered when dependencies change.
 * @param store
 */
const subscribe = <T extends object>(store: UseBoundStore<StoreApi<T>>) => {
  if (subscriptions.has(store)) {
    return;
  }
  subscriptions.add(store);
  bind(store);
  store.subscribe((state, prevState) => {
    Object
      .keys(state)
      .forEach(k => {
        const key = k as keyof T
        if (isQuery(state[key])) {
          const current = state[key] as Query<T, any>;
          const prev = prevState[key] as Query<T, any>;
          const currDeps = current.__deps(state);
          const prevDeps = prev.__deps(prevState);
          const dependencyChange = !equals(currDeps, prevDeps);
          const isMounted = isQueryMounted(current.__id);
          if (dependencyChange && isMounted) {
            return current.trigger();
          } else if (dependencyChange && !current.__lazy) {
            return current.trigger();
          } else if (dependencyChange && current.__lazy) {
            return current.markStale();
          }
        }
      });
  });
};

const setInitialValue = <T>(query: Query<any, T>, value: T) => {
  const state = query.__store().getState();
  const current = state[query.key] as Query<any, T>;
  setSync(current, value, /*error*/undefined, {__isInitialValue: true});
};

const setValue = <T>(query: Query<any, T>, value: T, timestamp: number) => {
  const state = query.__store().getState();
  const current = state[query.key] as Query<any, T>;
  setSync(current, value, /*error*/undefined, {__timestamp: timestamp});
};

const needsInitialValue = <T>(query: Query<any, T>, opts: UseBoundAsyncStoreOptions<T>) =>
  !query.__isInitialized && opts.initialValue !== undefined;

const needsValue = <T>(query: Query<any, T>, opts: UseBoundAsyncStoreOptions<T>) =>
  opts.value !== undefined && query.__valueTimestamp < opts.timestamp!;

const assertOptions = <T>(opts: UseBoundAsyncStoreOptions<T>) => {
  if (opts.value !== undefined && !opts.timestamp) {
    throw new Error("Timestamp must be provided if value is provided");
  }
  if (opts.timestamp && opts.value === undefined) {
    throw new Error("Value must be provided if timestamp is provided");
  }
};

const withSuspenseQuery = <T>(values: [Query<any, T>, ...QueryOrEffect<any>[]], opts: UseBoundAsyncStoreOptions<T>): QueryValue<T> => {
  assertOptions(opts);
  const v = values[0] as Query<any, T>;
  const needsTrigger = v.__needsLoad || v.isLoading;
  const _needsInitialValue = needsInitialValue(v, opts);
  const _needsValue = needsValue(v, opts);
  let queryTrigger: undefined | Promise<T>[] = undefined;
  let depTriggers: undefined | Promise<any>[] = undefined;

  if (_needsInitialValue) {
    wait().then(() => { setInitialValue(v, opts.initialValue!); });
    queryTrigger = [];
  } else if (_needsValue) {
    wait().then(() => { setValue(v, opts.value!, opts.timestamp!); });
    queryTrigger = [];
  } else if (needsTrigger && opts.hydration) {
    queryTrigger = [opts.hydration as Promise<T>];
  } else if (needsTrigger && v.__trigger) {
    queryTrigger = [v.__trigger];
  } else if (needsTrigger) {
    queryTrigger = [wait().then(v.trigger)];
  } else {
    queryTrigger = [];
  }

  if (_needsInitialValue) {
    depTriggers = [];
  } else if (_needsValue) {
    depTriggers = [];
  } else if (opts.hydration) {
    depTriggers = [];
  } else {
    depTriggers = values.slice(1).flatMap(vv => {
      if (isQuery(vv)) {
        return vv.__trigger ? [vv.__trigger] : [];
      } else if (isEffect(vv)) {
        return vv.__triggers;
      } else {
        return [];
      }
    });
  }
  const allTriggers = [...queryTrigger, ...depTriggers];
  if (_needsInitialValue) {
    return {value: opts.initialValue!, error: undefined, isLoading: false};
  } else if (_needsValue) {
    return {value: opts.value!, error: undefined, isLoading: false};
  } else if (allTriggers.length === 0) {
    return {value: v.value, error: v.error, isLoading: false};
  } else {
    throw Promise.all(allTriggers);
  }
};

const withSuspenseEffect = <Args extends any[]>(values: [Effect<any, Args>, ...QueryOrEffect<any>[]]): (() => Promise<void>) => {
  const v = values[0];
  const effectTriggers = v.__triggers;
  const depTriggers = values.slice(1).flatMap(vv => {
    if (isQuery(vv)) {
      return vv.__trigger ? [vv.__trigger] : [];
    } else if (isEffect(vv)) {
      return vv.__triggers;
    } else {
      return [];
    }
  });
  const allTriggers = [...effectTriggers, ...depTriggers];
  if (allTriggers.length === 0) {
    return v.trigger;
  } else {
    throw Promise.all(allTriggers);
  }
};

/**
 * Hook up your query so it will automatically load when your component needs it. And leverage <Suspense> when the
 * query is loading.
 * @param query
 */
function withSuspense<T>(query: [Query<any, T>, ...QueryOrEffect<any>[]], opts: UseBoundAsyncStoreOptions<T>): QueryValue<T>;
/**
 * Hook up your effect(s) so it will trigger <Suspense> when the effect is loading.
 * @param effect
 */
function withSuspense<Args extends any[] = []>(effect: [Effect<any, Args>, ...QueryOrEffect<any>[]]): (() => Promise<void>);
function withSuspense<T, Args extends any[] = []>(values: [Query<any, T>, ...QueryOrEffect<any>[]] | [Effect<any, Args>, ...QueryOrEffect<any>[]], opts?: UseBoundAsyncStoreOptions<T>): QueryValue<T> | ((...args: Args) => Promise<void>) {
  if (isQuery(values[0])) {
    return withSuspenseQuery(values as [Query<any, T>, ...QueryOrEffect<any>[]], opts!);
  } else if (isEffect(values[0])) {
    return withSuspenseEffect(values as [Effect<any, Args>, ...QueryOrEffect<any>[]]);
  } else {
    throw new Error("Value must be Query or Effect");
  }
}