import {equals} from "../src";
import {Effect} from "../src/types";
import {StoreApi} from "zustand";

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