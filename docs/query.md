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

- **options?: QueryOptions**  
*Optional.* An object containing additional configuration options for the query.

#### QueryOptions

- **lazy?: boolean**  
*Optional.* If set to `true`, the query will fetch data as needed. Default is `true`.
- **debounce?: number**  
  *Optional.* Debounce time in milliseconds before next fetch. Default is 300 ms.

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

const useBearStoreAsync = hook(useBearStore);

const BearCounter = () => {
  const bears = useBearStoreAsync(state => state.bears);
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

### Example with Query Parameters

```
const fetchBears = (get) => async () => {
  const location = get().location;
  const res = await fetch(`/api/bears?location=${location}`);
  return await res.json();
};

const useBearStore = create((set, get) => ({
  bears: query(fetchBears(get), s => [s.location]),
  location: "Colorado"
}));
```

In this example:
  - The bears query is location specific. It uses Zustand getStore function to access location from the store to query bears for a specific location.

### Key Features
- Automatic re-fetching: Queries automatically re-fetch when dependencies change.
- Caching: Queries cache results, reducing redundant requests.
- Integrated with Zustand: No need for extra hooks like useEffect to handle async logic inside components.