# Effect (mutating data)

The `effect` function allows you to integrate asynchronous effects (e.g., HTTP requests or other side effects) into Zustand stores, managing triggers and loading states.

## Usage
### Basic Example

Trigger an effect to update the dog population when the button is clicked.

```typescript
const increaseDogCount = () => fetch('/api/increase', { method: 'POST' });

const useDogStore = create(() => ({
  increaseDogCount: effect(increaseDogCount)
}));

const Controls = () => {
  const increase = useDogStore(state => state.increaseDogCount.trigger);
  return <button onClick={increase}>Increase dog count</button>;
};
```

### Example with Arguments

Trigger an effect to update the dog population with an amount in the HTTP request body when the button is clicked.

```typescript
const increaseDogCount = (amount: number) => fetch('/api/increase', { method: 'POST', body: JSON.stringify({amount}) });

const useDogStore = create(() => ({
  increaseDogCount: effect(increaseDogCount)
}));

const Controls = () => {
  const increaseDogCount = useDogStore(state => state.increaseDogCount.trigger);
  return (
    <>
      <button onClick={() => increaseDogCount(1)}>Increase by 1</button>
      <button onClick={() => increaseDogCount(5)}>Increase by 5</button>
    </> 
  );
};
```

## API Reference

```typescript
function effect<Store extends object, Args extends any[] = []>(fn: (...args: Args) => Promise<void>): Effect<Store, Args>;
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `fn` | `(...args: Args) => Promise<void>` | The asynchronous function that performs the side effect. It can be an HTTP request or any promise. |


### Returns

**`Effect<Store, Args>`**  
An object representing the effect, including methods and state information.

```typescript
export interface Effect<State, Args extends any[] = []> {
    /** Indicates if the effect is currently executing. */
    isLoading: boolean;
    /** Triggers the effect manually. */
    trigger: (...args: Args) => Promise<void>;
}
```