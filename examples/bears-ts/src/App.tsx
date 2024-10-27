import React, {Suspense} from 'react';
import {create} from "zustand";
import {Query, Effect} from "leo-query/types";
import {hook, effect, query} from "leo-query";
import {fetchBears, increasePopulation, removeAllBears} from "./db";
import "./App.css";

interface BearsState {
  bears: Query<BearsState, number>;
  increasePopulation: Effect<BearsState, []>;
  removeAllBears: Effect<BearsState, []>;
}

const useBearStore = create<BearsState>(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllBears: effect(removeAllBears),
    bears: query(fetchBears, s => [s.increasePopulation, s.removeAllBears]),
  })
);

const useBearStoreAsync = hook(useBearStore);

function BearCounter() {
  const bears = useBearStoreAsync(state => state.bears);
  return <h1 className="bear-counter">{bears} around here...</h1>;
}

function Loading () {
  return <h1 className="bear-counter">Loading...</h1>;
}

function Controls() {
  const increasePopulation = useBearStore(state => state.increasePopulation.trigger)
  return <button className="cool-button" onClick={increasePopulation}>one up</button>;
}

function App() {
  return (
    <div className="app-container">
      <img
        className="leo-logo"
        src="https://leoquery.com/leo-without-background.png"
        alt="Leo Logo"
      />
      <div className="bear-counter-container">
        <Suspense fallback={<Loading />}>
          <BearCounter/>
        </Suspense>
    </div>
  <Controls/>
</div>
)
  ;
}

export default App;