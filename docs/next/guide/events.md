# Events

Leo Query provides an events api to hook into request lifecycle events. You can hook into success, error, or settled events. You can hook into global events or store-specific events.


## Global Events

```typescript
import {events} from "leo-query";

events.addEventListener("success", e => {
  const payload = e.detail;
  console.log("success", payload.query?.key ?? payload.effect?.key);
});

events.addEventListener("error", e => {
  const payload = e.detail;
  console.log("error", payload.query?.key ?? payload.effect?.key);
});

events.addEventListener("settled", e => {
  const payload = e.detail;
  console.log("settled", payload.query?.key ?? payload.effect?.key);
});
```


## Store Events
```typescript {15-30}
import {effect, query, events, createEvents, Query, Effect} from "leo-query";

interface DogState {
  dogs: Query<DogState, number>;
  increasePopulation: Effect<DogState>;
  removeAllDogs: Effect<DogState>;
}

const useDogStore = create<DogState>(() => ({
  increasePopulation: effect(increasePopulation),
  removeAllDogs: effect(removeAllDogs),
  dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs], {lazy: false}),
}));

const dogStoreEvents = createEvents(useDogStore);

dogStoreEvents.addEventListener("success", e => {
  const payload = e.detail;
  console.log("dog store success", payload.query?.key ?? payload.effect?.key);
});

dogStoreEvents.addEventListener("error", e => {
  const payload = e.detail;
  console.log("dog store error", payload.query?.key ?? payload.effect?.key);
});

dogStoreEvents.addEventListener("settled", e => {
  const payload = e.detail;
  console.log("dog store settled", payload.query?.key ?? payload.effect?.key);
});
```


## API
|Event|Description|Payload|
|----|----|----|
|success|Successful effect or query|[SuccessPayload](#successpayload)|
|error|Error effect or query|[ErrorPayload](#errorpayload)|
|settled|Completed effect or query - regardless of success/failure|[SettledPayload](#settledpayload)|


### SuccessPayload
```typescript
export interface SuccessPayload {
  query?: Query<any, any>;
  effect?: Effect<any, any>;
}
```

### ErrorPayload
```typescript
export interface ErrorPayload {
  query?: Query<any, any>;
  effect?: Effect<any, any>;
  error: any;
}
```

### SettledPayload
```typescript
export interface SettledPayload {
  query?: Query<any, any>;
  effect?: Effect<any, any>;
  error?: any;
}
```