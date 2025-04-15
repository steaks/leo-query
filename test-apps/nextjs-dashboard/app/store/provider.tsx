"use client";

import { createDogStore } from "./store";
import { createStoreProvider } from "leo-query";

export const {
    Provider: DogStoreProvider, 
    Context: DogStoreContext, 
    useStore: useDogStore, 
    useStoreAsync: useDogStoreAsync, 
    useStoreSuspense: useDogStoreSuspense
} = createStoreProvider(createDogStore);
