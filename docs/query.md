# Query

The `query` function allows you to integrate asynchronous queries with Zustand stores, handling data fetching, caching, dependencies, debouncing, retrying, and state management.

## Usage
### Basic Example

Fetch data from an API and store it in Zustand.

```typescript
const fetchDogs = () => fetch('/api/dogs').then(res => res.json());

const useDogStore = create(() => ({
  dogs: query(fetchDogs) // Fetch dogs when the DogCounter component is mounted
}));

const useDogStoreAsync = hook(useDogStore);

const DogCounter = () => {
  const dogs = useDogStoreAsync(state => state.dogs);
  return <h1>{dogs} dogs around here...</h1>;
};
```

### Example with Dependencies

Fetch data from an API and store it in Zustand. Then re-fetch when the `increaseDogCount` effect successfully completes.

```typescript
const fetchDogs = () => fetch('/api/dogs').then(res => res.json());
const increaseDogCount = () => fetch('/api/increase', { method: 'POST' });

const useDogStore = create(() => ({
  dogs: query(fetchDogs, s => [s.increaseDogCount]), // Fetch dogs when increaseDogCount effect completes
  increaseDogCount: effect(increaseDogCount)
}));

const useDogStoreAsync = hook(useDogStore);

const DogCounter = () => {
  const dogs = useDogStoreAsync(state => state.dogs);
  return <h1>{dogs} dogs around here...</h1>;
};

const Controls = () => {
  const increase = useDogStore(state => state.increaseDogCount.trigger);
  return <button onClick={increase}>Increase dog count</button>;
};
```

### Example with Query Parameters

Fetch data from an API and store it in Zustand. Then re-fetch when the `location` changes. And pass location as a parameter to the HTTP request.

```typescript
const fetchDogs = (get) => async () => {
  const location = get().location; // Get location from Zustand
  const res = await fetch(`/api/dogs?location=${location}`);
  return await res.json();
};

const useDogStore = create((set, get) => ({
  dogs: query(fetchDogs(get), s => [s.location]), // Fetch dogs when location changes
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
    /** The initial value of the query. */
  initialValue?: T;
}
```

### Dependencies

The `deps` parameter allows you to specify dependencies of the query. When a dependency changes the query will be marked as stale. If the query is configured to be lazy it will re-fetch when the data is next accessed. If the query is not configured to be lazy it will re-fetch immediately.

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
    /** Manually set the value of the query synchronously. This is useful for optimistic updates, setting initial values, or setting values loaded in server components.
     * 
     * @param value - The value to set.
     * @param options - Options for the update.
     * @returns The updated query.
     */
    setValueSync: (value: T, options?: SetValueSyncOptions) => Query<State, T>;

}
```

#### SetValueSyncOptions
```typescript
export interface SetValueSyncOptions {
    /** If `true`, the store will be updated with the new value. Defaults to `true`. */
    readonly updateStore?: boolean;
}
```