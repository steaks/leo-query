# Data Fetching with Zustand

Zustand is a great choice for managing client state. Zustand isn't opionated on how to manage data fetching. This is a blessing an a curse. It's a blessing because it gives you the flexibility to choose the libraries and patterns that fit your application. But it's a curse because it means you need to make difficult architectual decisions. This post walks through some approaches to data fetching with Zustand.

|Approach|Pros|Cons|
|--------|----|----|
|[Async Actions](https://github.com/pmndrs/zustand?tab=readme-ov-file#async-actions)|* Simple <br /> * Native to Zustand <br /> * Support for optimistic updates | * No support for common async data features <br /> * Not suited for enterprise applicaitons|
|[TanStack Query](https://tanstack.com/query/latest)| * Support for common and most advanced async features <br /> * Large community | * Complex to integrate with Zustand <br /> |
|[Leo Query](https://leoquery.com)| * Support for common and some advanced async features <br /> * Native to Zustand | * Smaller community <br /> * Less mature library than TanStack Query <br /> |

## Approach 1: Async Actions

[Async actions](https://github.com/pmndrs/zustand?tab=readme-ov-file#async-actions) are the simplest way to fetch data with Zustand. They are a great fit for small projects where you want to keep things simple. But you will run into issues when you start getting usage on your application because async actions don't handle naunces like retries, error handling, and re-fetching stale data. Handling nuanced edge-cases are important for deploying a great UX in production.

In Zustand you can make your functions async. So you can just hit the api in fetch in your action, set loading state, and handle errors in your function with a try catch. However, you should at least handle some basic loading and error states.

### Example

```tsx
import {create} from 'zustand'

/**********************************************************
 * Your Store
 **********************************************************/
interface DogsStore {
  dogs: {loading: boolean, error: string | null, data: number}
  fetchDogs: () => Promise<void>
}

const useDogsStore = create<DogsStore>((set) => ({
  dogs: {loading: true},
  fetchDogs: async () => {
    try {
      set({ loading: true, error: null })
      const response = await fetch('https://api.example.com/posts')
      const posts = await response.json()
      set({ posts, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
}));

/**********************************************************
 * Your Component
 **********************************************************/
function Dogs() {
  const { dogs, fetchDogs } = useDogsStore()

  useEffect(() => {
    fetchDogs()
  }, [])

  if (dogs.loading) return <div>Loading...</div>
  if (dogs.error) return <div>Error: {dogs.error}</div>

  return (
    <div>Number of Dogs: {dogs.data}</div>
  )
}
```

## Approach 2: TanStack Query

TanStack Query is a powerful data fetching library that works well alongside Zustand. It provides features like caching, retrying, error handling, and stale data. However, it requires a bit more setup than async actions. And integrating with Zustand is a bit more complex. Tanstack Query is a great choice for medium to large applications.

```tsx
import { create } from 'zustand'
import { useQuery } from '@tanstack/react-query'

/**********************************************************
 * Your Store
 **********************************************************/
interface DogsStore {
  selectedPostId: number | null;
  setSelectedPostId: (id: number | null) => void;
}

const usePostStore = create<PostStore>((set) => ({
  selectedPostId: null,
  setSelectedPostId: (id) => set({ selectedPostId: id }),
}));

/**********************************************************
 * Your Component
 **********************************************************/
function PostDetail() {
  const selectedPostId = usePostStore(state => state.selectedPostId)
  
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', selectedPostId],
    queryFn: async () => {
      if (!selectedPostId) return null
      const response = await fetch(`https://api.example.com/posts/${selectedPostId}`)
      return response.json()
    },
    enabled: !!selectedPostId,
  });

  if (!selectedPostId) return <div>Select a post</div>
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </div>
  )
}
```

## Approach 3: Leo Query

Leo Query is a lightweight data fetching library that integrates with Zustand. It provides features like caching, retrying, error handling, and stale data. Leo Query will be simpler to setup than Tanstack Query, but it doesn't all the advance features of Tanstack Query (e.g. infinite queries, background updates), so check a feature comparison before using Leo Query. Leo Query is a great choice for applications that need many of the features of Tanstack Query, but want to avoid the complexity.

```tsx
/**********************************************************
 * Your Store
 **********************************************************/
import { create } from 'zustand'
import { createQuery } from 'leo-query'

const postsQuery = createQuery({
  queryKey: 'posts',
  queryFn: async () => {
    const response = await fetch('https://api.example.com/posts');
    return response.json();
  },
});

interface PostStore {
  query: typeof postsQuery;
}

const usePostStore = create<PostStore>(() => ({
  query: postsQuery,
}));

/**********************************************************
 * Your Component
 **********************************************************/
function PostList() {
  const query = usePostStore(state => state.query);
  const { data: posts, isLoading, error } = query.use();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## Conclusion

Zustand's flexibility allows it to work well with various data fetching strategies. Whether you're using simple async actions, leo-query, or TanStack Query, you can maintain clean and efficient state management while handling your application's data fetching needs effectively.

The key is to choose the approach that best matches your application's complexity and requirements, while maintaining code readability and performance.

Happy Coding!