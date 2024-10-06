# Hook

The `hook` function connects asynchronous **queries** and **effects** to a Zustand store, managing their lifecycle within React components. It supports both data-fetching operations (queries) and side effects (effects) while integrating with React's Suspense for seamless loading states.

## Syntax

```typescript
hook<T extends object>(store: UseBoundStore<StoreApi<T>>): UseBoundAsyncStore<T>
```

## Parameters

- **`fn: (...args: Args) => Promise<void>`**  
  The asynchronous function that performs the side effect. It can be an HTTP request or any promise.

## Returns

- **`UseBoundAsyncStore<T>`**
  Function to hook into the store, managing asynchronous queries and effects. 

## Example Usage
### Basic Example
```typescript
const fetchBears = () => fetch('/api/bears').then(res => res.json());

const useBearStore = create(() => ({
  bears: query(fetchBears)
}));

const useBearStoreAsync = hook(useBearStore);

const BearCounter = () => {
  const bears = useBearStoreAsync(state => state.bears);
  return <h1>{bears} bears around here...</h1>;
};
```

### Example with Dependencies
```typescript
const fetchBears = () => fetch('/api/bears').then(res => res.json());
const increaseBearCount = () => fetch('/api/increase', { method: 'POST' });

const useBearStore = create(() => ({
  bears: query(fetchBears, s => [s.increaseBearCount]),
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

In this example:
- The bears query depends on increaseBearCount. When increaseBearCount is triggered, the bears query will automatically re-fetch.