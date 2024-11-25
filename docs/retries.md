# Retries

Leo Query supports retries. By default queries will retry 5 times with an exponential backoff. You can override the default retry behavior globally via [configure()](/globalConfig#configure) or for individual queries.

### Overriding retry count

Override queries to retry 3 times rather than the default 5 times.

```typescript
// Override the default retry behavior
configure({
  retry: 3
});
```

### Overriding retry delay

Override queries to retry with a linear delay.

```typescript
configure({
  retryDelay: (attempt) => attempt * 1000
})
```

### Overriding retries to handle specific http errors

Often you may want to handle specific HTTP errors differently than others. For example, you may want to stop retrying if a 404 error is encountered.

```typescript   
config({
  retry: (attempt, error) => {
    if (error instanceof Error && error.message.includes("404")) {
      return false;
    }
    return attempt < 5;
  }
});
```