import {create} from "zustand";
import { useShallow } from "zustand/react/shallow";
import {hook, effect, query, Query, Effect, useMessageExpired} from "leo-query";
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
  const messageExpired = useMessageExpired(dogs.lastCompletedRequest, /*timeout*/3000);
  if (dogs.isLoading) {
    return <Loading />;
  }
  if (dogs.error && !messageExpired) {
    return <h1 className="dog-counter">Error: {dogs.error.message}</h1>;
  }
  return (
    <>
      <h1 className="dog-counter">{dogs.value} around here...</h1>
      {!messageExpired && <p className="response-message">Success!</p>}
    </>
  );
}

function Loading () {
  return <h1 className="dog-counter">Loading...</h1>;
}

function Controls() {
  const [increasePopulation, isLoading, lastCompletedRequest] = useDogStore(useShallow(s => [s.increasePopulation.trigger, s.increasePopulation.isLoading,s.increasePopulation.lastCompletedRequest]));
  const messageExpired = useMessageExpired(lastCompletedRequest, /*timeout*/30000);
  console.log("Rendering Controls", messageExpired);

  return (
    <>
      <button className="cool-button" onClick={increasePopulation}>one up</button>
    </>
  );
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