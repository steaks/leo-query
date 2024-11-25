# Caching

Leo Query leverages the Zustand store to implement caching. When a query successfully completes Leo Query saves the data in the Zustand store. Cached data is evicted when new data is successfully fetched. Cached data may be marked stale when [dependencies](/query#dependencies) change, the stale time expires, or manually by calling `markStale()`.

## Stale Time

The default stale time is infinite - data never becomes stale. You can set the data to be marked stale `staleTime`:

```typescript
// Global stale time applied to all queries
config({staleTime: 60000}); // 1 minute

// Query-specific stale time (overrides global stale time)
query(fetchBears, s => [], {staleTime: 60000}); // 1 minute
```

## Mark Stale Manually

You can manually mark a query stale by calling `markStale()`.

```typescript
const useBearsStoreAsync = hook(useBearStore, /*suspense*/ false);

const MyComponent = () => {
  const bears = useBearsStoreAsync(fetchBears, s => []);

  const markBearsStale = () => {
    bears.markStale();
  };

  return <button onClick={markBearsStale}>Mark Bears Stale</button>
};
```

## Stale Data Lifecycle

When a query is marked stale, the cached data remains available in the `value` property until the query is refreshed. If the query is configured to be lazy, it will be refreshed when the data is next accessed. If the query is not configured to be lazy, it will be refreshed immediately.