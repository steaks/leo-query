# Parallel Queries

Querying data in parallel is critical for responsive user experience. In suspense mode, you must use one hook to query data in parallel. Multiple hooks will cause a waterfall because each hook interrupts the render cycle as it puts the component in suspense by throwing the promise as it loads.

## Example with Suspense Mode

Use one hook with multiple queries for the best performance in suspense mode.

```typescript {10}
const useDogStore = create<PetsState>(() => ({
  dogs: query(fetchDogs),
  cats: query(fetchCats)
}));

const useDogStoreAsync = hook(useDogStore); //suspense mode is true by default

const MyComponent = () => {
  //dogs and cats are fetched in parallel
  const [dogs, cats] = useDogStoreAsync([s => s.dogs, s => s.cats]);
};

const SlowComponent = () => {
  //Cats waits for dogs to load before sending off the cats request. Slow!!!
  const dogs = useDogStoreAsync(s => s.dogs);
  const cats = useDogStoreAsync(s => s.cats);
}
```

## Example without Suspense Mode

Use either pattern when not in suspense mode. Both are equally performant.

```typescript
const useDogStore = create<PetsState>(() => ({
  dogs: query(fetchDogs),
  cats: query(fetchCats)
}));

const useDogStoreAsync = hook(useDogStore, /*suspense*/false);

const MyComponent = () => {
  //Dogs and cats are fetched in parallel
  const [dogs, cats] = useDogStoreAsync([s => s.dogs, s => s.cats]);
};

const MyComponent2 = () => {
  //Dogs and cats are still fetched in parallel
  const dogs = useDogStoreAsync(s => s.dogs);
  const cats = useDogStoreAsync(s => s.cats);
}
```