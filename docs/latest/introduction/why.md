# Why Leo Query?

Leo Query is an **async state** library for Zustand. 

Zustand provides guidance for handling [async state](https://github.com/pmndrs/zustand?tab=readme-ov-file#async-actions). But devs resort to more robust libraries like [Tanstack Query](https://tanstack.com/query/latest) or [Vercel SWR](https://swr.vercel.app/) because they handle difficult edge-cases like **cache-busting**, **race-conditions**, **retries**, **loading states**, and **error handling**. 

Bringing in a **second system** to handle async state and integrating two state systems complicates architecture. It makes building and maintaining apps harder.

Leo Query integrates directly with Zustand and handles complex async state edge-cases like TanStack Query and SWR. So with Leo Query devs can build apps with **one state system** and a **simpler** architecture. This makes apps **easier to build** and **easier to maintain**. Read the [Leo Query vs. TanStack Query](#leo-query-vs-tanstack-query) comparison to see this in practice.

## Key Features

Leo Query handles complex async data edge-cases. Here are some key features:

- Built-in caching 
- Automatic loading state management
- Debouncing to prevent unnecessary requests 
- Configurable cache duration (aka stale time)
- Error handling with retries and exponential backoff
- Dependency tracking and re-fetching
- Automatic cache invalidation on mutations
- Support with ssr frameworks (Next.js)
- Persisting data

## Leo Query vs. TanStack Query

`Zustand & Tanstack Query` is a popular stack for implementing frontend and async state. We'll compare that stack with the `Zustand & Leo Query` stack to show how you can **centralize** state and data loading to simplify your architecture.

We'll build a TODOs app that supports **viewing**, **creating**, and **filtering** TODOs. Filtering will be done on the frontend for a snappy UX.

### Fetching TODOs

First we'll fetch, save, and render TODOs. TODOs are fetched from the server. Fetching lives in the store with Leo Query. Fetching lives in the view component with TanStack Query.

:::tabs
== Leo Query
```typescript {8}
// store.ts
import {create} from "zustand";
import {query, hook} from "leo-query";
import {fetchTodos} from "./api"; //assume we've build fetching functions to hit our api
import {TodoStore} from "./types";

export const useStore = create<TodoStore>((set) => ({
  todos: query(fetchTodos),
}));

export const useStoreAsync = hook(useStore);
```
```typescript {5}
// view.tsx
import {useStoreAsync} from "./store";

const View = () => {
  const todos = useStoreAsync(state => state.todos);
  return <ul>{todos.map(/.../)}</ul>;
}
```
== TanStack Query
```typescript {6-9}
// view.tsx
import {useQuery} from "@tanstack/react-query";
import {fetchTodos} from "./api"; //assume we've build fetching functions to hit our api

const View = () => {
  const {data: todos} = useQuery({
    queryKey: ["todos"], 
    queryFn: fetchTodos
  });
  return <ul>{todos.map(/.../)}</ul>;
}
```
:::

### Creating TODOs

Next we'll create TODOs. When a new TODO is created we'll need to invalidate the existing TODOs. This logic lives in the store with Leo Query. This logic lives in the create component with TanStack Query. 

:::tabs
== Leo Query
```typescript {9}
// store.ts
import {create} from "zustand";
import {query, effect, hook} from "leo-query";
import {fetchTodos, createTodo, Todo} from "./api";
import {TodoStore} from "./types";

export const useStore = create<TodoStore>((set) => ({
  todos: query(fetchTodos, s => [s.createTodo]), //invalidate todos when createTodo succeeds
  createTodo: effect(createTodo)
}));

export const useStoreAsync = hook(useStore);
```
```typescript {5-9}
// create.tsx
import {useStore} from "./store";

const Create = () => {
  const createTodo = useStore(state => state.createTodo.trigger);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createTodo(e.currentTarget.content.value);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input name="content" type="text" />
      <button type="submit">Create Todo</button>
    </form>
  );
}
```
== TanStack Query
```typescript {6-16}
// create.tsx
import {useQueryClient, useMutation} from "@tanstack/react-query";
import {createTodo} from "./db";

const Create = () => {
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
  };
  return (
    <form onSubmit={handleSubmit}>
      <input name="content" type="text" />
      <button type="submit" disabled={mutation.isPending}>Create Todo</button>
    </form>
  );
}
```
:::

### Filtering TODOs

Finally we'll implement frontend filtering. Both stacks will implement filters in the store.

:::tabs
== Leo Query
```typescript {10,11}
// store.ts
import {create} from "zustand";
import {query, effect, hook} from "leo-query";
import {fetchTodos, createTodo, Todo} from "./api";
import {TodoStore} from "./types";

export const useStore = create<TodoStore>((set) => ({
  todos: query(fetchTodos, s => [s.createTodo]), //invalidate todos when createTodo succeeds
  createTodo: effect(createTodo),
  filter: "all", // all | active | completed
  setFilter: (filter) => set({filter}),
}));
```
```typescript {7}
// view.tsx
import {useStoreAsync} from "./store";
import {filterTodos} from "./util";

function View() {
  const todos = useStoreAsync(state => state.todos);
  const filteredTodos = filterTodos(todos);
  return <ul>{filteredTodos.map(/.../)}</ul>;
}
```
```typescript {5,6}
// filters.tsx
import {useStore} from "./store";

const Filter = () => {
  const filter = useStore((state) => state.filter);
  const setFilter = useStore((state) => state.setFilter);
  return (
    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
    </select>
  );
};
```
== TanStack Query
```typescript {6,7}
// store.ts
import {create} from "zustand";
import {TodoStore} from "./types";

export const useStore = create<TodoStore>((set) => ({
  filter: "all", // all | active | completed
  setFilter: (filter) => set({filter}),
}));
```
```typescript {10}
// view.tsx
import {useQuery} from "@tanstack/react-query";
import {fetchTodos} from "./api"; //assume we've build fetching functions to hit our api

const function View = () => {
  const {data: todos} = useQuery({
    queryKey: ["todos"], 
    queryFn: fetchTodos
  });
  const filteredTodos = filterTodos(todos || []);
  return <ul>{filteredTodos.map(/.../)}</ul>;
}
```
```typescript {5,6}
// filters.tsx
import {useStore} from "./store";

const Filter = () => {
  const filter = useStore((state) => state.filter);
  const setFilter = useStore((state) => state.setFilter);
  return (
    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
    </select>
  );
};
```
:::

### Putting It All Together

Now let's put together the full app. Notice your state and data loading logic is **centralized** in one place with Leo Query stack and dispersed with the TanStack Query stack. Having your state and data logic in a centralized place will make tracking bugs and building enhancements easier.

Dive in deeper by looking at working examples with a [Leo Query](https://codesandbox.io/p/sandbox/todos-0-3-0-d75vj5) stack and a [TanStack Query](https://codesandbox.io/p/sandbox/todos-tanstack-query-zy9zyc) stack.

:::tabs
== Leo Query
```typescript {8-11}
// store.ts
import {create} from "zustand";
import {query, effect, hook} from "leo-query";
import {fetchTodos, createTodo, Todo} from "./api";
import {TodoStore} from "./types";

export const useStore = create<TodoStore>((set) => ({
  todos: query(fetchTodos, s => [s.createTodo]), //invalidate todos when createTodo succeeds
  createTodo: effect(createTodo),
  filter: "all", // all | active | completed
  setFilter: (filter) => set({filter}),
}));
```
```typescript
// view.tsx
import {useStoreAsync} from "./store";
import {filterTodos} from "./util";

const View = () => {
  const todos = useStoreAsync(state => state.todos);
  const filteredTodos = filterTodos(todos);
  return <ul>{filteredTodos.map(/.../)}</ul>;
}
```
```typescript
// create.tsx
import {useStore} from "./store";

const Create = () => {
  const createTodo = useStore(state => state.createTodo.trigger);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createTodo(e.currentTarget.content.value);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input name="content" type="text" />
      <button type="submit">Create Todo</button>
    </form>
  );
}
```
```typescript
// filters.tsx
import {useStore} from "./store";

const Filter = () => {
  const filter = useStore((state) => state.filter);
  const setFilter = useStore((state) => state.setFilter);
  return (
    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
    </select>
  );
};
```
== TanStack Query
```typescript {6,7}
// store.ts
import {create} from "zustand";
import {TodoStore} from "./types";

export const useStore = create<TodoStore>((set) => ({
  filter: "all", // all | active | completed
  setFilter: (filter) => set({filter}),
}));
```
```typescript {6-9}
// view.tsx
import {useQuery} from "@tanstack/react-query";
import {fetchTodos} from "./api"; //assume we've build fetching functions to hit our api

const View = () => {
  const {data: todos} = useQuery({
    queryKey: ["todos"], 
    queryFn: fetchTodos
  });
  const filteredTodos = filterTodos(todos || []);
  return <ul>{filteredTodos.map(/.../)}</ul>;
}
```
```typescript {7-12}
// create.tsx
import {useQueryClient, useMutation} from "@tanstack/react-query";
import {createTodo} from "./db";

const Create = () => {
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
  };
  return (
    <form onSubmit={handleSubmit}>
      <input name="content" type="text" />
      <button type="submit" disabled={mutation.isPending}>Create Todo</button>
    </form>
  );
}
```
```typescript
// filters.tsx
import {useStore} from "./store";

const Filter = () => {
  const filter = useStore((state) => state.filter);
  const setFilter = useStore((state) => state.setFilter);
  return (
    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
    </select>
  );
};
```
:::