import {Todo} from "./api";
import {Query, Effect} from "leo-query";

export interface TodoStore {
  filter: string;
  setFilter: (filter: string) => void;
  todos: Query<TodoStore, Todo[]>;
  createTodo: Effect<TodoStore, [string]>;
}