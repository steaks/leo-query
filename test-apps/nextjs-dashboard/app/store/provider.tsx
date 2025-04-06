"use client";

import { createDogsStore } from "./store";
import { createStoreProvider } from "leo-query";

export const {
    Provider: DogsStoreProvider, 
    Context: DogsStoreContext, 
    useStore: useDogsStore, 
    useStoreAsync: useDogsStoreAsync, 
    useStoreSuspense: useDogsStoreSuspense
} = createStoreProvider(createDogsStore);
