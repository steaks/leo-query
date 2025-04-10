"use client";

import {useDogsStore, useDogsStoreAsync} from "@/app/store/provider";

interface Props {
  initialDogs: number;
  timestamp: number;
}

export const Content = (p: Props) => {
  const dogs = useDogsStoreAsync(s => s.dogs, {initialValue: p.initialDogs});
  const increasePopulation = useDogsStore(s => s.increasePopulation.trigger);

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