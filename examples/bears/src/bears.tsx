import React, {Suspense} from 'react';
import './App.css';
import {create} from "zustand";
import {Query, Effect} from "leo-query/types";
import {subscribe, effect, query} from "leo-query";
import {bears, increasePopulation, removeAllBears} from "./db";

interface BearsState {
  tab: string;
  bears: Query<BearsState, number>;
  increasePopulation: Effect<BearsState>;
  removeAllBears: Effect<BearsState>;
}

const useBearStore = create<BearsState>((set, get, store) => ({
  tab: "",
  increasePopulation: effect<BearsState>(store, increasePopulation, []),
  removeAllBears: effect<BearsState>(store, removeAllBears, []),
  bears: query<BearsState, number>(store, bears, ["increasePopulation", "removeAllBears"])
}));

const useBearStoreAsync = subscribe(useBearStore);

function BearCounter() {
  const bears = useBearStoreAsync(state => state.bears);
  useBearStoreAsync(s => s.increasePopulation)
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
