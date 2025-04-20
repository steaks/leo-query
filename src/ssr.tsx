"use client";
import {createContext, useContext, useRef, useEffect, RefObject} from "react";
import {StoreApi, useStore, UseBoundStore} from "zustand";
import {hook} from "./src";
import {UseBoundAsyncStoreWithSuspense, UseBoundAsyncStoreWithoutSuspense, StoreProvider, StoreHooks, StoreProviderProps, StoreProviderPropsWithServerSideData, StoreProviderWithServerSideData} from "./types";

const onHydrate = <T, >(storeRef: RefObject<StoreHooks<T> | null>) => {
  if (storeRef.current && storeRef.current.hasHydrated === true) {
    storeRef.current.hasHydrated = false;
    storeRef.current.hydration = new Promise<void>(r => storeRef.current!.__resolve = r);
  }
};

const onFinishHydration = <T, >(storeRef: RefObject<StoreHooks<T> | null>) => {
  if (storeRef.current && storeRef.current.hasHydrated === false) {
    storeRef.current.__resolve!();
    storeRef.current.hasHydrated = true;
  }
};

export function createStoreContext<T extends object>(createStore: () => StoreApi<T>): StoreProvider<T>
export function createStoreContext<T extends object, D = undefined>(createStore: (serverSideData: D) => StoreApi<T>): StoreProviderWithServerSideData<T, D>
export function createStoreContext<T extends object, D = undefined>(createStore: (serverSideData?: D) => StoreApi<T>): StoreProvider<T> | StoreProviderWithServerSideData<T, D> {
  const Context = createContext<StoreHooks<T> | null>(null);

  const Provider = (p: StoreProviderProps<T> | StoreProviderPropsWithServerSideData<T, D>) => {
    const storeRef = useRef<StoreHooks<T> | null>(null);
    if (storeRef.current === null) {
      const store = createStore((p as StoreProviderPropsWithServerSideData<T, D>).serverSideData);
      const useBoundStore: any = (selector?: any) => useStore(store, selector);
      const syncHook = Object.assign(useBoundStore, store) as UseBoundStore<StoreApi<T>>;
      const hookAsync = hook(syncHook, false);
      const hookAsyncSuspense = hook(syncHook, true);
      let resolve: Function | undefined = undefined;
      const hydration = (store as any).persist !== undefined ? new Promise<void>(r => resolve = r) : undefined;
      const hasHydrated = (store as any).persist.hasHydrated();
      storeRef.current = {hook: syncHook, hookAsync, hookAsyncSuspense, store, hasHydrated, hydration, __resolve: resolve};
    }
    useEffect(() => {
      const storeWithPersist = (storeRef.current!.store as any);
      let unsubHydrate: Function | undefined = undefined;
      let unsubFinishHydration: Function | undefined = undefined;
      if (storeWithPersist.persist) {
        storeRef.current!.hasHydrated = storeWithPersist.persist.hasHydrated();
        unsubHydrate = storeWithPersist.persist.onHydrate(() => { onHydrate(storeRef); });
        unsubFinishHydration = storeWithPersist.persist.onFinishHydration(() => { onFinishHydration(storeRef); });
        storeWithPersist.persist.rehydrate();
      }
      return () => {
        if (unsubHydrate) { unsubHydrate(); }
        if (unsubFinishHydration) { unsubFinishHydration(); }
      }
    }, []);
    return (
      <Context.Provider value={storeRef.current}>
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