# Optimistic Updates

Optimistically updating the UI without waiting for the server can create a more responsive user experience. Leo Query supports optimistic updates. To implement an optimistic update implement these steps in your effect:

- Update the Zustand store
- Execute the async action
- Revert the Zustand store if the async action fails

## Usage

### Basic Example

This is an example of an optimistic update with bears.

```typescript
interface BearsState {
  bears: Query<BearsState, number>;
  increaseBears: Effect<BearsState, []>;
}

const api = {
  fetchBears: async () => fetch("/api/bears"),
  increaseBears: async () => fetch("/api/bears/increase", {method: "POST"}),
};

const increaseBears = (set: (s: Partial<BearsState> => void), get: () => BearsState) => async () => {
  const bears = get().bears;
  set({bears: {...bears, value: bears.value + 1}});
  try {
    await api.increaseBears();
  } catch (error) {
    set({bears: {...bears, value: bears.value - 1}});
  }
};

const useBearStore = create((set, get) => ({
  bears: query(api.fetchBears, s => [s.increaseBears]),
  increaseBears: effect(increaseBears(set, set))
}));

const useBearStoreAsync = hook(useBearStore, /*suspense*/ false);

const MyComponent = () => {
  const bears = useBearStoreAsync(s => s.bears);
  const increaseBears = useBearStoreAsync(s => s.increaseBears);

  //First load, show loading indicator
  if (bears.value === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Subsequent loads, ignore isLoading because we optimistically updated the value. */}
      <button onClick={increaseBears.value}>Increase Bears</button>
    </>
  );
};
```