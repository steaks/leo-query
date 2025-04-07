# Initial Data

Sometimes you may want to set initial data for your queries. You can set initial data at store creation time or in your React component hook.

## Usage

### Store creation
Pass initialValue as an option to the query.

```typescript
const useDogStore = create<DogsState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs], {initialValue: 100}) 
}));
```

### Hook
Pass initialValue in your React component
```
const useDogStore = create<DogsState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs])
}));

const useDogStoreAsync = hook(useDogStore);

const MyComponent = () => {
  const dogs = useDogStoreAsync(s => s.dogs, {initialValue: 100});
};
```