"use client";
import {useDogStore, useDogStoreAsync} from "@/app/store/provider";

export const Dogs = () => {
  const dogs = useDogStoreAsync(s => s.dogs);
  const increasePopulation = useDogStore(s => s.increasePopulation.trigger);

  if (dogs.isLoading) {
    return <>Loading...</>;
  }

  return (
    <div>
      <p>Dogs: {dogs.value}</p>
      <button onClick={increasePopulation}>Add Dog</button>
    </div>
  );
};