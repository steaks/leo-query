import React, {Suspense, useEffect} from 'react';
import {create} from "zustand";
import {persist} from "zustand/middleware";
import {hook, effect, query, partialize, merge, Query, Effect} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs} from "./db";
import "./App.css";

interface DogsState {
  dogs: Query<DogsState, number>;
  increasePopulation: Effect<DogsState, []>;
  removeAllDogs: Effect<DogsState, []>;
}

const useDogStore = create<DogsState>()(persist(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]),
  }), {
    name: "dogs-storage",
    merge,
    partialize
  })
);

// const foo: UseBoundStore<Write<StoreApi<DogsState>, StorePersist<DogsState, Partial<DogsState>>>> = useDogStore;

const useDogStoreAsync = hook<DogsState>(useDogStore);

function DogCounter() {
  useEffect(() => {
    useDogStore.setState(state => {
      return {
        dogs: state.dogs.setValueSync(100, {updateStore: false})
      };
    });
  }, []);
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
)
  ;
}

export default App;