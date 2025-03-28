# Initial Data

Sometimes you may want to set initial data for your queries. You have three options to set initial data. 1) Use the `initialValue` property, 2) Set manually with `setValueSync` or 3) Pull [persisted data store](./persistingData).

## Usage

### InitialValue Example
Pass initialValue as an option to the query.

```typescript
const useDogStore = create<DogsState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs], {initialValue: 100}) // Re-fetch when increasePopulation or removeAllDogs succeeds 
}));
```

### SetValueSync Example
Call setValueSync to populate a query with a value. This can be invoked inside or outside a React component.

```typescript
const useDogStore = create<DogsState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) // Re-fetch when increasePopulation or removeAllDogs succeeds 
}));

useDogStore.getState().dogs.setValueSync({value: 100});
```