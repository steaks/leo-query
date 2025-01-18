import React, {Suspense} from 'react';
import {create} from "zustand";
import {hook, effect, query, Query, Effect} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs} from "./db";
import "./App.css";


interface DogsState {
  dogs: Query<DogsState, number>;
  increasePopulation: Effect<DogsState, []>;
  removeAllDogs: Effect<DogsState, []>;
}

const useBearStore = create<DogsState>(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]),
  })
);

const useBearStoreAsync = hook(useBearStore);

function BearCounter() {
  const dogs = useBearStoreAsync(state => state.dogs);
  return <h1 className="bear-counter">{dogs} around here...</h1>;
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