import {StoreApi} from "zustand";
import {equals} from "../src/src";
import {Effect, Query} from "../src/types";
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
    __valueCounter: 0,
    __triggers: [],
    key: "key1",
    isLoading: false,
    isIdle: true,
    error: undefined,
    errors: [],
    lastStartedRequest: undefined,
    lastCompletedRequest: undefined,
    requests: [],
    trigger: () => Promise.resolve(),
    __store: () => { return null as unknown as StoreApi<any>; }
  } as Effect<any, any>;

  const effect2 = {
    __id: "2",
    __type: "Effect",
    __deps: [],
    __valueCounter: 0,
    __triggers: [],
    key: "key2",
    isLoading: false,
    isIdle: true,
    error: undefined,
    errors: [],
    lastStartedRequest: undefined,
    lastCompletedRequest: undefined,
    requests: [],
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
    __valueCounter: 0,
    __triggers: [],
    key: "key1",
    isLoading: false,
    isIdle: true,
    error: undefined,
    errors: [],
    lastStartedRequest: undefined,
    lastCompletedRequest: undefined,
    requests: [],
    trigger: () => Promise.resolve(),
    __store: () => { return null as unknown as StoreApi<any>; }
  } as Effect<any, any>;

  const effect2 = {
    __id: "2",
    __type: "Effect",
    __deps: [],
    __valueCounter: 1,
    __triggers: [],
    key: "key2",
    isLoading: false,
    isIdle: true,
    error: undefined,
    errors: [],
    lastStartedRequest: undefined,
    lastCompletedRequest: undefined,
    requests: [],
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
    __valueCounter: 0,
    __triggers: [],
    key: "key1",
    isLoading: false,
    isIdle: true,
    error: undefined,
    errors: [],
    lastStartedRequest: undefined,
    lastCompletedRequest: undefined,
    requests: [],
    trigger: () => Promise.resolve(),
    __store: () => { return null as unknown as StoreApi<any>; }
  } as Effect<any, any>;

  const nonEffect = {
    __valueCounter: 0
  };

  expect(equals(effect1, nonEffect)).toBe(false);
});

test("arrays of different lengths", () => {
  expect(equals([1, 2, 3], [1, 2])).toBe(false);
  expect(equals([1, 2], [1, 2, 3])).toBe(false);
});

test("nested arrays", () => {
  expect(equals([1, [2, 3]], [1, [2, 3]])).toBe(true);
  expect(equals([1, [2, 3]], [1, [2, 4]])).toBe(false);
});

test("equal queries", () => {
  const query1 = {
    __type: "Query",
    __deps: [],
    __key: "key1",
    value: 42,
    isLoading: false,
  } as unknown as Query<any, number>;

  const query2 = {
    __type: "Query",
    __deps: [],
    __key: "key2",
    value: 42,
    isLoading: false,
  } as unknown as Query<any, number>;

  expect(equals(query1, query2)).toBe(true);
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