# Setup with Next.js

Leo Query provides helpers that follow [Zustand's guidance](https://zustand.docs.pmnd.rs/guides/nextjs) to integrate with [Next.js](https://nextjs.org/). This guide will walk you through setting up Leo Query in your Next.js application. 

Please read Zustand's documentation about [SSR and Hydration](https://zustand.docs.pmnd.rs/guides/ssr-and-hydration) and [Setup with Next.js](https://zustand.docs.pmnd.rs/guides/nextjs) before this guide.

## Overview

There are four steps to integrate the Leo Query + Zustand stack with Next.js.

1. Write store creation function.
2. Create a [React Context](https://react.dev/reference/react/createContext) to hold the store.
3. Initialize the store with server-side data.
4. Access the store.

If you'd like to skip the step-by-step guide you can browse a working implementation [here](https://codesandbox.io/p/devbox/next-js-example-0-3-0-y6w29t).

## Step-by-Step Guide

### 1. Write a Store Creation Function

Write a store creation function just like you normally create stores. Use `createStore` from `zustand/vanilla` rather than the `create` function.

```typescript
"use client";
import {createStore, StoreApi} from "zustand";
import {query, effect, Effect, Query} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs } from "./db";

interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState>;
  removeAllDogs: Effect<DogState>;
}

interface ServerSideData {
  dogs: number;
}

export const createDogStore = (d: ServerSideData): StoreApi<DogState> => 
  createStore<DogState>(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs], {initialValue: d.initialDogs}) // Re-fetch when increasePopulation or removeAllDogs succeeds 
  }));
```

### 2. Create a React Context to Hold the Store

Create a React context using Leo Query's `createStoreContext`. This function will create the context, provider, and hooks to access the store.

```typescript
//provider.tsx
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
```

### 3. Initialize the Store with Server-Side Data

Initialize the store with the provider. Pass server-side data to the params property. Typically you'll put the provider in the [page file](https://nextjs.org/docs/app/api-reference/file-conventions/page) for your route. Follow [Zustand's guidance](https://zustand.docs.pmnd.rs/guides/nextjs#using-the-store-with-different-architectures) for more details on where to put your provider.

```typescript
//page.tsx
import {DogStoreProvider} from "@/app/store/provider";
import {Dogs} from "./content";

const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const dogs = await fetchInitialDogs();
  return (
    <DogStoreProvider serverSideData={{dogs}}>
      <p>Initial Dogs: {initialDogs}</p>
      <Dogs />
    </DogStoreProvider>
  );
}
```

### 4. Use the Hooks

Use the hooks in your client components to access the store. Leo Query provides three hooks:
- `useStore`: For synchronous state access. This is Zustand's native hook.
- `useStoreAsync`: For async state with loading/error handling created with [hook](/next/guide/hook).
- `useStoreSuspense`: For async state with React Suspense created with [hook](/next/guide/hook).

```typescript
//dogs.tsx
"use client";
import {useDogStore, useDogStoreAsync} from "@/app/store/provider";

export const Dogs = () => {
  const dogs = useDogStoreAsync(s => s.dogs);
  const increasePopulation = useDogStore(s => s.increasePopulation.trigger);

  if (dogs.isLoading) {
    return <>Loading...</>;
  }

  return (
    <div>
      <p>Dogs: {dogs.value}</p>
      <button onClick={increasePopulation}>Add Dog</button>
    </div>
  );
};
```
## Alternative Ways to Pass Server-Side Data

The easiest way is to pass server-side data is through the provider. If this isn't possible you can pass it to the [hook](/latest/guide/initialData#hook) when you access data or [manually](/latest/advancedConcepts/manualUpdates) in a `useEffect`.

### Passing Data to the hook

Pass server-side data to the hook's `initialValue` option.

```typescript
//page.tsx
import { DogStoreProvider } from "@/app/store/provider";
import Dogs from "@/app/ui/dogs";

const fetchInitialDogs = async () => Promise.resolve(100);

export default async function Page() {
  const initialDogs = await fetchInitialDogs();
  return (
    <DogStoreProvider>
      <p className="initial-dogs">
        Initial Dogs (loaded in server component): {initialDogs}
      </p>
      <Dogs initialDogs={initialDogs} />
    </DogStoreProvider>
  );
}

```
```typescript
//dogs.tsx
"use client";
import {useDogStore, useDogStoreAsync} from "@/app/store/provider";

interface Props {
  initialDogs: number;
}

export const Dogs = (p: Props) => {
  const dogs = useDogStoreAsync(s => s.dogs, {initialValue: p.initialDogs}); 
  const increasePopulation = useDogStore(s => s.increasePopulation.trigger);

  if (dogs.isLoading) {
    return <>Loading...</>;
  }

  return (
    <div>
      <p>Dogs: {dogs.value}</p>
      <button onClick={increasePopulation}>Add Dog</button>
    </div>
  );
};
```

Browse a working implementation [here](https://codesandbox.io/p/devbox/next-js-example-0-3-0-y6w29t).

### Passing Data to the hook with a Timestamp

You can pass data with a timestamp the data was fetched to be more precise. Leo Query will compare the provided timestamp with the timestamp the value was last set. 

If the timestamp is newer than the timestamp when the last value was set the query will receive the updated value. If the timestamp is older the value will be ignored. 

Use this method for advanced edge-cases when you're concerned about race-conditions or stale data.

### Example

```typescript
//page.tsx
import { DogStoreProvider } from "@/app/store/provider";
import Dogs from "@/app/ui/dogs";

const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const initialDogs = await fetchInitialDogs(); //fetch data in the server component.
  const initialDogsTimestamp = Date.now();
  return (
    <DogStoreProvider>
      <p>Initial Dogs: {initialDogs}</p>
      <Dogs initialDogs={initialDogs} initialDogsTimestamp={initialDogsTimestamp} />
    </DogStoreProvider>
  );
}
```
```typescript
//dogs.tsx
"use client";
import {useDogStore, useDogStoreAsync} from "@/app/store/provider";

interface Props {
  initialDogs: number;
  initialDogsTimestamp: number;
}

export const Dogs = (p: Props) => {
  const dogs = useDogStoreAsync(s => s.dogs, {value: p.initialDogs, timestamp: p.initialDogsTimestamp}); 
  const increasePopulation = useDogStore(s => s.increasePopulation.trigger);

  if (dogs.isLoading) {
    return <>Loading...</>;
  }

  return (
    <div>
      <p>Dogs: {dogs.value}</p>
      <button onClick={increasePopulation}>Add Dog</button>
    </div>
  );
};
```

## Working with Persist

Working with persist middleware and Next.js can be tricky. Leo Query handles the edge cases for you by re-hydrating the store at the appropriate time. 

Use the persist middleware as you normally would. Pass in `skipHydration: true`. Leo Query will hydrate the store for you at the appropriate time. Use the `useIsHydrated` hook for more granular control.

```typescript {27}
//store.ts
"use client";
import {createStore} from "zustand";
import {persist} from "zustand/middleware";
import {query, effect, merge, partialize, Effect, Query} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs } from "./db";

export interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState>;
  removeAllDogs: Effect<DogState>;
}

interface ServerSideData {
  dogs: number;
}

export const createDogStore = (d: ServerSideData) => 
  createStore<DogState>()(persist((set) => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) // Re-fetch when increasePopulation or removeAllDogs succeeds 
  }), {
    name: "dogs-storage",
    merge,
    partialize,
    skipHydration: true
  })
);
```
```typescript {12}
//provider.tsx
"use client";
import {createStoreContext} from "leo-query";
import {createDogStore} from "./store";

export const {
    Provider: DogStoreProvider, 
    Context: DogStoreContext, 
    useStore: useDogStore, 
    useStoreAsync: useDogStoreAsync, 
    useStoreSuspense: useDogStoreSuspense,
    useIsHydrated: useDogStoreIsHydrated
} = createStoreContext(createDogStore);
```
```typescript
//page.tsx
import {DogStoreProvider} from "@/app/store/provider";
import {Dogs} from "./content";

const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const dogs = await fetchInitialDogs();
  return (
    <DogStoreProvider serverSideData={{dogs}}>
      <p>Initial Dogs: {initialDogs}</p>
      <Dogs />
    </DogStoreProvider>
  );
}
```
```typescript {8,17}
//dogs.tsx
"use client";
import {useDogStore, useDogStoreAsync, useDogStoreIsHydrated} from "@/app/store/provider";

export const Dogs = () => {
  const dogs = useDogStoreAsync(s => s.dogs);
  const increasePopulation = useDogStore(s => s.increasePopulation.trigger);
  const isHydrated = useDogStoreIsHydrated();

  if (dogs.isLoading) {
    return <>Loading...</>;
  }

  return (
    <div>
      <p>Dogs: {dogs.value}</p>
      <p>Is Hydrated: {isHydrated.toString()}</p>
      <button onClick={increasePopulation}>Add Dog</button>
    </div>
  );
};
```