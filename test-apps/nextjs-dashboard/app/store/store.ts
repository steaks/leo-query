import {createStore} from "zustand/vanilla";
import {query, effect, Effect, Query} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs } from "./data";

export interface DogsState {
  dogs: Query<DogsState, number>;
  increasePopulation: Effect<DogsState, []>;
  removeAllDogs: Effect<DogsState, []>;
}

export const createDogsStore = () => 
  createStore<DogsState>(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) // Re-fetch when increasePopulation or removeAllDogs succeeds 
  }));

export type DogsStateApi = ReturnType<typeof createDogsStore>;