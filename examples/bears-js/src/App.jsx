import React, {Suspense} from 'react';
import {create} from "zustand";
import {subscribe, effect, query} from "leo-query";
import {bears, increasePopulation, removeAllBears} from "./db";


const useBearStore = create((set, get, store) => ({
  increasePopulation: effect(store, increasePopulation, []),
  removeAllBears: effect(store, removeAllBears, []),
  bears: query(store, bears, ["increasePopulation", "removeAllBears"])
}));

const useBearStoreAsync = subscribe(useBearStore);

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