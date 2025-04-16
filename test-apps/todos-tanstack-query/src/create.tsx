import {useQueryClient, useMutation} from "@tanstack/react-query";
import {createTodo} from "./api";

function Create() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["todos"]}); //invalidate todos when createTodo succeeds
    },
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(e.currentTarget.content.value);
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