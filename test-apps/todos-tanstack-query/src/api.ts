export interface Todo {
  completed: boolean;
  text: string;
}

const db = {
  todos: [
    { text: "Walk the dog", completed: false },
    { text: "Wash muddy paws", completed: false },
  ],
};

export const fetchTodos = () =>
  Promise.resolve([...db.todos]);

export const createTodo = (text: string) => {
  db.todos.push({ text, completed: false });
  return Promise.resolve(undefined);
};
