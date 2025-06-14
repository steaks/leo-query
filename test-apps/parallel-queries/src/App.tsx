import React, {Suspense} from 'react';
import {create} from "zustand";
import {hook, effect, query, Query, Effect} from "leo-query";
import {fetchDogs, fetchCats, increasePopulation, removeAllDogs} from "./db";
import "./App.css";

interface DogState {
  cats: Query<DogState, number>;
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState>;
  removeAllDogs: Effect<DogState>;
}

const useDogStore = create<DogState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs], {lazy: false}),
  cats: query(fetchCats)
}));

const useDogStoreSuspense = hook(useDogStore);
const useDogStoreAsync = hook(useDogStore, /*suspense*/false);

function DogCounter() {
  console.log("Rendering DogCounter");
  const [dogs, cats] = useDogStoreSuspense([state => state.dogs, state => state.cats]);
  return <h1 className="dog-counter">{dogs} around here. {cats} around here...</h1>;
}

function DogCounter2() {
  console.log("Rendering DogCounter2");
  const [dogs, cats] = useDogStoreAsync([state => state.dogs, state => state.cats]);
  if (dogs.isLoading || cats.isLoading) {
    return <Loading />;
  }
  return <h1 className="dog-counter">{dogs.value} around here. {cats.value} around here...</h1>;
}

function Loading () {
  return <h1 className="dog-counter">Loading...</h1>;
}

function Controls() {
  console.log("Rendering Controls");
  const increasePopulation = useDogStore(state => state.increasePopulation.trigger)
  return <button className="cool-button" onClick={increasePopulation}>one up</button>;
}

function App() {
  console.log("Rendering App");
  return (
    <div className="app-container">
      <img
        className="leo-logo"
        src="https://leoquery.com/leo-without-background.png"
        alt="Leo Logo"
      />
      <div className="dog-counter-container">
        <Suspense fallback={<Loading />}>
          <DogCounter />
        </Suspense>
      </div>
      <div className="dog-counter-container">
        <DogCounter2 />
      </div>
      <Controls/>
    </div>
  );
}

export default App;