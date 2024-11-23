# Query

The `query` function allows you to integrate asynchronous queries with Zustand stores, handling data fetching, caching, dependencies, debouncing, retrying, and state management.

## Usage
### Basic Example

Fetch data from an API and store it in Zustand.

```typescript
const fetchBears = () => fetch('/api/bears').then(res => res.json());

const useBearStore = create(() => ({
  bears: query(fetchBears) // Fetch bears when the BearCounter component is mounted
}));

const useBearStoreAsync = hook(useBearStore);

const BearCounter = () => {
  const bears = useBearStoreAsync(state => state.bears);
  return <h1>{bears} bears around here...</h1>;
};
```

### Example with Dependencies

Fetch data from an API and store it in Zustand. Then re-fetch when the `increaseBearCount` effect successfully completes.

```typescript
const fetchBears = () => fetch('/api/bears').then(res => res.json());
const increaseBearCount = () => fetch('/api/increase', { method: 'POST' });

const useBearStore = create(() => ({
  bears: query(fetchBears, s => [s.increaseBearCount]), // Fetch bears when increaseBearCount effect completes
  increaseBearCount: effect(increaseBearCount)
}));

const useBearStoreAsync = hook(useBearStore);

const BearCounter = () => {
  const bears = useBearStoreAsync(state => state.bears);
  return <h1>{bears} bears around here...</h1>;
};

const Controls = () => {
  const increase = useBearStore(state => state.increaseBearCount.trigger);
  return <button onClick={increase}>Increase bear count</button>;
};
```

### Example with Query Parameters

Fetch data from an API and store it in Zustand. Then re-fetch when the `location` changes. And pass location as a parameter to the HTTP request.

```typescript
const fetchBears = (get) => async () => {
  const location = get().location; // Get location from Zustand
  const res = await fetch(`/api/bears?location=${location}`);
  return await res.json();
};

const useBearStore = create((set, get) => ({
  bears: query(fetchBears(get), s => [s.location]), // Fetch bears when location changes
  location: "Colorado"
}));
```

## API Reference

```typescript
query<Store extends object, R>(fn: () => Promise<R>, deps?: Dependencies<Store>): Query<Store, R>;
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `() => Promise<R>` | The async function that fetches the data, such as an HTTP request. |
| `deps` | `Dependencies<Store>` | *Optional.* Specifies store dependencies that trigger re-fetching when changed. |
| `options` | `QueryOptions` | *Optional.* An object containing additional configuration options for the query. |

#### QueryOptions
The `QueryOptions` interface provides configuration options to customize query behavior:

```typescript
interface QueryOptions {
  /** If set to true, the query will fetch data as needed. @default true */
  lazy?: boolean;
  /** The delay (in ms) between query triggers. @default 300ms */
  debounce?: number;
  /** Max number of retries or a function that overrides the default retry behavior */
  retry?: number | ((attempt: number, error: any) => boolean);
  /** A function that overrides the default retry delay behavior */
  retryDelay?: (attempt: number) => number;
  /** Time in ms before data is considered stale */
  staleTime?: number;
}
```

### Dependencies

The `deps` parameter allows you to specify dependencies that will trigger the query to re-fetch when they change:

```typescript
/**
 * Dependencies for triggering a query. When one of the dependencies changes the query will be triggered.
 *
 * @param s - The current store state.
 * @returns An array of Query, Effect, or primitive values
 */
type Dependencies<Store> = (s: Store) => (Query<Store, any> | Effect<Store, any> | Primitive)[];
```

Where `Primitive` is defined as:
```typescript
type Primitive = string | number | boolean | null | undefined | bigint | symbol;
```

### Returns

**`Query<Store, R>`**  
An object representing the query, including methods and state information.

#### Query

```typescript
export interface Query<State, T> {
    /** The current value returned by the query. */
    value: T | undefined;
    /** Indicates if the query is currently fetching data. */
    isLoading: boolean;
    /** Error caught in the promise. */
    error: any | undefined;
    /** Manually triggers the query. */
    trigger: () => Promise<T>;
    /** Mark the data as stale (i.e. needs a load). */
    markStale: () => void;
}
```