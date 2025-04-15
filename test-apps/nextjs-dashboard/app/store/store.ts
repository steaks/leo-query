import {createStore, StoreApi} from "zustand";
import {query, effect, Effect, Query} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs } from "./db";

export interface DogsState {
  dogs: Query<DogsState, number>;
  increasePopulation: Effect<DogsState, []>;
  removeAllDogs: Effect<DogsState, []>;
}

export const createDogsStore = (): StoreApi<DogsState> => 
  createStore<DogsState>(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) // Re-fetch when increasePopulation or removeAllDogs succeeds 
  }));