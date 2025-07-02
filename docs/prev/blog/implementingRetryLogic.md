# Implementing Retry Logic

Lots of things can go wrong when you're making HTTP requests. Wifi can cut out. Servers can overload. Apps need to have a retry strategy for good UX. Leo Query implements a nuanced retry strategy using an exponential backoff.

Your retry strategy needs to answer three questions: 

1. When should you start retrying? 
2. How long should you wait between each retry? 
3. When should you stop retrying?

### 1. When should you start retrying?

You should retry as soon as possible. Network or server errors often resolve quickly. Here's a snippet of Leo Query immediately retrying a failed promise.

```typescript
const trigger = () => {
  const promise = fetch();
  promise.catch(() => retry(p.fn, q, promise)); //If the promise fails immediately retry
};
```

### 2. How long should you wait between each retry?

Three common strategies for waiting are constant backoff, linear backoff, and exponential backoff. 

Constant backoff waits the same amount of time between retries. This strategy is good for keeping your system simple and retrying quickly. 

Linear backoff waits a linearly increasing amount between each retry. Linear backoffs are good for still keeping your system simple but giving the issue more time to resolve. 

Exponential backoff waits exponentially more time between each retry. Exponential backoffs work well because they retry quickly initially and then give issue more time to resolve in later retries. This pattern works well because most issues resolve quickly, but issues that do not tend to take significantly longer. 

Leo Query uses a modified exponential backoff. Here's a snippet of the code that calculates the backoff delay.

```typescript
const calculateBackoffDelay = (attempt: number) =>
  attempt === 0 ? 0 : Math.min((2 ** (attempt - 1)) * 1000, 30 * 1000);
```

### 3. When should you stop retrying?

You should stop retrying when you no longer need the data or when there's no hope left to retrieve the data. Leo Query keeps track of when the data is no longer needed through it's stale data mechanism. And by default it gives up after 5 retries.

## Putting it all together

This is what the [retry](https://github.com/steaks/leo-query/blob/main/src/retry.ts) code looks like in Leo Query when you put together answers to the three questions.

```typescript
const wait = async (timeout?: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, timeout);
  });
};

export const calculateBackoffDelay = (attempt: number) =>
  attempt === 0 ? 0 : Math.min((2 ** (attempt - 1)) * 1000, 30 * 1000);

export const retry = async <State, R>(fn: () => Promise<R>, query: Query<State, R>, promise: Promise<R>, attempt: number = 0): Promise<R> => {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= query.__retries) { //Defaults to 5 retries
      throw error;
    }
    const state = query.__store().getState();
    const current = state[query.key] as Query<State, R>;
    if (current.__trigger !== promise) { //If the query has been re-triggered then we no longer need the data
      throw error;
    }
    const backoffDelay = calculateBackoffDelay(attempt); //Use exponential backoff
    await wait(backoffDelay);
    return retry(fn, query, promise, attempt + 1);
  }
};

const trigger = () => {
  const promise = fetch();
  promise.catch(() => retry(p.fn, q, promise)); //If the promise fails then we immediately retry
};
```

Happy Coding!