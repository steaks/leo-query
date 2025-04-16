import {Todo} from "./api";
import {useStore, useStoreAsync} from "./store";
import Filter from "./filter";
import {filterTodos} from "./util";

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
  const todos = useStoreAsync((state) => state.todos);
  const filter = useStore((state) => state.filter);
  const filteredTodos = filterTodos(todos, filter);

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
