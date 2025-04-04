"use client";

import { CounterStore, createCounterStore } from "./store";
import { createStoreProvider } from "leo-query";

console.log("HERE");
export const {
    Provider: CounterStoreProvider, 
    Context: CounterStoreContext, 
    useStore: useCounterStore, 
    useStoreAsync: useCounterStoreAsync, 
    useStoreSuspense: useCounterStoreSuspense
} = createStoreProvider<CounterStore>(createCounterStore);
