# Setup with Next.js

Leo Query provides helpers that follow [Zustand's guidance](https://zustand.docs.pmnd.rs/guides/nextjs) to integrate with [Next.js](https://nextjs.org/). This guide will walk you through setting up Leo Query in your Next.js application. 

Please read Zustand's documentation about [SSR and Hydration](https://zustand.docs.pmnd.rs/guides/ssr-and-hydration) and [Setup with Next.js](https://zustand.docs.pmnd.rs/guides/nextjs) before this guide.

## Overview

There are four steps to integrate the Leo Query + Zustand stack with Next.js.

1. Create a store
2. Create a [React Context](https://react.dev/reference/react/createContext) to hold the store
3. Provide your context
4. Access the store using your context

If you'd like to skip the step-by-step guide you can browse a working implementation [here](https://codesandbox.io/p/devbox/next-js-example-0-3-0-y6w29t).

## Step-by-Step Guide

### 1. Create a Store

Create a store in a similar way to how you normally create stores. Use `createStore` from `zustand/vanilla` rather than the React-specific `create` function.

```typescript
//store.ts
import {createStore} from "zustand/vanilla";
import {query, effect, Effect, Query} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs } from "./data";

export interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState, []>;
  removeAllDogs: Effect<DogState, []>;
}

export const createDogStore = () => 
  createStore<DogState>(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) // Re-fetch when increasePopulation or removeAllDogs succeeds 
  }));
```

### 2. Create a React Context

Create a React context using Leo Query's `createStoreContext`. This function will create the Context, Provider, and hooks to access the store via the context.

```typescript
//provider.tsx
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
```

### 3. Provide Your Context

Use the Provider in your route. Follow [Zustand's guidance](https://zustand.docs.pmnd.rs/guides/nextjs#using-the-store-with-different-architectures) for where you should put your provider.

```typescript
//page.tsx
import {DogStoreProvider} from "@/app/store/provider";
import {Dogs} from "./dogs";

const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const initialDogs = await fetchInitialDogs();
  return (
    <DogStoreProvider>
      <p>Initial Dogs: {initialDogs}</p>
      <Content initialDogs={initialDogs} />
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
## Passing Initial Data

When working with Next.js, you often want to fetch initial data in a server component and pass it to your client components to avoid unnecessary fetches. With Leo Query you can pass an `initialValue` to your hook.

### Example

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

export const Content = (p: Props) => {
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

## Passing Data with a Timestamp

For a more advanced data passing technique you can pass a value and timestamp to the hook. Leo Query will look at the timestamp provided. If the timestamp is newer than the timestamp when the last value was set the query will receive the updated value. If the timestamp is older the value will be ignored.

This technique is useful when you are concerned about race-conditions or the Zustand store having stale data.

### Example

```typescript
//page.tsx
import {DogStoreProvider} from "@/app/store/provider";
import {Content} from "./content";

const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const initialDogs = await fetchInitialDogs(); //fetch data in the server component.
  const initialDogsTimestamp = Date.now();
  return (
    <DogStoreProvider>
      <p>Initial Dogs: {initialDogs}</p>
      <Content initialDogs={initialDogs} initialDogsTimestamp={initialDogsTimestamp} />
    </DogStoreProvider>
  );
}
```
```typescript
//content.tsx
"use client";

import {useDogStore, useDogStoreAsync} from "@/app/store/provider";

interface Props {
  initialDogs: number;
  initialDogsTimestamp: number;
}

export const Content = (p: Props) => {
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

## Hydrating your store

If you are [hydrating your store](https://zustand.docs.pmnd.rs/integrations/persisting-store-data#usage-in-next.js) using the persist middleware you may need more control. Hydration is typically done in a `useEffect`. You can use [manual updates](/next/advancedConcepts/manualUpdates) in a `useEffect` to set values in your store.