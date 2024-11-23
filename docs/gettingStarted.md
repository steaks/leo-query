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
const fetchBears = (): Promise<number> => 
  fetch('https://good.dog.com/bears').then(r => r.json());

const increasePopulation = (): Promise<void> =>
  fetch('https://good.dog.com/increasePopulation', {method: "POST"});

const removeAllBears = (): Promise<void> =>
  fetch('https://good.dog.com/removeAllBears', {method: "POST"});

/**********************************************************
 * Connect your store                                     *
 **********************************************************/

interface BearsState {
  bears: Query<BearsState, number>;
  increasePopulation: Effect<BearsState, []>;
  removeAllBears: Effect<BearsState, []>;
}

const useBearStore = create(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllBears: effect(removeAllBears),
  bears: query(fetchBears, s => [s.increasePopulation, s.removeAllBears]) // Re-fetch when increasePopulation or removeAllBears succeeds 
}));

const useBearStoreAsync = hook(useBearStore);

/**********************************************************
 * Bind your components                                   *
 **********************************************************/

const BearCounter = () => {
  const bears = useBearStoreAsync(s => s.bears);
  return <h1>{bears} around here ...</h1>;
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