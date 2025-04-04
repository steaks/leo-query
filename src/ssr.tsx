import {createContext, ReactNode, useContext, useRef} from "react";
import {StoreApi, useStore, UseBoundStore} from "zustand";
import {hook} from "./src";
import {UseBoundAsyncStoreWithSuspense, UseBoundAsyncStoreWithoutSuspense, StoreProvider, StoreHooks} from "./types";

interface Props {
  children: ReactNode;
}

export const createStoreProvider = <T extends object, >(createStore: () => StoreApi<T>): StoreProvider<T> => {
  const Context = createContext<StoreHooks<T> | null>(null);

  const Provider = (p: Props) => {
    const storeRef = useRef<StoreHooks<T> | null>(null);
    if (storeRef.current === null) {
      const store = createStore();
      const useBoundStore: any = (selector?: any) => useStore(store, selector)
      const syncHook = Object.assign(useBoundStore, store) as UseBoundStore<StoreApi<T>>;
      const hookAsync = hook(syncHook, false);
      const hookAsyncSuspense = hook(syncHook, true);
      storeRef.current = {hook: syncHook, hookAsync, hookAsyncSuspense};
    }
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
    return store.hookAsync(selector, opts);
  };

  const useStoreSuspense = (selector: any, opts?: any) => {
    const store = useContext(Context);
    if (!store) throw new Error("Store not found");
    return store.hookAsyncSuspense(selector, opts);
  };

  return {
    Provider, 
    Context, 
    useStore: useStoreSync as UseBoundStore<StoreApi<T>>, 
    useStoreAsync: useStoreAsync as UseBoundAsyncStoreWithoutSuspense<T>, 
    useStoreSuspense: useStoreSuspense as UseBoundAsyncStoreWithSuspense<T>
  };
};