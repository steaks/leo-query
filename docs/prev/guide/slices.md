# Slices

Queries and effects work like normal with slices. Just pass in the bound store type as the first generic parameter to your query or effect. Queries and effects have access to the full store.

## Example

This is an example with three slices and queries/effects in each slice. See the full example [here](https://codesandbox.io/p/sandbox/gsfqs3).

```typescript
interface DogSlice {
  dogs: Query<FullStore, number>;
  increasePopulation: Effect<FullStore>;
  removeAllDogs: Effect<FullStore>;
}

interface CatSlice {
  cats: Query<FullStore, number>;
}

interface SharedSlice {
  removeAllPets: Effect<FullStore>;
}

type FullStore = DogSlice & CatSlice & SharedSlice;

const createDogSlice: StateCreator<FullStore, [], [], DogSlice> = () => ({
  dogs: query(fetchDogs, s => [
    s.increasePopulation,
    s.removeAllDogs,
    s.removeAllPets,
  ]),
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
});

const createCatSlice: StateCreator<FullStore, [], [], CatSlice> = () => ({
  cats: query(fetchCats, s => [s.removeAllPets]),
});

const createSharedSlice: StateCreator<FullStore, [], [], SharedSlice> = () => ({
  removeAllPets: effect(removeAllPets),
});

const useBoundStore = create<FullStore>()((...a) => ({
  ...createDogSlice(...a),
  ...createCatSlice(...a),
  ...createSharedSlice(...a),
}));

const useBoundStoreAsync = hook(useBoundStore);

function MyComponent() {
  const [dogs, cats] = useBoundStoreAsync([s => s.dogs, s => s.cats]);
  return <h1 className="dog-counter">{dogs} dogs around here. {cats} cats around here...</h1>;
}
```
