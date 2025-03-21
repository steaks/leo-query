<p align="center">
  <img src="./assets/leo.png" height="300">
</p>

A simple library to connect async queries to Zustand stores.

Try a live demo [here](https://codesandbox.io/p/sandbox/leo-query-dogs-demo-js-wmwlgt?file=%2Fsrc%2FApp.jsx). And see full documentation [here](https://leoquery.com). And chat on discord [here](https://discord.gg/aucYm6hMsJ).

## Install 

```bash
npm i leo-query
```

## Write async functions

Write async functions like you normally would. These can use your favorite http library (e.g. fetch, axios).

```ts
const fetchDogs = (): Promise<number> => 
  fetch('https://good.dog.com/dogs').then(r => r.json());

const increasePopulation = (): Promise<void> =>
  fetch('https://good.dog.com/increasePopulation', {method: "POST"});

const removeAllDogs = (): Promise<void> =>
  fetch('https://good.dog.com/removeAllDogs', {method: "POST"});
```

## Connect your store

Create a Zustand store. Connect your async functions with Leo Query's `query` and `effect` functions. Then create an async hook to handle loading and error states in your components.

```typescript
import {create} from "zustand";
import {effect, query, hook, Query, Effect} from "leo-query";

interface DogsState {
  dogs: Query<DogsState, number>;
  increasePopulation: Effect<DogsState, []>;
  removeAllDogs: Effect<DogsState, []>;
}

const useDogStore = create<DogsState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) // Re-fetch when increasePopulation or removeAllDogs succeeds 
}));

const useDogStoreAsync = hook(useDogStore);
```

## Bind your components

Use the async hook when you need to handle loading states and errors. Use the normal Zustand hook when you don't.

```tsx
const DogCounter = () => {
  const dogs = useDogStoreAsync(s => s.dogs);
  return <h1>{dogs} around here ...</h1>;
}

const Controls = () => {
  const increasePopulation = useDogStore(s => s.increasePopulation.trigger);
  return <button onClick={increasePopulation}>one up</button>;
}

const App = () => {
  return (
    <>
      {/* Leo Query works with Suspense */}
      <Suspense fallback={<h1>Loading...</h1>}>
        <DogCounter />
      </Suspense>
      <Controls />
    </>
  );
};
```
## Try Leo Query
<center>
  <a href="https://codesandbox.io/p/sandbox/leo-query-dogs-demo-ts-7f2c34">Try it out in codesandbox.io</a>
</center>



## Why Leo?

Leo Query is simple, robust, and designed for Zustand. Read more about why Leo Query is different from other libraries in [Why Leo Query?](/why).

## Examples

| Example                                                                                           | Description                        |
|---------------------------------------------------------------------------------------------------|------------------------------------|
| [Dogs JS](https://codesandbox.io/p/sandbox/leo-query-dogs-demo-js-wmwlgt?file=%2Fsrc%2FApp.jsx) | A simple dog counter (Javascript) |
| [Dogs TS](https://codesandbox.io/p/sandbox/leo-query-dogs-demo-ts-7f2c34?file=%2Fsrc%2FApp.tsx) | A simple dog counter (Typescript) |
| [Task Manager](https://xsh8c4.csb.app/)                                                           | A more complex task manager app.   |
