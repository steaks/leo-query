# Getting Started

Welcome to the **Leo Query** documentation! This guide will help you integrate async queries into your app in minutes.

## Installation

```bash
npm i leo-query
```

## Getting Started

Hook up async queries in three steps: 
- Write async functions. 
- Connect your store. 
- Bind your components.

```typescript
/**********************************************************
 * Write async functions                                  *
 **********************************************************/
const fetchDogs = (): Promise<number> => 
  fetch('https://good.dog.com/dogs').then(r => r.json());

const increasePopulation = (): Promise<void> =>
  fetch('https://good.dog.com/increasePopulation', {method: "POST"});

const removeAllDogs = (): Promise<void> =>
  fetch('https://good.dog.com/removeAllDogs', {method: "POST"});

/**********************************************************
 * Connect your store                                     *
 **********************************************************/

interface DogsState {
  dogs: Query<DogsState, number>;
  increasePopulation: Effect<DogsState, []>;
  removeAllDogs: Effect<DogsState, []>;
}

const useBearStore = create(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) // Re-fetch when increasePopulation or removeAllDogs succeeds 
}));

const useBearStoreAsync = hook(useBearStore);

/**********************************************************
 * Bind your components                                   *
 **********************************************************/

const BearCounter = () => {
  const dogs = useBearStoreAsync(s => s.dogs);
  return <h1>{dogs} around here ...</h1>;
}

const Controls = () => {
  const increasePopulation = useBearStore(s => s.increasePopulation.trigger);
  return <button onClick={increasePopulation}>one up</button>;
}

const App = () => {
  return (
    <>
      {/* Leo Query works with Suspense */}
      <Suspense fallback={<h1>Loading...</h1>}>
        <BearCounter />
      </Suspense>
      <Controls />
    </>
  );
}
```


## Why Leo?

Leo Query is simple, robust, and designed for Zustand. Read more about why Leo Query is different from other libraries in [Why Leo Query?](/why).