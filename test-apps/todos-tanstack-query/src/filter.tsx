import {useStore} from "./store";
import {Todo} from "./api";

//utility method to filter todos
export const filterTodos = (todos: Todo[], filter: string) => {
  if (filter === "all") return todos;
  if (filter === "active") return todos.filter((todo) => !todo.completed);
  if (filter === "completed") return todos.filter((todo) => todo.completed);
  throw new Error(`Invalid filter: ${filter}`);
};

const Filter = () => {
  const filter = useStore((state) => state.filter);
  const setFilter = useStore((state) => state.setFilter);

  return (
    <div className="filter-selector">
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
};

export default Filter;