# Using the Library Without Suspense

You can use the async queries and effects provided by the library without relying on React Suspense. Here’s a step-by-step guide to set it up.

### 1. Write Your Async Functions

Define the async functions you want to use in your store.

```
const db = { bears: 0 };
// Simulate an async query to fetch bears count
export const bears = (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(db.bears), 1000);
  });
};

// Simulate an async effect to increase the bear population
export const increasePopulation = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears += 1;
      resolve();
    }, 1000);
  });
};
```

### 2. Create Your Store

Create a Zustand store that ties your async functions to queries and effects.

```
interface BearsState {
  bears: Query<BearsState, number>;
  increasePopulation: Effect<BearsState, []>;
}

const useBearStore = create<BearsState>(() => ({
  increasePopulation: effect(increasePopulation),
  bears: query(bears, (state) => [state.increasePopulation]),
}));
```

### 3. Create Your Hook Without Suspense

Use the `withoutSuspenseHook` to create a hook that doesn’t rely on React Suspense for managing loading states.

```
const useBearStoreAsync = withoutSuspenseHook(useBearStore);
```

### 4. Bind Your Components

Now you can bind the queries and effects to your components without Suspense.

```
function BearCounter() {
  const { value: bears, isLoading } = useBearStoreAsync((state) => state.bears);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return <h1>{bears} bears around here...</h1>;
}

function Controls() {
  const increasePopulation = useBearStoreAsync((state) => state.increasePopulation);
  return <button onClick={() => increasePopulation()}>Increase Population</button>;
}
```

### 5. Complete Your App

You can now use the components without the need for Suspense, as the loading state is handled manually within the component.

```
function App() {
  return (
    <>
      <BearCounter />
      <Controls />
    </>
  );
}
```