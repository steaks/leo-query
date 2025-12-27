import {RequestPayload, LeoQueryEventTarget, Effect, Query} from "./types";
import {isEffect, isQuery} from "./src";
import {StoreApi, UseBoundStore} from "zustand";

interface StoreEvent<T> {
  store: UseBoundStore<StoreApi<T>>;
  eventTarget: LeoQueryEventTarget;
}

interface EffectEvent<T> {
  effect: Effect<T, any, any>;
  eventTarget: LeoQueryEventTarget;
}

interface QueryEvent<State, T> {
  query: Query<State, T>;
  eventTarget: LeoQueryEventTarget;
}

const storeEvents: StoreEvent<any>[] = [];
const effectEvents: EffectEvent<any>[] = [];
const queryEvents: QueryEvent<any, any>[] = [];

function createEventsFromStore<T>(store: UseBoundStore<StoreApi<T>>): LeoQueryEventTarget {
  const e = new EventTarget();
  const ee = {
    addEventListener: (type: string, listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean) => 
      e.addEventListener(type, listener as EventListener, options),
    removeEventListener: (type: string, listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean) =>
      e.removeEventListener(type, listener as EventListener, options),
    __dispatchEvent: (evt: CustomEvent<RequestPayload>) => {
      e.dispatchEvent(evt);
    },
  } as LeoQueryEventTarget;
  storeEvents.push({store, eventTarget: ee});
  return ee;
};


function createEventsFromEffect<T, Args extends any[], R>(effect: Effect<T, Args, R>): LeoQueryEventTarget {
  const e = new EventTarget();
  const ee = {
    addEventListener: (type: string, listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean) => 
      e.addEventListener(type, listener as EventListener, options),
    removeEventListener: (type: string, listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean) => 
      e.removeEventListener(type, listener as EventListener, options),
    __dispatchEvent: (evt: CustomEvent<RequestPayload>) => {
      e.dispatchEvent(evt);
    },
  } as LeoQueryEventTarget;
  effectEvents.push({effect, eventTarget: ee});
  return ee;
}

function createEventsFromQuery<State, T>(query: Query<State, T>): LeoQueryEventTarget {
  const e = new EventTarget();
  const ee = {
    addEventListener: (type: string, listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean) => 
      e.addEventListener(type, listener as EventListener, options),
    removeEventListener: (type: string, listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean) => 
      e.removeEventListener(type, listener as EventListener, options),
  } as LeoQueryEventTarget;
  queryEvents.push({query, eventTarget: ee});
  return ee;
}

export function createEvents<T>(store: UseBoundStore<StoreApi<T>>): LeoQueryEventTarget;
export function createEvents<T, Args extends any[], R>(effect: Effect<T, Args, R>): LeoQueryEventTarget;
export function createEvents<State, T>(query: Query<State, T>): LeoQueryEventTarget;
export function createEvents(arg: any): LeoQueryEventTarget {
  if (isEffect(arg)) {
    return createEventsFromEffect(arg);
  } else if (isQuery(arg)) {
    return createEventsFromQuery(arg);
  } else {
    return createEventsFromStore(arg);
  }

}

function createGlobalEventTarget(): LeoQueryEventTarget {
  const events = new EventTarget();

  return {
    addEventListener: (type: string, listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean) => 
      events.addEventListener(type, listener as EventListener, options),
    removeEventListener: (type: string, listener: (evt: CustomEvent<RequestPayload>) => void, options?: AddEventListenerOptions | boolean) => 
      events.removeEventListener(type, listener as EventListener, options),
    __dispatchEvent: (evt: CustomEvent<RequestPayload>) => {
      const store = evt.detail.effect?.__store() ?? evt.detail.query?.__store();
      events.dispatchEvent(evt);
      storeEvents.forEach(s => {
        if (s.store === store) {
          s.eventTarget.__dispatchEvent(evt);
        }
      });
      effectEvents.forEach(e => {
        if (e.effect.__id === evt.detail.effect?.__id) {
          e.eventTarget.__dispatchEvent(evt);
        }
      });
      queryEvents.forEach(q => {
        if (q.query.__id === evt.detail.query?.__id) {
          q.eventTarget.__dispatchEvent(evt);
        }
      });
    }
  } as LeoQueryEventTarget;
};

export const events = createGlobalEventTarget();