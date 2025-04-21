"use client";
import {createContext, useContext, useEffect, useState} from "react";
import {StoreApi, useStore, UseBoundStore} from "zustand";
import {hook} from "./src";
import {UseBoundAsyncStoreWithSuspense, UseBoundAsyncStoreWithoutSuspense, StoreProvider, StoreHooks, StoreProviderProps, StoreProviderPropsWithServerSideData, StoreProviderWithServerSideData} from "./types";

const validatePersist = <T, >(store: StoreApi<T>) => {
  const s = store as any;
  const options = s.persist.getOptions();
  if (!options.skipHydration) {
    throw new Error("Persist must be skipped for SSR.");
  }
  if (!options.merge) {
    throw new Error("Persist must have a Leo Query merge function.");
  }
  if (!options.partialize) {
    throw new Error("Persist must have a Leo Query partialize function.");
  }
  if (s.persist.hasHydrated()) {
    throw new Error("Persist has already been hydrated. Do not manually call rehydrate.");
  }
};

const setupPersist = <T, >(store: StoreApi<T>) => {
  if ((store as any).persist) {
    validatePersist(store);
    const s = store as any;
    let resolve: Function | undefined = undefined;
    const hydration = new Promise<void>(r => resolve = r);
    const hasHydrated = s.persist.hasHydrated();
    return {hydration, hasHydrated, resolve};
  }
  return {hydration: undefined, hasHydrated: false, resolve: undefined};
};

const onHydrate = <T, >(store: StoreHooks<T> | null, setStore: (store: StoreHooks<T>) => void) => {
  if (store && store.hasHydrated === true) {
    let resolve: Function | undefined = undefined;
    const storeWithPersist = (store!.store as any);
    const hasHydrated = storeWithPersist.persist.hasHydrated();
    const hydration = new Promise<void>(r => resolve = r);
    setStore({...store, hasHydrated, hydration, __resolve: resolve});
  }
};

const onFinishHydration = <T, >(store: StoreHooks<T> | null, setStore: (store: StoreHooks<T>) => void) => {
  if (store && store.hasHydrated === false) {
    const storeWithPersist = (store!.store as any);
    const hasHydrated = storeWithPersist.persist.hasHydrated();
    store.__resolve!();
    setStore({...store, hasHydrated});
  }
};

const rehydrate = <T, >(store: StoreHooks<T> | null, setStore: (store: StoreHooks<T>) => void) => {
  let unsubHydrate: Function | undefined = undefined;
  let unsubFinishHydration: Function | undefined = undefined;
  const storeWithPersist = (store!.store as any);
  if (storeWithPersist.persist) {
    validatePersist(storeWithPersist);
    unsubHydrate = storeWithPersist.persist.onHydrate(() => { onHydrate(store, setStore); });
    unsubFinishHydration = storeWithPersist.persist.onFinishHydration(() => { onFinishHydration(store, setStore); });
    storeWithPersist.persist.rehydrate();
  }
  return {unsubHydrate, unsubFinishHydration};
};

export function createStoreContext<T extends object>(createStore: () => StoreApi<T>): StoreProvider<T>
export function createStoreContext<T extends object, D>(createStore: (serverSideData: D) => StoreApi<T>): StoreProviderWithServerSideData<T, D>
export function createStoreContext<T extends object, D>(createStore: (serverSideData?: D) => StoreApi<T>): StoreProvider<T> | StoreProviderWithServerSideData<T, D> {
  const Context = createContext<StoreHooks<T> | null>(null);

  const Provider = (p: StoreProviderProps<T> | StoreProviderPropsWithServerSideData<T, D>) => {
    const [store, setStore] = useState<StoreHooks<T> | null>(null);
    if (store === null) {
      const store = createStore((p as StoreProviderPropsWithServerSideData<T, D>).serverSideData);
      const useBoundStore: any = (selector?: any) => useStore(store, selector);
      const syncHook = Object.assign(useBoundStore, store) as UseBoundStore<StoreApi<T>>;
      const hookAsync = hook(syncHook, false);
      const hookAsyncSuspense = hook(syncHook, true);
      const {hydration, hasHydrated, resolve} = setupPersist(store);
      setStore({hook: syncHook, hookAsync, hookAsyncSuspense, store, hasHydrated, hydration, __resolve: resolve})
    }
    useEffect(() => {
      const {unsubHydrate, unsubFinishHydration} = rehydrate(store, setStore);
      return () => {
        if (unsubHydrate) { unsubHydrate(); }
        if (unsubFinishHydration) { unsubFinishHydration(); }
      }
    }, []);
    return (
      <Context.Provider value={store}>
        {p.children}
      </Context.Provider>
    );
  };

  const useStoreSync = <R, >(selector: (state: T) => R) => {
    const store = useContext(Context);
    if (!store) throw new Error("Store not found");
    return store.hook(selector);
  };

  const useStoreAsync = (selector: any, opts?: any) => {
    const store = useContext(Context);
    if (!store) throw new Error("Store not found");
    let __opts = opts;
    if (!store.hasHydrated) {
      __opts = {...opts, hydration: store.hydration};
    }     
    return store.hookAsync(selector, __opts);
  };

  const useStoreSuspense = (selector: any, opts?: any) => {
    const store = useContext(Context);
    if (!store) throw new Error("Store not found");
    let __opts = opts;
    if (!store.hasHydrated) {
      __opts = {...opts, hydration: store.hydration};
    }
    return store.hookAsyncSuspense(selector, __opts);
  };

  const useHasHydrated = () => {
    const store = useContext(Context);
    if (!store) throw new Error("Store not found");
    return store.hasHydrated;
  };

  return {
    Provider, 
    Context, 
    useStore: useStoreSync as UseBoundStore<StoreApi<T>>, 
    useStoreAsync: useStoreAsync as UseBoundAsyncStoreWithoutSuspense<T>, 
    useStoreSuspense: useStoreSuspense as UseBoundAsyncStoreWithSuspense<T>,
    useHasHydrated
  };
};