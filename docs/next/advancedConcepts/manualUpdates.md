# Manual Updates

Sometimes you may want to manually update query data rather than trigger an async query to fetch data. You can use `setValue` to update query data. You can use `setValue` inside or outside of a React component. This is most commonly used to implement optimitic updates.

## Usage

### Set value in a useEffect

```typescript
const useDogStore = create<DogState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) 
}));

const useDogStoreAsync = hook(useDogStore);

const MyComponent = () => {
  useEffect(() => {
    useDogStore.getState().dogs.setValue(100):
  }, []);
};
```

### Set value outside of react

```typescript
const useDogStore = create<DogState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) 
}));

useDogStore.getState().dogs.setValue(100);
```

### Batch updates

You can batch updates manually. When you batch use Zustand's built-in `set` or `setState` functions to update the store. Use `withValue` rather than `setValue` to get an updated query with out updating the store.

```typescript
const useDogStore = create<DogState>(() => ({
  smallDogs: query(fetchSmallDogs, s => [s.increasePopulation, s.removeAllDogs]),
  largeDogs: query(fetchLargeDogs, s => [s.increasePopulation, s.removeAllDogs]),
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
}));

useDogStore.setState(state => {
  return {
    dogs: state.dogs.withValue(100),
    cats: state.cats.withValue(100),
  };
})
```
