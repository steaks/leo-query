import React, {Suspense} from 'react';
import {create} from "zustand";
import {Query, Effect} from "leo-query/types";
import {subscribe, effect, query} from "leo-query";
import {fetchBears, increaseMultiplePopulation, increasePopulation, removeAllBears} from "./db";

interface BearsState {
  bears: Query<BearsState, number>;
  increasePopulation: Effect<BearsState, []>;
  increaseMultiplePopulation: Effect<BearsState, [number]>;
  removeAllBears: Effect<BearsState, []>;
}

const useBearStore = create<BearsState>(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllBears: effect(removeAllBears),
    bears: query(fetchBears, s => [s.increasePopulation, s.increaseMultiplePopulation, s.removeAllBears]),
    increaseMultiplePopulation: effect(increaseMultiplePopulation)
  })
);

const useBearStoreAsync = subscribe(useBearStore);

function BearCounter() {
  const bears = useBearStoreAsync(state => state.bears);
  return <h1>{bears} around here ...</h1>;
}

function Controls() {
  const increasePopulation = useBearStore(state => state.increaseMultiplePopulation.trigger)
  return <button onClick={() => increasePopulation(2)}>one up</button>;
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