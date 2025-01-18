# Hook

The `hook` function connects asynchronous **queries** and **effects** to a Zustand store, managing their lifecycle within React components. It supports both data-fetching operations (queries) and side effects (effects) while integrating with React's Suspense for seamless loading states.

## Usage
### Basic Example

Hook into a store to access dogs. Render a loading message using React's Suspense when the dogs are loading.

```typescript
const fetchDogs = () => fetch('/api/dogs').then(res => res.json());

const useBearStore = create(() => ({
  dogs: query(fetchDogs)
}));

const useBearStoreAsync = hook(useBearStore);

const BearCounter = () => {
  const dogs = useBearStoreAsync(state => state.dogs);
  return <h1>{dogs} dogs around here...</h1>
};

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BearCounter />
    </Suspense>
  );
};
```

### Example with Dependencies

Hook into dogs. Use Suspense to render a loading message when the dogs are loading. Make a POST request to increase the bear count when the button is clicked.

```typescript
const fetchDogs = () => fetch('/api/dogs').then(res => res.json());
const increaseBearCount = () => fetch('/api/increase', { method: 'POST' });

const useBearStore = create(() => ({
  dogs: query(fetchDogs, s => [s.increaseBearCount]),
  increaseBearCount: effect(increaseBearCount)
}));

const useBearStoreAsync = hook(useBearStore);

const BearCounter = () => {
  const dogs = useBearStoreAsync(state => state.dogs);
  return <h1>{dogs} dogs around here...</h1>;
};

const Controls = () => {
  const increase = useBearStore(state => state.increaseBearCount.trigger);
  return <button onClick={increase}>Increase bear count</button>;
};

const App = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <BearCounter />
      </Suspense>
      <Controls />
    </>
  );
};
```

### Example without Suspense

Hook into dogs. Render a loading message when the dogs are loading. Render an error message if the dogs fail to load.

```typescript
const fetchDogs = () => fetch('/api/dogs').then(res => res.json());

const useBearStore = create(() => ({
  dogs: query(fetchDogs)
}));

const useBearStoreAsync = hook(useBearStore, /*suspense*/ false);

const BearCounter = () => {
  const dogs = useBearStoreAsync(state => state.dogs);
  if (dogs.isLoading) return <div>Loading...</div>;
  if (dogs.error) return <div>Error: {dogs.error.message}</div>;
  return <h1>{dogs.value} dogs around here...</h1>;
};
```

## Syntax

```typescript
function hook<T extends object>(store: UseBoundStore<StoreApi<T>>): UseBoundAsyncStoreWithSuspense<T>;
function hook<T extends object>(store: UseBoundStore<StoreApi<T>>, suspense: false): UseBoundAsyncStoreWithoutSuspense<T>;
function hook<T extends object>(store: UseBoundStore<StoreApi<T>>, suspense: true): UseBoundAsyncStoreWithSuspense<T>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `store` | `UseBoundStoreApi<T>>` | The Zustand store to hook into. |
| `suspense` | `boolean` | *Optional.* If `true`, the hook will return a store with suspense enabled. If `false`, the hook will return a store with suspense disabled. |

## Returns

### UseBoundAsyncStoreWithSuspense&lt;T&gt;

Selector to access queries and effects from the store. Leverage React's Suspense when the query is loading.

```typescript
type UseBoundAsyncStoreWithSuspense<T> = {
  /**
   * Select a query from the store. Handle async data concerns:
   *   - Fetch data for the query as needed
   *   - Leverage caching
   *   - Re-render component when query value updates
   *   - Trigger suspense when the query is loading
   *   - Consider dependencies
   * @param selector Select the query from the store.
   * @param opts Options
   */
  <R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions): R;
  /**
   * Select an effect from the store. Handle async data concerns:
   *   - Trigger suspense when the effect is loading
   *   - Consider dependencies
   * @param selector Select the effect from the store.
   * @param opts Options
   */
  <Args extends any[] = []>(selector: (state: T) => Effect<T, Args>, opts?: UseBoundAsyncStoreOptions): () => Promise<void>
}
```

### UseBoundAsyncStoreWithoutSuspense&lt;T&gt;

Selector to access queries and effects from the store. Do not leverage React's Suspense.

```typescript
type UseBoundAsyncStoreWithoutSuspense<T> = {
  /**
   * Select a query from the store. Handle async data concerns:
   *   - Fetch data for the query as needed
   *   - Leverage caching
   *   - Re-render component when query value updates
   *   - Trigger suspense when the query is loading
   *   - Consider dependencies
   * @param selector Select the query from the store.
   * @param opts Options
   */
    <R>(selector: (state: T) => Query<T, R>, opts?: UseBoundAsyncStoreOptions): QueryValue<R>;
  /**
   * Select an effect from the store. Handle async data concerns:
   *   - Trigger suspense when the effect is loading
   *   - Consider dependencies
   * @param selector Select the effect from the store.
   * @param opts Options
   */
    <Args extends any[] = []>(selector: (state: T) => Effect<T, Args>, opts?: UseBoundAsyncStoreOptions): () => Promise<void>
}
```

### QueryValue&lt;T&gt;

Information about a query when not using Suspense.

```typescript
interface QueryValue<T> {
    /** The current value returned by the query. */
    value: T | undefined;
    /** Indicates if the query is currently fetching data. */
    isLoading: boolean;
    /** Error caught in the promise. */
    error: any | undefined;
}
```