import { Todo } from "./api";
import { useStore } from "./store";
import { useQuery } from "@tanstack/react-query";
import { fetchTodos } from "./api";
import Filter, { filterTodos } from "./filter";

const TodoItem = ({ todo }: { todo: Todo }) => {
  return (
    <div className="todo-item">
      <div className="todo-content">
        <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
          {todo.text}
        </span>
        <span className="todo-status">
          {todo.completed ? '✓ Completed' : '○ Active'}
        </span>
      </div>
    </div>
  );
};

function View() {
  const {data: todos, isPending, error} = useQuery({
    queryKey: ["todos"], 
    queryFn: fetchTodos
  });
  const filter = useStore((state) => state.filter);
  const filteredTodos = filterTodos(todos || [], filter);

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <Filter />
      <div className="todo-list">
        {filteredTodos.map((t, index) => (
          <TodoItem key={index} todo={t} />
        ))}
      </div>
    </div>
  );
}

export default View;
