"use client";

import { createDogStore } from "./store";
import { createStoreContext } from "leo-query";

export const {
    Provider: DogStoreProvider, 
    Context: DogStoreContext, 
    useStore: useDogStore, 
    useStoreAsync: useDogStoreAsync, 
    useStoreSuspense: useDogStoreSuspense
} = createStoreContext(createDogStore);
