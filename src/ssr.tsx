"use client";
import {createContext, useContext, useRef, useEffect} from "react";
import {StoreApi, useStore, UseBoundStore} from "zustand";
import {hook} from "./src";
import {UseBoundAsyncStoreWithSuspense, UseBoundAsyncStoreWithoutSuspense, StoreProvider, StoreHooks, StoreProviderProps, StoreProviderPropsWithServerSideData, StoreProviderWithServerSideData} from "./types";


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
      const isHydrated = !hydration;
      storeRef.current = {hook: syncHook, hookAsync, hookAsyncSuspense, store, isHydrated, hydration, __resolve: resolve};
    }
    useEffect(() => {
      if ((storeRef.current!.store as any).persist) {
        (storeRef.current!.store as any).persist.rehydrate();
        storeRef.current!.__resolve!();
        storeRef.current!.isHydrated = true;
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
    if (!store.isHydrated) {
      __opts = {...opts, hydration: store.hydration};
    }     
    return store.hookAsync(selector, __opts);
  };

  const useStoreSuspense = (selector: any, opts?: any) => {
    const store = useContext(Context);
    if (!store) throw new Error("Store not found");
    let __opts = opts;
    if (!store.isHydrated) {
      __opts = {...opts, hydration: store.hydration};
    }
    return store.hookAsyncSuspense(selector, __opts);
  };

  const useIsHydrated = () => {
    const store = useContext(Context);
    if (!store) throw new Error("Store not found");
    return store.isHydrated;
  };

  return {
    Provider, 
    Context, 
    useStore: useStoreSync as UseBoundStore<StoreApi<T>>, 
    useStoreAsync: useStoreAsync as UseBoundAsyncStoreWithoutSuspense<T>, 
    useStoreSuspense: useStoreSuspense as UseBoundAsyncStoreWithSuspense<T>,
    useIsHydrated
  };
};