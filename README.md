<div style="display:flex; justify-content: center">
  <img src="./assets/leo.png" height="300">
</div>
![test](https://github.com/steaks/leo-query/actions/workflows/test.yml/badge.svg)

A simple library to connect async queries to Zustand stores.

Try a live demo [here](https://codesandbox.io/p/sandbox/leo-query-bears-demo-js-wmwlgt?file=%2Fsrc%2FApp.js).

```
npm i leo-query
```

## Getting Started Javascript
_See Typescript Getting Started [here](#getting-started-typescript)._

## Write your async functions

```javascript
const db = {bears: 0};

export const bears = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(db.bears);
    }, 1000);
  });
};

export const increasePopulation = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears + 1;
      resolve();
    }, 1000);
  });
};

export const removeAllBears = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears = 0;
      resolve();
    }, 1000);
  });
};
```

## Create a store
```javascript jsx
const useBearStore = create((set, get, store) => ({
  increasePopulation: effect(store, increasePopulation, []),
  removeAllBears: effect(store, removeAllBears, []),
  bears: query(store, bears, ["increasePopulation", "removeAllBears"])
}));
```

## Subscribe your store
```javascript jsx
const useBearStoreAsync = subscribe(useBearStore);
```

## Bind your components
```javascript jsx
function BearCounter() {
  const bears = useBearStoreAsync(state => state.bears);
  return <h1>{bears} around here ...</h1>
}

function Controls() {
  const increasePopulation = useBearStore(state => state.increasePopulation.trigger)
  return <button onClick={increasePopulation}>one up</button>;
}
```

## Wrap in Suspense
```javascript jsx
function App() {
  return (
    <>
      <Suspense fallback={<h1>Loading...</h1>}>
        <BearCounter/>
      </Suspense>
      <Controls/>
    </>
  );
}
```

## Why Leo?

Leo is the simplest and safest way to connect async queries to Zustand stores.

### Why Leo over TanStack Query?

- Integrates directly into your store
- No need to write async queries in your components
- No need to update the store in useEffects

### Why Leo over vanilla fetch?

- Automatically caches queries
- Automatically handles dependencies

## Getting Started TypeScript

Typescript requires that you use `create<State>`, `query<State, return-type>`, and `effect<State>` instead of `create(...)`, `query(...)`, and `effect(...)`.

## Write your async functions
```typescript
const db = {bears: 0};

// Simulated async functions

export const bears = (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(db.bears), 1000);
  });
};

export const increasePopulation = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears + 1;
      resolve();
    }, 1000);
  });
};

export const removeAllBears = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears = 0;
      resolve();
    }, 1000);
  });
};
```


## Create a store
```typescript jsx
interface BearsState {
  bears: Query<BearsState, number>;
  increasePopulation: Effect<BearsState>;
  removeAllBears: Effect<BearsState>;
}

const useBearStore = create<BearsState>((set, get, store) => ({
  increasePopulation: effect<BearsState>(store, increasePopulation, []),
  removeAllBears: effect<BearsState>(store, removeAllBears, []),
  bears: query<BearsState, number>(store, bears, ["increasePopulation", "removeAllBears"])
}));
```

## Subscribe your store
```typescript jsx
const useBearStoreAsync = subscribe(useBearStore);
```

## Bind your components
```typescript jsx
function BearCounter() {
  const bears = useBearStoreAsync(state => state.bears);
  return <h1>{bears} around here ...</h1>
}

function Controls() {
  const increasePopulation = useBearStore(state => state.increasePopulation.trigger)
  return <button onClick={increasePopulation}>one up</button>
}
```

## Wrap in Suspense
```typescript jsx
function App() {
  return (
    <>
      <Suspense fallback={<h1>Loading...</h1>}>
        <BearCounter />
      </Suspense>
      <Controls />
    </>
  );
}
```