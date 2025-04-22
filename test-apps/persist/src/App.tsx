import React, {Suspense} from 'react';
import {create} from "zustand";
import {persist} from "zustand/middleware";
import {hook, effect, query, partialize, merge, Query, Effect} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs} from "./db";
import "./App.css";
import { syncMockDb } from "./syncmockdb";

interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState>;
  removeAllDogs: Effect<DogState>;
}

export const useDogStore = create<DogState>()(persist(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]),
  }), {
    name: "dogs-storage",
    merge,
    partialize
  })
);

const useDogStoreAsync = hook<DogState>(useDogStore);

function DogCounter() {
  const dogs = useDogStoreAsync(state => state.dogs);
  return <h1 className="dog-counter">{dogs} around here...</h1>;
}

function Loading () {
  return <h1 className="dog-counter">Loading...</h1>;
}

function Controls() {
  const increasePopulation = useDogStore(state => state.increasePopulation.trigger)
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
      <div className="dog-counter-container">
        <Suspense fallback={<Loading />}>
          <DogCounter/>
        </Suspense>
      </div>
      <Controls/>
    </div>
  );
}

syncMockDb();

export default App;