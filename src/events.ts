import {Query, Effect, ErrorPayload, SuccessPayload, SettledPayload, LeoQueryEventTarget} from "./types";
import {StoreApi, UseBoundStore} from "zustand";

interface StoreEvent<T> {
  store: UseBoundStore<StoreApi<T>>;
  eventTarget: LeoQueryEventTarget;
}

const storeEvents: StoreEvent<any>[] = [];

export function createEvents<T>(store: UseBoundStore<StoreApi<T>>): LeoQueryEventTarget {
  const e = new EventTarget();
  const ee = {
    addEventListener: (type: string, listener: (evt: CustomEvent<ErrorPayload | SuccessPayload | SettledPayload>) => void, options?: AddEventListenerOptions | boolean) => 
      e.addEventListener(type, listener as EventListener, options),
    removeEventListener: (type: string, listener: (evt: CustomEvent<ErrorPayload | SuccessPayload | SettledPayload>) => void, options?: AddEventListenerOptions | boolean) =>
      e.removeEventListener(type, listener as EventListener, options),
    __dispatchEvent: (evt: CustomEvent<ErrorPayload | SuccessPayload | SettledPayload>) => {
      e.dispatchEvent(evt);
    },
  } as LeoQueryEventTarget;
  storeEvents.push({store, eventTarget: ee});
  return ee;
};

function createGlobalEventTarget(): LeoQueryEventTarget {
  const events = new EventTarget();

  return {
    addEventListener: (type: string, listener: (evt: CustomEvent<ErrorPayload | SuccessPayload | SettledPayload>) => void, options?: AddEventListenerOptions | boolean) => 
      events.addEventListener(type, listener as EventListener, options),
    removeEventListener: (type: string, listener: (evt: CustomEvent<ErrorPayload | SuccessPayload | SettledPayload>) => void, options?: AddEventListenerOptions | boolean) => 
      events.removeEventListener(type, listener as EventListener, options),
    __dispatchEvent: (evt: CustomEvent<ErrorPayload | SuccessPayload | SettledPayload>) => {
      const store = evt.detail.effect?.__store() ?? evt.detail.query?.__store();
      events.dispatchEvent(evt);
      storeEvents.forEach(s => {
        if (s.store === store) {
          s.eventTarget.__dispatchEvent(evt);
        }
      })
    }
  } as LeoQueryEventTarget;
};

export const events = createGlobalEventTarget();