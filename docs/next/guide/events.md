# Events

Leo Query provides an events api to hook into request lifecycle events. You can hook into success, error, or settled events. You can hook into global events or store-specific events.


## Global Events

```typescript
import {events} from "leo-query";

events.addEventListener("success", (e) => {
  console.log("success", e.detail.query?.key ?? e.detail.effect?.key);
});

events.addEventListener("error", e => {
  console.log("error", e.detail.query?.key ?? e.detail.effect?.key);
});

events.addEventListener("settled", e => {
  console.log("settled", e.detail.query?.key ?? e.detail.effect?.key);
});
```


## Store Events
```typescript {15-27}
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
  console.log("dog store success", e.detail.query?.key ?? e.detail.effect?.key);
});

dogStoreEvents.addEventListener("error", e => {
  console.log("dog store error", e.detail.query?.key ?? e.detail.effect?.key);
});

dogStoreEvents.addEventListener("settled", e => {
  console.log("dog store settled", e.detail.query?.key ?? e.detail.effect?.key);
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