import {Todo} from "./api";

//utility method to filter todos
export const filterTodos = (todos: Todo[], filter: string) => {
  if (filter === "all") return todos;
  if (filter === "active") return todos.filter((todo) => !todo.completed);
  if (filter === "completed") return todos.filter((todo) => todo.completed);
  throw new Error(`Invalid filter: ${filter}`);
};