import React, {Suspense} from 'react';
import './App.css';
import {create} from "zustand";
import {subscribe, effect, query} from "leo-query";
import {bears, increasePopulation, removeAllBears} from "./db2";


const useBearStore = create((set, get, store) => ({
  increasePopulation: effect(store, increasePopulation, []),
  removeAllBears: effect(store, removeAllBears, []),
  bears: query(store, bears, ["increasePopulation", "removeAllBears"])
}));

subscribe(useBearStore);

function BearCounter() {
  const bears = useSuspense(useBearStore(state => state.bears));
  useSuspense(useBearStore(state => [state.increasePopulation, state.removeAllBears]));
  return <h1>{bears} around here ...</h1>;
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
