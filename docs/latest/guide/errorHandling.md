# Error Handling

## Queries

There are two ways to handle query errors depending on whether you are using Suspense. If you are using Suspense, wrap your component in an error boundary component. We recommend [react-error-boundary](https://www.npmjs.com/package/react-error-boundary). If you are not using Suspense, handle errors directly in the component.


## Error Handling with Suspense

Wrap your component in an ErrorBoundary. We recommend using [react-error-boundary](https://www.npmjs.com/package/react-error-boundary).

```typescript {27,31}
import React, {Suspense} from 'react';
import {create} from "zustand";
import {hook, effect, query, Query, Effect} from "leo-query";
import {ErrorBoundary} from 'react-error-boundary';

interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState>;
  removeAllDogs: Effect<DogState>;
}

const useDogStore = create<DogState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]),
}));

const useDogStoreAsync = hook(useDogStore); //uses suspense by default

function Dogs() {
  const dogs = useDogStoreAsync(state => state.dogs);
  return <div>Dogs: {dogs}</div>;
}

function App() {
  return (
    <ErrorBoundary fallback={<div>Error loading dogs</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <Dogs />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Error Handling without Suspense

Handle the error in your component with the `error` property.

```typescript {24-26}
import React from 'react';
import {create} from "zustand";
import {hook, effect, query, Query, Effect} from "leo-query";

interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState>;
  removeAllDogs: Effect<DogState>;
}

const useDogStore = create<DogState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]),
}));

const useDogStoreAsync = hook(useDogStore, /*suspense*/false); //uses suspense by default

function Dogs() {
  const dogs = useDogStoreAsync(state => state.dogs);
  if (dogs.isLoading) {
    return <div>Loading...</div>;
  }
  if (dogs.error) {
    return <div>Error loading dogs</div>;
  }
  return <div>Dogs: {dogs.value}</div>;
}

function App() {
  return <Dogs />;
}
```

## Effects

Effects provide two properties for error handling: `error` and `errors`. The `error` property contains the error from the most recent trigger if it failed. The `errors` property contains all errors encountered by the effect.

```typescript {32-37}
import React from 'react';
import {create} from "zustand";
import {hook, effect, query, Query, Effect} from "leo-query";

interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState>;
  removeAllDogs: Effect<DogState>;
}

const useDogStore = create<DogState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]),
}));

const useDogStoreAsync = hook(useDogStore, /*suspense*/false); //uses suspense by default

function Dogs() {
  const dogs = useDogStoreAsync(state => state.dogs);
  if (dogs.isLoading) {
    return <div>Loading...</div>;
  }
  if (dogs.error) {
    return <div>Error loading dogs</div>;
  }
  return <div>Dogs: {dogs.value}</div>;
}

function Controls() {
  const increasePopulation = useDogStore(state => state.increasePopulation.trigger);
  const error = useDogStore(state => state.increasePopulation.error);
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);
  return <button className="cool-button" onClick={increasePopulation}>one up</button>;
}

function App() {
  return (
    <>
      <Dogs />
      <Controls />
    </>
  );
}
```