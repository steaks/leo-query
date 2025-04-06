# Manual Updates

Sometimes you may want to manually update query data rather than trigger an async query to fetch data. You can use `setValueSync` to update query data. You can use `setValueSync` inside or outside of a React component. This is most commonly used to implement optimitic updates.

## Usage

### Set value in a useEffect

```typescript
const useDogStore = create<DogsState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs], {initialValue: 100}) 
}));

const useDogStoreAsync = hook(useDogStore);

const MyComponent = () => {
  useEffect(() => {
    useDogStore.getState().dogs.setValueSync(100):
  }, []);
};
```

### Set value outside of react

```typescript
const useDogStore = create<DogsState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs], {initialValue: 100}) 
}));

useDogStore.getState().dgos.setValueSync(100);
```