import {StoreApi, UseBoundStore} from "zustand";
import {Dependencies, Effect, Query} from "./types";

const isEffect = (v: any): v is Effect<any> =>
  v && (v as Effect<any>).__type === "Effect";

const isQuery = (v: any): v is Query<any, any> =>
  v && (v as Query<any, any>).__type === "Query"

const validate = <T extends object>(store: UseBoundStore<StoreApi<T>>) => {
  const init = store.getInitialState();
  Object
    .keys(init)
    .forEach(k => {
      const key = k as keyof T
      const v = init[key];
      if (isQuery(v)) {
        if (!(v.__key in init)) {
          throw new Error(`Query ${v.__key.toString()} not found in store.`);
        }
      } else if (isEffect(v)) {
        if (!(v.__key in init)) {
          throw new Error(`Effect ${v.__key.toString()} not found in store.`);
        }
      }
    });
};

export const equals = (a: any, b: any): boolean => {
  let aValue;
  let bValue;
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

interface EffectParams<State> {
  store: StoreApi<State>;
  key: keyof State
  fn: () => Promise<void>;
  deps: Dependencies<State>;
}

const effectParams0 = <State>(args: any): EffectParams<State> => {
  const p = {
    store: args[0] as StoreApi<State>,
    key: args[1].name as keyof State,
    fn: args[1] as () => Promise<void>,
    deps: args[2] as Dependencies<State>
  };
  if (!p.key || !p.fn || !p.deps) {
    throw new Error("Invalid arguments");
  }
  return p;
};

const effectParams1 = <State>(args: any): EffectParams<State> => {
  const p = {
    store: args[0] as StoreApi<State>,
    key: args[1] as keyof State,
    fn: args[2] as () => Promise<void>,
    deps: args[3] as Dependencies<State>
  };
  if (!p.key || !p.fn || !p.deps) {
    throw new Error("Invalid arguments");
  }
  return p;
};

/**
 * Hook up an asynchronous effect to Zustand. An effect may be a POST http requests that updates your database or a
 * simple promise. The promise will be executed when a dependency changes or is manually triggered.
 * @param store - Store that the query will be hooked up to.
 * @param fn - Function that executes the promise. The function name must match the key of the object tied to the store.
 * @param deps - Dependencies in the store that will trigger the promise.
 */
export function effect<Store extends object>(store: StoreApi<Store>, fn: () => Promise<void>, deps: Dependencies<Store>): Effect<Store>;
/**
 * Hook up an asynchronous effect to Zustand. An effect may be a POST http requests that updates your database or a
 * simple promise. The promise will be executed when a dependency changes or is manually triggered.
 * @param store - Store that the query will be hooked up to.
 * @param key - Key of the store object that this query will be hooked up to.
 * @param fn - Function that executes the promise. The function name must match the key of the object tied to the store.
 * @param deps - Dependencies in the store that will trigger the promise.
 */
export function effect<Store extends object>(store: StoreApi<Store>, key: keyof Store, fn: () => Promise<void>, deps: Dependencies<Store>): Effect<Store>;
export function effect<Store extends object>(): Effect<Store> {
  const p = typeof arguments[1] === "function" ? effectParams0<Store>(arguments) : effectParams1<Store>(arguments);
  return {
    __id: crypto.randomUUID(),
    __type: "Effect" as "Effect",
    __deps: p.deps,
    __key: p.key,
    __valueCounter: 0,
    __triggers: [],
    isLoading: false,
    trigger: async () => {
      const current = p.store.getState()[p.key] as Effect<Store>;
      const promise = p.fn();
      p.store.setState({
        [p.key]: {
          ...current,
          __triggers: [...current.__triggers, promise],
          isLoading: true
        }
      } as Partial<Store>);
      setTimeout(async () => {
        await promise;
        const current = p.store.getState()[p.key] as Effect<Store>;
        const fetches = current.__triggers.filter(f => f !== promise);
        p.store.setState({
          [p.key]: {
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
}

interface QueryParams<State, R> {
  store: StoreApi<State>;
  key: keyof State
  fn: () => Promise<R>;
  deps: Dependencies<State>;
}

const queryParams0 = <State, R>(args: any): QueryParams<State, R> => {
  const p = {
    store: args[0] as StoreApi<State>,
    key: args[1].name as keyof State,
    fn: args[1] as () => Promise<R>,
    deps: args[2] as Dependencies<State>
  };
  if (!p.key || !p.fn || !p.deps) {
    throw new Error("Invalid arguments");
  }
  return p;
};

const queryParams1 = <State, R>(args: any): QueryParams<State, R> => {
  const p = {
    store: args[0] as StoreApi<State>,
    key: args[1] as keyof State,
    fn: args[2] as () => Promise<R>,
    deps: args[3] as Dependencies<State>
  };
  if (!p.key || !p.fn || !p.deps) {
    throw new Error("Invalid arguments");
  }
  return p;
};

/**
 * Hook up an asynchronous query to Zustand. A query can be an HTTP request or simple promise. The promise will be
 * executed when a dependency changes or is manually triggered.
 *
 * @param store - Store that the query will be hooked up to.
 * @param fn - Function that executes the promise. The function name must match the key of the object tied to the store.
 * @param deps - Dependencies in the store that will trigger the promise.
 */
export function query<Store extends object, R>(store: StoreApi<Store>, fn: () => Promise<R>, deps: Dependencies<Store>): Query<Store, R>;
/**
 * Hook up an asynchronous query to Zustand. A query can be an HTTP request or simple promise. The promise will be
 * executed when a dependency changes or is manually triggered.
 *
 * @param store - Store that the query will be hooked up to.
 * @param key - Key of the store object that this query will be hooked up to.
 * @param fn - Function that executes the promise.
 * @param deps - Dependencies in the store that will trigger the promise.
 */
export function query<Store extends object, R>(store: StoreApi<Store>, key: keyof Store, fn: () => Promise<R>, deps: Dependencies<Store>): Query<Store, R>;
export function query<Store extends object, R>(): Query<Store, R> {
  const p = typeof arguments[1] === "function" ? queryParams0<Store, R>(arguments) : queryParams1<Store, R>(arguments);
  return {
    __id: crypto.randomUUID(),
    __type: "Query" as "Query",
    __deps: p.deps,
    __key: p.key,
    __trigger: undefined as undefined | Promise<R>,
    __triggerStart: 0,
    __debounce: 300,
    isLoading: false,
    trigger: async (): Promise<R> => {
      const state = p.store.getState();
      const current = state[p.key] as Query<Store, R>;
      const now = Date.now();
      if (current.__trigger && current.__triggerStart > now - current.__debounce) {
        return current.__trigger;
      }
      const queryDependencies = current.__deps.flatMap(k => {
        const v = state[k];
        return isQuery(v) && v.value === undefined ? [v.__trigger || v.trigger()] : [];
      });
      const promise = Promise.all(queryDependencies).then(p.fn);
      p.store.setState({
        [p.key]: {
          ...current,
          __trigger: promise,
          __triggerStart: now,
          isLoading: true
        }
      } as Partial<Store>);
      setTimeout(async () => {
        const result = await promise;
        const current = p.store.getState()[p.key] as Query<Store, R>;
        if (current.__trigger !== promise) {
          return;
        }
        p.store.setState({
          [p.key]: {
            ...current,
            __trigger: undefined,
            __triggerStart: 0,
            isLoading: false,
            value: result
          }
        } as Partial<Store>);
      });
      return promise;
    },
    value: undefined as unknown as R
  };
}

export interface UseBoundAsyncStoreOptions {
  /**
   * Trigger suspense when the query's dependencies are loading.
   */
  readonly followDeps?: boolean;

}

type QueryOrEffect<T> = Query<T, any> | Effect<T>
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
  (selector: (state: T) => Effect<T>, opts?: UseBoundAsyncStoreOptions): () => Promise<void>
};

/**
 * Subscribe your store to leo's listener so queries and effects will be triggered when dependencies change.
 * @param store
 */
export const subscribe = <T extends object>(store: UseBoundStore<StoreApi<T>>): UseBoundAsyncStore<T> => {
  validate(store);
  store.subscribe((state, prevState) => {
    Object
      .keys(state)
      .forEach(k => {
        const key = k as keyof T
        if (isQuery(state[key])) {
          const current = state[key] as Query<T, any>;
          const dependencyChange = current.__deps.find(kk => !equals(state[kk], prevState[kk]));
          if (dependencyChange) {
            current.trigger();
          }
        } else if (isEffect(state[key])) {
          const current = state[key] as Effect<T>;
          const dependencyChange = current.__deps.find(kk => !equals(state[kk], prevState[kk]));
          if (dependencyChange) {
            current.trigger();
          }
        }
      })
  });

  function extractState<R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions): R;
  function extractState(selector: (state: T) => Effect<T>, opts?: UseBoundAsyncStoreOptions): () => Promise<void>;
  function extractState<R>(selector: (state: T) => Query<T, R> | Effect<T>, opts?: UseBoundAsyncStoreOptions): R | (() => Promise<void>) {
    const theSelector = (state: T): [Query<T, R>, ...QueryOrEffect<T>[]] | Effect<T> => {
      const value = selector(state);
      const _opts = opts || {};
      if (isQuery(value)) {
        const query = value as unknown as Query<T, R>;
        let deps = [] as QueryOrEffect<T>[];
        if (_opts.followDeps) {
          deps = query.__deps.flatMap(k => {
            const key = k as keyof T;
            return isQuery(state[key]) || isEffect(state[key]) ? [state[key]] : [];
          }) as (Query<T, any> | Effect<T>)[];
        }
        return [query, ...deps];
      } else if (isEffect(value)) {
        return value;
      } else {
        throw new Error("Must Fetch Query");
      }
    };
    const value = store(theSelector);
    if (isEffect(value)) {
      return withSuspense([value])[0];
    } else {
      return withSuspense(value as [Query<T, R>, ...QueryOrEffect<T>[]]);
    }
  }

  return extractState;
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
function withSuspense(effect: [Effect<any>, ...Effect<any>[]]): [() => Promise<void>, ...(() => Promise<void>)[]];
function withSuspense<T>(values: [Query<any, T>, ...QueryOrEffect<any>[]] | Effect<any>[]): T | (() => Promise<void>)[] {
  if (isQuery(values[0])) {
    const v = values[0];
    const needsTrigger = v.value === undefined || v.isLoading;
    let queryTrigger = [] as Promise<T>[];
    if (needsTrigger && v.__trigger) {
      queryTrigger = [v.__trigger];
    }
    if (needsTrigger && !v.__trigger) {
      queryTrigger = [v.trigger()];
    }
    const depTriggers = values.slice(1).flatMap(vv => {
      if (isQuery(vv)) {
        return vv.__trigger ? [vv.__trigger] : [];
      } else if (isEffect(vv)) {
        return vv.__triggers
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
    const promises = (values as Effect<any>[]).flatMap(vv => vv.isLoading ? vv.__triggers : []);
    const triggers = (values as Effect<any>[]).map(vv => vv.trigger);
    if (promises.length) {
      throw Promise.all(promises);
    }
    return triggers;
  }
}