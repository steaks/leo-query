"use client";
import {useDogStore, useDogStoreAsync, useDogStoreIsHydrated} from "@/app/store/provider";

export const Dogs = () => {
  const dogs = useDogStoreAsync(s => s.dogs);
  const increasePopulation = useDogStore(s => s.increasePopulation.trigger);
  const isHydrated = useDogStoreIsHydrated();

  if (dogs.isLoading) {
    return <>Loading...</>;
  }

  return (
    <div>
      <p>Dogs: {dogs.value}</p>
      <p>Is Hydrated: {isHydrated.toString()}</p>
      <button onClick={increasePopulation}>Add Dog</button>
    </div>
  );
};