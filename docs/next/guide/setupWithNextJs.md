# Setup with Next.js

Leo Query provides helpers that follow [Zustand's guidance](https://zustand.docs.pmnd.rs/guides/nextjs) to integrate with [Next.js](https://nextjs.org/). This guide will walk you through setting up Leo Query in your Next.js application.

## Overview

When using Leo Query with Next.js, there are four main steps to get your app working:

1. Create your store
2. Create your provider
3. Wrap your components with the provider
4. Use the hooks in client components

## Step-by-Step Guide

### 1. Create Your Store

First, create your Zustand store using Leo Query's `query` and `effect` functions. This is identical to how you would create a store in a regular React app.

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

### 2. Create Your Provider

Next, create a provider using Leo Query's `createStoreProvider`. With Next.js it's important to provide your store through React's context rather than a global store.

```typescript
//provider.tsx
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
```

### 3. Wrap Your Components

Wrap your components with the provider. You can also fetch initial data on the server and pass it to your components.

```typescript
//page.tsx
import {DogStoreProvider} from "@/app/store/provider";
import {Content} from "./content";

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

Finally, use the hooks in your client components. Leo Query provides three types of hooks:
- `useStore`: For synchronous state access
- `useStoreAsync`: For async state with loading/error handling
- `useStoreSuspense`: For async state with React Suspense

```typescript
//content.tsx
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
## Passing Initial Data

When working with Next.js, you often want to fetch initial data on the server and pass it to your client components. This is particularly useful for:

1. **Server-Side Rendering (SSR)**: Fetch data during the initial page load to avoid client-side loading states
2. **Static Site Generation (SSG)**: Pre-render pages with data at build time
3. **Incremental Static Regeneration (ISR)**: Revalidate and update static pages periodically

Leo Query supports this pattern through the `initialValue` option in the `useStoreAsync` hook. This allows you to:

- Pass server-fetched data directly to your client components
- Avoid unnecessary loading states on initial render
- Maintain consistency between server and client state
- Improve performance by reducing client-side data fetching

The `initialValue` works seamlessly with Leo Query's caching and revalidation system. When you provide an initial value, it's used as the first value rather than exist in a loading state initially.


### Example

Fetch data in the server component. Pass it to client components through props.
```typescript
//page.tsx
import {DogStoreProvider} from "@/app/store/provider";
import {Content} from "./content";

const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const initialDogs = await fetchInitialDogs(); //fetch data in the server component.
  return (
    <DogStoreProvider>
      <p>Initial Dogs: {initialDogs}</p>
      <Content initialDogs={initialDogs} />
    </DogStoreProvider>
  );
}
```

Use the data in props as the initial value in your client component.

```typescript
//content.tsx
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

### Passing Data with a Timestamp

Leo Query provides the option to pass a value along with a timestamp. This is a way to provide data in a more precise way. Leo Query will look at the timestamp provided to deterime if the data provided is fresher than the existing data. Use this for advanced edge-cases and more precise data passing when working with Next.js.

### Example

Fetch data in the server component and create a timestamp. Pass it to client components through props.
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

Use the data and timestamp in props as the value in your client component.

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