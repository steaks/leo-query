"use client";
import {useDogStore, useDogStoreAsync, useDogStoreHasHydrated} from "@/app/store/provider";

export const Dogs = () => {
  const dogs = useDogStoreAsync(s => s.dogs);
  const increasePopulation = useDogStore(s => s.increasePopulation.trigger);
  const hasHydrated = useDogStoreHasHydrated();
  console.log("hasHydrated", hasHydrated);
  console.log("dogs.tsx", dogs.isLoading, dogs.value);

  if (dogs.isLoading) {
    return <>Loading...</>;
  }

  return (
    <div>
      <p>Dogs: {dogs.value}</p>
      <p>Has Hydrated: {hasHydrated.toString()}</p>
      <button onClick={increasePopulation}>Add Dog</button>
    </div>
  );
};