# Effect

The `effect` function allows you to integrate asynchronous effects (e.g., HTTP requests or other side effects) into Zustand stores, managing triggers and loading states.

## Syntax

```
effect<Store extends object, Args extends any[] = []>(fn: (...args: Args) => Promise<void>): Effect<Store, Args>;
```

## Parameters

- **`fn: (...args: Args) => Promise<void>`**  
  The asynchronous function that performs the side effect. It can be an HTTP request or any promise.

## Returns

- **`Effect<Store, Args>`**  
  An object representing the effect, including methods and state information.

## Effect Object Properties

- **`trigger(...args: Args): Promise<void>`**  
  Manually triggers the effect, executing the function `fn` with optional arguments.

- **`isLoading: boolean`**  
  Indicates whether the effect is currently being executed.

## Example Usage
### Basic Example

```
const increaseBearCount = () => fetch('/api/increase', { method: 'POST' });

const useBearStore = create(() => ({
  increaseBearCount: effect(increaseBearCount)
}));

const Controls = () => {
  const increase = useBearStore(state => state.increaseBearCount.trigger);
  return <button onClick={increase}>Increase bear count</button>;
};
```

In this example:
- The increaseBearCount effect can be triggered via the trigger function, and the bears query will automatically update if the effect is triggered.

### Example with Arguments

```
const increaseBearCount = (amount: number) => fetch('/api/increase', { method: 'POST', body: JSON.stringify({amount}) });

const useBearStore = create(() => ({
  increaseBearCount: effect(increaseBearCount)
}));

const Controls = () => {
  const increaseBearCount = useBearStore(state => state.increaseBearCount.trigger);
  return (
    <>
      <button onClick={() => increaseBearCount(1)}>Increase by 1</button>
      <button onClick={() => increaseBearCount(5)}>Increase by 5</button>
    </> 
  );
};
```

In this example:
- The updateBearPopulation effect takes an argument (amount) to update the bear population by a specific value.
- In the component, the trigger method is called with the argument amount, allowing dynamic updates.

## Key Features
- Manual triggering: Effects are manually triggered but can interact with other store properties.
- Handles async operations: Automatically manages loading state and concurrent executions.
- Integrated with Zustand: Simple integration with Zustand, no need for complex useEffect hooks inside components.