"use client";
import {createStoreContext} from "leo-query";
import {createDogStore} from "./store";

export const {
    Provider: DogStoreProvider, 
    Context: DogStoreContext, 
    useStore: useDogStore, 
    useStoreAsync: useDogStoreAsync, 
    useStoreSuspense: useDogStoreSuspense
} = createStoreContext(createDogStore);