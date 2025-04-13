# Why Leo Query?

Leo Query is an async query library designed for Zustand. It handles complexities of async queries (caching, debouncing, dependencies, stale time, etc.). It's built for Zustand - prioritizing simplicity and easy integration.

Managing async state is hard - harder than managing frontend state. There are more edge cases to consider. Leo Query handles this complexity for you. Here are some key features:

- Built-in caching 
- Automatic loading state management
- Debouncing to prevent unnecessary requests 
- Configurable cache duration (aka stale time)
- Error handling with retries and exponential backoff
- Dependency tracking and re-fetching
- Automatic cache invalidation on mutations

## Why Choose Leo Query?
- **Single Source of Truth** - Keep all your state (UI and async) in one Zustand store
- **Familiar Zustand Patterns** - If you know Zustand, Leo Query is quick to pick up
- **Minimal Boilerplate** - No query clients, providers, or complex configuration needed
- **Robust Async Features** - Built-in caching, debouncing, dependencies, stale time, retries, etc. 
- **Type Safety** - Full TypeScript support with minimal type configuration

## Integrating with Zustand

Leo Query is built for Zustand, so it integrates seamlessly with Zustand. Just put async state next to ui state in your store. No more extra libraries. No more multiple cache systems.

Here's a snippet from a TODO app:

```typescript
const useStore = create<TodoStore>(() => ({
  //Frontend state
  filter: "all",
  setFilter: (filter) => set({ filter }),
  //Async state
  todos: query(fetchTodos, s => [s.createTodo]),
  createTodo: effect(createTodo)
}));
```

## Leo Query vs. TanStack Query

Zustand + Tanstack Query is a popular combination. Tanstack Query is a powerful and robust library. But Tanstack Query and Zustand use different patterns and live in separate places. Managing data with two systems is harder than it needs to be. Leo Query follows the same patterns as Zustand and lives in your store. It gives you similar features with one state system, less boilerplate, and less complexity.

Here is a comparison of how you may build a TODOs app with Tanstack Query vs. Leo Query. This app fetches TODOs from the server and filters on the frontend.

### Zustand + TanStack Query Approach
Zustand handles the frontend state. Tanstack Query handles async state outside of the store.

```typescript
// store.ts
export const useStore = create<FilterStore>((set) => ({
  filter: "all", // all | active | completed
  setFilter: (filter) => set({ filter }),
}));
```

```typescript
// view.tsx
const filterTodos = (todos: Todo[], filter: string) => {
  if (filter === "all") return todos;
  if (filter === "active") return todos.filter(todo => !todo.completed);
  if (filter === "completed") return todos.filter(todo => todo.completed);
  throw new Error(`Invalid filter: ${filter}`);
};

export function TodoItems() {
  const filter = useStore(state => state.filter);
  // Fetch todos with Tanstack Query.
  const {data: todos} = useQuery({queryKey: ["todos"], queryFn: fetchTodos});
  const filteredTodos = filterTodos(todos ?? [], filter);

  return <ul>{filteredTodos.map(/.../)}</ul>;
}
```

```typescript
//create.tsx
export function CreateTodo() {
  const queryClient = useQueryClient();
  // Create todo with Tanstack Query
  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["todos"]});
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(e.currentTarget.content.value);
    form.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="content" type="text" />
      <button type="submit" disabled={mutation.isPending}>
        Create Todo
      </button>
    </form>
  );
}
```

### Zustand + Leo Query Approach
Zustand and Leo Query handle frontend state and async state in the store.

```typescript
//store.ts
export const useStore = create<TodoStore>((set) => ({
  // Async state
  todos: query(fetchTodos, s => [s.createTodo]),
  createTodo: effect(createTodo),
  // Frontend state
  filter: "all", // all | active | completed
  setFilter: (filter) => set({ filter }),
}));

export const useStoreAsync = hook(useStore); //Hook into async state
```

```typescript
//view.tsx
const filterTodos = (todos: Todo[], filter: string) => {
  if (filter === "all") return todos;
  if (filter === "active") return todos.filter(todo => !todo.completed);
  if (filter === "completed") return todos.filter(todo => todo.completed);
  throw new Error(`Invalid filter: ${filter}`);
};

function TodoItems() {
  const todos = useStoreAsync(state => state.todos);
  const filter = useStore(state => state.filter);
  const filteredTodos = filterTodos(todos, filter);

  return <ul>{filteredTodos.map(/.../)}</ul>;
}
```

```typescript
//create.tsx
function CreateTodo() {
  const createTodo = useStore(state => state.createTodo.trigger);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createTodo(e.currentTarget.content.value);
    form.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="content" type="text" />
      <button type="submit">Create Todo</button>
    </form>
  );
}
```
