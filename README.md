<p align="center">
  <img src="./assets/leo.png" height="300">
</p>

A simple library to connect async queries to Zustand stores.

Try a live demo [here](https://codesandbox.io/p/sandbox/leo-query-bears-demo-js-wmwlgt?file=%2Fsrc%2FApp.jsx). And see full documentation [here](./docs/index.md).

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
  increasePopulation: effect(increasePopulation),
  removeAllBears: effect(removeAllBears),
  bears: query(bears, s => [s.increasePopulation, s.removeAllBears])
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
  return <h1>{bears} around here ...</h1>;
}

function Controls() {
  const increasePopulation = useBearStore(state => state.increasePopulation.trigger);
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

### Why Leo over vanilla fetch?

- Automatically caches queries
- Automatically handles dependencies
- No need to update the store in useEffects

## Getting Started TypeScript

Write the same functions, just with types!

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
  increasePopulation: Effect<BearsState, []>;
  removeAllBears: Effect<BearsState, []>;
}

const useBearStore = create((set, get, store) => ({
  increasePopulation: effect(increasePopulation),
  removeAllBears: effect(removeAllBears),
  bears: query(bears, s => [s.increasePopulation, s.removeAllBears])
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
  return <h1>{bears} around here ...</h1>;
}

function Controls() {
  const increasePopulation = useBearStore(state => state.increasePopulation.trigger);
  return <button onClick={increasePopulation}>one up</button>;
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

## Examples

| Example                                                                                           | Description                        |
|---------------------------------------------------------------------------------------------------|------------------------------------|
| [Bears JS](https://codesandbox.io/p/sandbox/leo-query-bears-demo-js-wmwlgt?file=%2Fsrc%2FApp.jsx) | A simple bear counter (Javascript) |
| [Bears TS](https://codesandbox.io/p/sandbox/leo-query-bears-demo-ts-7f2c34?file=%2Fsrc%2FApp.tsx) | A simple bear counter (Typescript) |
| [Task Manager](https://codesandbox.io/p/sandbox/task-manager-xsh8c4?file=%2Fsrc%2FApp.tsx)        | A more complex task manager app.   |