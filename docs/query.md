# Query

The `query` function allows you to integrate asynchronous queries with Zustand stores, handling data fetching, dependencies, and state management.

## Syntax

```
query<Store extends object, R>(fn: () => Promise<R>, deps?: Dependencies<Store>): Query<Store, R>;
```

### Parameters

- **fn: () => Promise<R>**  
The async function that fetches the data, such as an HTTP request.

- **deps?: Dependencies<Store>**  
*Optional.* Specifies store dependencies that trigger re-fetching when changed.

### Returns

**Query<Store, R>**  
An object representing the query, including methods and state information.

### Query Object Properties

- **trigger(): Promise<R>**  
  Manually triggers the query, executing the function `fn`.

- **isLoading: boolean**  
  Indicates if the query is currently fetching data.

- **value: R**  
  Holds the result of the query once it resolves.

## Example Usage
### Basic Example
```
const fetchBears = () => fetch('/api/bears').then(res => res.json());

const useBearStore = create(() => ({
  bears: query(fetchBears)
}));

const BearCounter = () => {
  const bears = useBearStore(state => state.bears);
  return <h1>{bears} bears around here...</h1>;
};
```

### Example with Dependencies
```
const fetchBears = () => fetch('/api/bears').then(res => res.json());
const increaseBearCount = () => fetch('/api/increase', { method: 'POST' });

const useBearStore = create(() => ({
  bears: query(fetchBears, s => [s.increaseBearCount]),
  increaseBearCount: effect(increaseBearCount)
}));

const BearCounter = () => {
  const bears = useBearStore(state => state.bears);
  return <h1>{bears} bears around here...</h1>;
};

const Controls = () => {
  const increase = useBearStore(state => state.increaseBearCount.trigger);
  return <button onClick={increase}>Increase bear count</button>;
};
```

In this example:
- The bears query depends on increaseBearCount. When increaseBearCount is triggered, the bears query will automatically re-fetch.

### Key Features
- Automatic re-fetching: Queries automatically re-fetch when dependencies change.
- Caching: Queries cache results, reducing redundant requests.
- Integrated with Zustand: No need for extra hooks like useEffect to handle async logic inside components.