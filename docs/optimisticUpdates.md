# Optimistic Updates

Optimistically updating the UI without waiting for the server can create a more responsive user experience. Leo Query supports optimistic updates. To implement an optimistic update implement these steps in your effect:

- Update the Zustand store
- Execute the async action
- Revert the Zustand store if the async action fails

## Usage

### Basic Example

This is an example of an optimistic update with dogs.

```typescript
interface DogsState {
  dogs: Query<DogsState, number>;
  increaseDogs: Effect<DogsState, []>;
}

const api = {
  fetchDogs: async () => fetch("/api/dogs"),
  increaseDogs: async () => fetch("/api/dogs/increase", {method: "POST"}),
};

const increaseDogs = (set: (s: Partial<DogsState> => void), get: () => DogsState) => async () => {
  const dogs = get().dogs;
  dogs.setValueSync({value: dogs.value + 1});
  try {
    await api.increaseDogs();
  } catch (error) {
    dogs.setValueSync({value: dogs.value - 1});
  }
};

const useDogStore = create((set, get) => ({
  dogs: query(api.fetchDogs, s => [s.increaseDogs]),
  increaseDogs: effect(increaseDogs(set, set))
}));

const useDogStoreAsync = hook(useDogStore, /*suspense*/ false);

const MyComponent = () => {
  const dogs = useDogStoreAsync(s => s.dogs);
  const increaseDogs = useDogStoreAsync(s => s.increaseDogs);

  //First load, show loading indicator
  if (dogs.value === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Subsequent loads, ignore isLoading because we optimistically updated the value. */}
      <button onClick={increaseDogs.value}>Increase Dogs</button>
    </>
  );
};
```
