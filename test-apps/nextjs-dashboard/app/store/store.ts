import {createStore} from "zustand/vanilla";
import {Query, query} from "leo-query";

export interface CounterStore {
  count: number;
  decrementCount: () => void;
  incrementCount: () => void;
  dogs: Query<CounterStore, number>;
}

const fetchDogs = async (): Promise<number> => {
  // Simulate API call
  console.log("fetchDogs");
  await new Promise(resolve => setTimeout(resolve, 1000));
  return 42;
};

export const createCounterStore = () => {
  console.log("createCounterStore");
  return createStore<CounterStore>()((set) => ({
    count: 0,
    decrementCount: () => set((s) => ({ count: s.count - 1 })),
    incrementCount: () => set((s) => ({ count: s.count + 1 })),
    dogs: query(fetchDogs, (s) => [s.incrementCount]),
  }));
};

export type CounterStoreApi = ReturnType<typeof createCounterStore>;
