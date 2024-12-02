# Delaying Execution with Wait

Sometimes I want to delay execution in Leo Query. This may be to delay a retry or wait for a React render. I prefer the async / await syntax over `setTimeout`. So I wrote a small `wait` utility function to use in the Leo Query code.

```typescript
const wait = async (timeout?: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, timeout);
  });
};

const myFunction = async () => {
  //Do something
  await wait(5 * 1000); //Wait 5 seconds
  //Do more things
};
```

Happy Coding!