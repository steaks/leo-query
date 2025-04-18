"use client";
import {createStore} from "zustand";
import {persist} from "zustand/middleware";
import {query, effect, merge, partialize, Effect, Query} from "leo-query";
import {fetchDogs, increasePopulation, removeAllDogs } from "./db";

export interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState>;
  removeAllDogs: Effect<DogState>;
}

interface ServerSideData {
  dogs: number;
}

export const createDogStore = (d: ServerSideData) => 
  createStore<DogState>()(persist((set) => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]) // Re-fetch when increasePopulation or removeAllDogs succeeds 
  }), {
    name: "dogs-storage",
    merge,
    partialize,
    skipHydration: true
  })
);