# Setup with Next

Leo Query provides helpers that follow [Zustand's guidance](https://zustand.docs.pmnd.rs/guides/nextjs) to integrate with [Next.js](https://nextjs.org/).

## Usage

Integrate Zustand + Leo Query with Next in three steps. Create your store. Create your provider. 


```typescript
//store.ts
import {createStore} from "zustand/vanilla";
import {query, effect, Effect, Query} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs } from "./data";

export interface DogsState {
  dogs: Query<DogsState, number>;
  increasePopulation: Effect<DogsState, []>;
  removeAllDogs: Effect<DogsState, []>;
}

export const createDogsStore = () => 
  createStore<DogsState>(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) // Re-fetch when increasePopulation or removeAllDogs succeeds 
  }));

export type DogsStateApi = ReturnType<typeof createDogsStore>;
```

```typescript
//provider.tsx
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
```

```typescript
//page.tsx
import {DogsStoreProvider} from "@/app/store/provider";
import {Content} from "./content";

const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const initialDogs = await fetchInitialDogs();
  return (
    <DogsStoreProvider>
      <p>Initial Dogs: {initialDogs}</p>
      <Content initialDogs={initialDogs} />
    </DogsStoreProvider>
  );
}
```

```typescript
//content.tsx
"use client";

import {useDogsStore, useDogsStoreAsync} from "@/app/store/provider";

interface Props {
  initialDogs: number;
}

export const Content = (p: Props) => {
  const dogs = useDogsStoreAsync(s => s.dogs, {initialValue: p.initialDogs});
  const increasePopulation = useDogsStore(s => s.increasePopulation.trigger);

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