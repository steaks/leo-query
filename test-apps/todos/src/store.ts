import {create} from "zustand";
import {query, effect, hook} from "leo-query";
import {fetchTodos, createTodo} from "./api";
import {TodoStore} from "./types";

export const useStore = create<TodoStore>((set) => ({
  filter: "all", // all | active | completed
  setFilter: (filter) => set({ filter }),
  todos: query(fetchTodos, (s) => [s.createTodo]), //invalidate todos when createTodo succeeds
  createTodo: effect(createTodo),
}));

export const useStoreAsync = hook(useStore);
