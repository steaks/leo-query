<p align="center">
  <img src="./assets/leo.png" height="300">
</p>

A simple library to connect async queries to Zustand stores.

Try a live demo [here](https://codesandbox.io/p/sandbox/leo-query-dogs-demo-js-wmwlgt?file=%2Fsrc%2FApp.jsx). And see full documentation [here](https://leoquery.com). And chat on discord [here](https://discord.gg/aucYm6hMsJ).

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

const useDogsStore = create(() => ({
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

## Examples

| Example                                                                                           | Description                        |
|---------------------------------------------------------------------------------------------------|------------------------------------|
| [Dogs JS](https://codesandbox.io/p/sandbox/leo-query-dogs-demo-js-wmwlgt?file=%2Fsrc%2FApp.jsx) | A simple bear counter (Javascript) |
| [Dogs TS](https://codesandbox.io/p/sandbox/leo-query-dogs-demo-ts-7f2c34?file=%2Fsrc%2FApp.tsx) | A simple bear counter (Typescript) |
| [Task Manager](https://xsh8c4.csb.app/)                                                           | A more complex task manager app.   |
