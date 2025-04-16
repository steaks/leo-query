import { useStore } from "./store";

function Create() {
  const createTodo = useStore((state) => state.createTodo.trigger);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createTodo(e.currentTarget.content.value);
    e.currentTarget.content.value = ""; // Clear input after submission
  };
  return (
    <form onSubmit={handleSubmit} className="create-form">
      <div className="input-container">
        <input 
          name="content" 
          type="text" 
          placeholder="What needs to be done?"
          className="todo-input"
          required
        />
        <button className="cool-button" type="submit">Create Todo</button>
      </div>
    </form>
  );
}

export default Create;