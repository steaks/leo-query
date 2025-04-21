"use client";
import { Suspense } from "react";
import { useDogStore, useDogStoreAsync } from "@/app/store/provider";

const DogCounter = () => {
  const dogs = useDogStoreAsync((state) => state.dogs)
  return <h1 className="dog-counter">{dogs.value} around here...</h1>;
}

const Loading = () => {
  return <h1 className="dog-counter">Loading...</h1>;
};

const Controls = () => {
  const increasePopulation = useDogStore(
    (state) => state.increasePopulation.trigger
  );
  return (
    <button className="cool-button" onClick={increasePopulation}>
      one up
    </button>
  );
};

export const Dogs = () => {
  return (
    <div className="app-container">
      <img
        className="leo-logo"
        src="https://leoquery.com/leo-without-background.png"
        alt="Leo Logo"
      />
      <Suspense fallback={<Loading />}>
        <DogCounter />
      </Suspense>
      <Controls />
    </div>
  );
};