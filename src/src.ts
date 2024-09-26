import {StoreApi, UseBoundStore} from "zustand";
import {Dependencies, Effect, Query, QueryValue} from "./types";

const isEffect = (v: any): v is Effect<any, any> =>
  v && (v as Effect<any, any>).__type === "Effect";

const isQuery = (v: any): v is Query<any, any> =>
  v && (v as Query<any, any>).__type === "Query"

const wait = (timeout?: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, timeout);
  });
};

/**
 * Bind queries and effects to the store so they can be triggered when dependencies change.
 * @param store
 */
const bind = <T extends object>(store: UseBoundStore<StoreApi<T>>) => {
  const init = store.getInitialState();
  Object
    .keys(init)
    .forEach(k => {
      const key = k as keyof T
      const v = init[key];
      if (isQuery(v)) {
        v.__key = key;
        v.__store = () => store;
      } else if (isEffect(v)) {
        v.__key = key;
        v.__store = () => store;
      }
    });
};

export const equals = (a: any, b: any): boolean => {
  let aValue;
  let bValue;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((v, i) => equals(v, b[i]));
  }
  if (isQuery(a)) {
    aValue = a.value
  } else if (isEffect(a)) {
    aValue = a.__valueCounter;
  } else {
    aValue = a;
  }
  if (isQuery(b)) {
    bValue = b.value
  } else if (isEffect(a)) {
    bValue = b.__valueCounter;
  } else {
    bValue = b;
  }
  return aValue === bValue
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
    __id: crypto.randomUUID(),
    __type: "Effect" as "Effect",
    __key: "NOT_SET_YET" as keyof Store,
    __valueCounter: 0,
    __triggers: [],
    __store: getStore,
    isLoading: false,
    trigger: async (...args: Args) => {
      const current = e.__store().getState()[e.__key] as Effect<Store, Args>;
      const promise = p.fn(...args);
      console.log("mark effect loading");
      e.__store().setState({
        [e.__key]: {
          ...current,
          __triggers: [...current.__triggers, promise],
          isLoading: true
        }
      } as Partial<Store>);
      setTimeout(async () => {
        await promise;
        const current = e.__store().getState()[e.__key] as Effect<Store, Args>;
        const fetches = current.__triggers.filter(f => f !== promise);
        e.__store().setState({
          [e.__key]: {
            ...current,
            __valueCounter: current.__valueCounter + 1,
            __triggers: fetches,
            isLoading: fetches.length > 0
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
  readonly options: QueryOptions;
}

const queryParams = <State, R>(args: any): QueryParams<State, R> => {
  const p = {
    fn: args[0] as () => Promise<R>,
    deps: args[1] || (() => []) as Dependencies<State>,
    options: args[2] || {} as QueryOptions
  };
  if (!p.fn || !p.deps) {
    throw new Error("Invalid arguments");
  }
  return p;
};

interface QueryOptions {
  readonly lazy?: boolean;
  readonly debounce?: number;
}

/**
 * Hook up an asynchronous query to Zustand. A query can be an HTTP request or simple promise. The promise will be
 * executed when a dependency changes or is manually triggered.
 *
 * @param fn - Function that executes the promise. The function name must match the key of the object tied to the store.
 * @param deps - Dependencies in the store that will trigger the promise.
 * @param options - Options for the query
 */
export function query<Store extends object, R>(fn: () => Promise<R>, deps?: Dependencies<Store>, options?: QueryOptions): Query<Store, R>;
export function query<Store extends object, R>(): Query<Store, R> {
  const p = queryParams<Store, R>(arguments);
  const getStore: () => StoreApi<Store> = () => { throw new Error("Store not set yet"); };
  const q = {
    __id: crypto.randomUUID(),
    __type: "Query" as "Query",
    __deps: p.deps,
    __key: "NOT_YET_SET" as keyof Store,
    __trigger: undefined as undefined | Promise<R>,
    __triggerStart: 0,
    __debounce: p.options.debounce !== undefined ? p.options.debounce : 300,
    __lazy: p.options.lazy !== undefined ? p.options.lazy : true,
    __needsLoad: true,
    __store: getStore,
    isLoading: false,
    value: undefined as unknown as R,
    error: undefined,
    trigger: async (): Promise<R> => {
      const state = q.__store().getState();
      const current = state[q.__key] as Query<Store, R>;
      const now = Date.now();
      if (current.__trigger && current.__triggerStart > now - current.__debounce) {
        return current.__trigger;
      }
      const queryDependencies = current.__deps(state).flatMap(v => {
        return isQuery(v) && v.__needsLoad ? [v.__trigger || v.trigger()] : [];
      });
      const promise = Promise.all(queryDependencies).then(p.fn);
      console.log("mark loading");
      q.__store().setState({
        [q.__key]: {
          ...current,
          __trigger: promise,
          __triggerStart: now,
          __needsLoad: false,
          isLoading: true
        }
      } as Partial<Store>);
      setTimeout(async () => {
        let value = undefined;
        let error = undefined;
        try {
          value = await promise;
        } catch (e) {
          error = e;
        }
        const next = q.__store().getState()[q.__key] as Query<Store, R>;
        if (next.__trigger !== promise) {
          return;
        }
        console.log("mark loaded");
        q.__store().setState({
          [q.__key]: {
            ...next,
            __trigger: undefined,
            __triggerStart: 0,
            __needsLoad: false,
            isLoading: false,
            value,
            error
          }
        } as Partial<Store>);
      });
      return promise;
    },
    markStale: () => {
      console.log("mark stale");
      const state = q.__store().getState();
      const current = state[q.__key] as Query<Store, R>;
      q.__store().setState({
        [q.__key]: {
          ...current,
          __needsLoad: true,
        }
      } as Partial<Store>);
    },
  };
  return q;
}

export interface UseBoundAsyncStoreOptions {
  /**
   * Trigger suspense when the query's dependencies are loading.
   */
  readonly followDeps?: boolean;

}

type QueryOrEffect<T> = Query<T, any> | Effect<T, any>
export type UseBoundAsyncStore<T> = {
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
  <R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions): R;
  /**
   * Select an effect from the store. Handle async data concerns:
   *   - Trigger suspense when the effect is loading
   *   - Consider dependencies
   * @param selector Select the effect from the store.
   * @param opts Options
   */
  <Args extends any[] = []>(selector: (state: T) => Effect<T, Args>, opts?: UseBoundAsyncStoreOptions): () => Promise<void>
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
   * @param opts Options
   */
    <R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions): QueryValue<R>;
  /**
   * Select an effect from the store. Handle async data concerns:
   *   - Trigger suspense when the effect is loading
   *   - Consider dependencies
   * @param selector Select the effect from the store.
   * @param opts Options
   */
    <Args extends any[] = []>(selector: (state: T) => Effect<T, Args>, opts?: UseBoundAsyncStoreOptions): () => Promise<void>
};

export const hook = <T extends object>(store: UseBoundStore<StoreApi<T>>): UseBoundAsyncStore<T> => {
  subscribe(store);
  function useBoundAsyncStore<R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions): R;
  function useBoundAsyncStore<Args extends any[] = []>(selector: (state: T) => Effect<T, Args>, opts?: UseBoundAsyncStoreOptions): (() => Promise<void>);
  function useBoundAsyncStore<R, Args extends any[] = []>(selector: (state: T) => Query<T, R> | Effect<T, Args>, opts?: UseBoundAsyncStoreOptions): R | (() => Promise<void>) {
    const theSelector = (state: T): [Query<T, R>, ...QueryOrEffect<T>[]] | [Effect<T, Args>, ...QueryOrEffect<T>[]] => {
      const value = selector(state);
      const _opts = opts || {};
      if (isQuery(value)) {
        const query = value as unknown as Query<T, R>;
        let deps = [] as QueryOrEffect<T>[];
        if (_opts.followDeps || _opts.followDeps === undefined) {
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
    };
    const value = store(theSelector);
    if (isQuery(value[0])) {
      return withSuspense(value as [Query<T, R>, ...QueryOrEffect<T>[]]);
    } else if (isEffect(value[0])) {
      return withSuspense(value as [Effect<T, Args>, ...QueryOrEffect<T>[]]);
    } else {
      throw new Error("Value must be Query or Effect");
    }
  }
  return useBoundAsyncStore;
};

export const withoutSuspenseHook = <T extends object>(store: UseBoundStore<StoreApi<T>>): UseBoundAsyncStoreWithoutSuspense<T> => {
  subscribe(store);
  function useBoundAsyncStoreWithoutSuspense<R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions): QueryValue<R>;
  function useBoundAsyncStoreWithoutSuspense<Args extends any[] = []>(selector: (state: T) => Effect<T, Args>, opts?: UseBoundAsyncStoreOptions): (() => Promise<void>);
  function useBoundAsyncStoreWithoutSuspense<R, Args extends any[] = []>(selector: (state: T) => Query<T, R> | Effect<T, Args>, opts?: UseBoundAsyncStoreOptions): QueryValue<R> | (() => Promise<void>) {
    const theSelector = (state: T): [Query<T, R>, ...QueryOrEffect<T>[]] | [Effect<T, Args>, ...QueryOrEffect<T>[]] => {
      const value = selector(state);
      const _opts = opts || {};
      if (isQuery(value)) {
        const query = value as unknown as Query<T, R>;
        let deps = [] as QueryOrEffect<T>[];
        if (_opts.followDeps || _opts.followDeps === undefined) {
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
    };
    const value = store(theSelector);
    if (isQuery(value[0])) {
      const v = value[0] as Query<T, R>;
      try {
        withSuspense(value as [Query<T, R>, ...QueryOrEffect<T>[]]);
        return {
          value: v.value,
          isLoading: v.isLoading
        }
      } catch (e) {
        return {
          value: v.value,
          isLoading: true
        }
      }
    } else if (isEffect(value[0])) {
      try {
        withSuspense(value as [Effect<T, Args>, ...QueryOrEffect<T>[]]);
        return value[0].trigger;
      } catch (e) {
        return value[0].trigger;
      }
    } else {
      throw new Error("Value must be Query or Effect");
    }
  }
  return useBoundAsyncStoreWithoutSuspense;
};

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
          if (dependencyChange && current.__lazy) {
            console.log("will mark stale");
            return current.markStale();
          } else if (dependencyChange && !current.__lazy) {
            return current.trigger();
          }
        }
      });
  });
};

