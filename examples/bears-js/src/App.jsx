import React, {Suspense} from 'react';
import {create} from "zustand";
import {hook, effect, query} from "leo-query";
import {fetchBears, increasePopulation, removeAllBears} from "./db";


const useBearStore = create(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllBears: effect(removeAllBears),
  bears: query(fetchBears, s => [s.increasePopulation, s.removeAllBears])
}));

const useBearStoreAsync = hook(useBearStore);

function BearCounter() {
  const bears = useBearStoreAsync(state => state.bears);
  return <h1>{bears} around here ...</h1>;
}

function Controls() {
  const increasePopulation = useBearStore(state => state.increasePopulation.trigger)
  return <button onClick={increasePopulation}>one up</button>;
}

function App() {
  return (
    <>
      <Suspense fallback={<h1>Loading...</h1>}>
        <BearCounter/>
      </Suspense>
      <Controls/>
    </>
  );
}

export default App;