import {equals} from "../src";
import {Effect} from "../src/types";
import {StoreApi} from "zustand";
import {defaultRetryDelay} from "../src/retry";

test("1 equals 1", () => {
  expect(equals(1, 1)).toBe(true);
});

test("1 does not equal 2", () => {
  expect(equals(1, 2)).toBe(false);
});

test("equal effects", () => {
  const effect1 = {
    __id: "1",
    __type: "Effect",
    __deps: [],
    __key: "key1",
    __valueCounter: 0,
    __triggers: [],
    isLoading: false,
    trigger: () => Promise.resolve(),
    __store: () => { return null as unknown as StoreApi<any>; }
  } as Effect<any, any>;

  const effect2 = {
    __id: "2",
    __type: "Effect",
    __deps: [],
    __key: "key2",
    __valueCounter: 0,
    __triggers: [],
    isLoading: false,
    trigger: () => Promise.resolve(),
    __store: () => { return null as unknown as StoreApi<any>; }
  } as Effect<any>

  expect(equals(effect1, effect2)).toBe(true);
});

test("not equal effects", () => {
  const effect1 = {
    __id: "1",
    __type: "Effect",
    __deps: [],
    __key: "key1",
    __valueCounter: 0,
    __triggers: [],
    isLoading: false,
    trigger: () => Promise.resolve(),
    __store: () => { return null as unknown as StoreApi<any>; }
  } as Effect<any, any>;

  const effect2 = {
    __id: "2",
    __type: "Effect",
    __deps: [],
    __key: "key2",
    __valueCounter: 1,
    __triggers: [],
    isLoading: false,
    trigger: () => Promise.resolve(),
    __store: () => { return null as unknown as StoreApi<any>; }
  } as Effect<any, any>

  expect(equals(effect1, effect2)).toBe(false);
});

test("effect compared with non-effect", () => {
  const effect1 = {
    __id: "1",
    __type: "Effect",
    __deps: [],
    __key: "key1",
    __valueCounter: 0,
    __triggers: [],
    isLoading: false,
    trigger: () => Promise.resolve(),
    __store: () => { return null as unknown as StoreApi<any>; }
  } as Effect<any, any>;

  const nonEffect = {
    __valueCounter: 0
  };

  expect(equals(effect1, nonEffect)).toBe(false);
});


test.each([
  { attempt: 0, expected: 0 },
  { attempt: 1, expected: 1000 },
  { attempt: 2, expected: 2000 },
  { attempt: 3, expected: 4000 },
  { attempt: 5, expected: 16000 },
  { attempt: 10, expected: 30000 },
])('returns $expected ms for attempt $attempt', ({ attempt, expected }) => {
  expect(defaultRetryDelay(attempt)).toBe(expected);
});