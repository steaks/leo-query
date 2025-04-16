import {create} from "zustand";
import {TodoStore} from "./types";

export const useStore = create<TodoStore>((set) => ({
  filter: "all", // all | active | completed
  setFilter: (filter) => set({ filter }),
}));
