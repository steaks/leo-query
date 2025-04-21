"use client";
import {createStore} from "zustand";
import {query, effect, Effect, Query} from "leo-query";
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
  createStore<DogState>(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs], {initialValue: d.dogs}) // Re-fetch when increasePopulation or removeAllDogs succeeds 
  })
);