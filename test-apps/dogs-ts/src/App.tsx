import React, {Suspense} from 'react';
import {create} from "zustand";
import {hook, effect, query, Query, Effect} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs} from "./db";
import "./App.css";

interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState>;
  removeAllDogs: Effect<DogState>;
}

const useDogStore = create<DogState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs], {lazy: false}),
}));

const useDogStoreAsync = hook(useDogStore, /*suspense*/false);

function DogCounter() {
  console.log("Rendering DogCounter");
  const dogs = useDogStoreAsync(state => state.dogs);
  if (dogs.isLoading) {
    return <Loading />;
  }
  return <h1 className="dog-counter">{dogs.value} around here...</h1>;
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
        <DogCounter/>
      </div>
      <Controls/>
    </div>
  );
}

export default App;