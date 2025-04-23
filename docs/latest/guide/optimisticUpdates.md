# Optimistic Updates

Optimistically updating the UI without waiting for the server can create a more responsive user experience. Leo Query supports optimistic updates. To implement an optimistic update implement these steps in your effect:

- Update the Zustand store
- Execute the async action
- Revert the Zustand store if the async action fails

## Usage

### Basic Example

This is an example of an optimistic update with dogs.

```typescript
interface DogState {
  dogs: Query<DogState, number>;
  increaseDogs: Effect<DogState>;
}

const api = {
  fetchDogs: async () => fetch("/api/dogs"),
  increaseDogs: async () => fetch("/api/dogs/increase", {method: "POST"}),
};

const increaseDogs = (set: (s: Partial<DogState> => void), get: () => DogState) => async () => {
  const dogs = get().dogs;
  dogs.setValue({value: dogs.value + 1});
  try {
    await api.increaseDogs();
  } catch (error) {
    dogs.setValue({value: dogs.value - 1});
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
