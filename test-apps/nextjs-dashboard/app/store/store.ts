import {createStore, StoreApi} from "zustand";
import {query, effect, Effect, Query} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs } from "./db";

export interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState, []>;
  removeAllDogs: Effect<DogState, []>;
}

export const createDogStore = (): StoreApi<DogState> => 
  createStore<DogState>(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) // Re-fetch when increasePopulation or removeAllDogs succeeds 
  }));