/**
 * Hook up your query so it will automatically load when your component needs it. And leverage <Suspense> when the
 * query is loading.
 * @param query
 */
function withSuspense<T>(query: [Query<any, T>, ...QueryOrEffect<any>[]]): T;
/**
 * Hook up your effect(s) so it will trigger <Suspense> when the effect is loading.
 * @param effect
 */
function withSuspense<Args extends any[] = []>(effect: [Effect<any, Args>, ...QueryOrEffect<any>[]]): (() => Promise<void>);
function withSuspense<T, Args extends any[] = []>(values: [Query<any, T>, ...QueryOrEffect<any>[]] | [Effect<any, Args>, ...QueryOrEffect<any>[]]): T | ((...args: Args) => Promise<void>) {
  if (isQuery(values[0])) {
    const v = values[0];
    const needsTrigger = v.__needsLoad || v.isLoading;
    let queryTrigger = [] as Promise<T>[];
    if (needsTrigger && v.__trigger) {
      queryTrigger = [v.__trigger];
    }
    if (needsTrigger && !v.__trigger) {
      queryTrigger = [wait().then(v.trigger)];
    }
    const depTriggers = values.slice(1).flatMap(vv => {
      if (isQuery(vv)) {
        return vv.__trigger ? [vv.__trigger] : [];
      } else if (isEffect(vv)) {
        return vv.__triggers;
      } else {
        return [];
      }
    });
    const allTriggers = [...queryTrigger, ...depTriggers];
    if (allTriggers.length === 0) {
      return v.value!;
    } else {
      throw Promise.all(allTriggers);
    }
  } else {
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
  }
}