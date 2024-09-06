import {StoreApi} from "zustand/vanilla";

export interface Effect<State, Args extends any[]> {
    readonly __id: string;
    readonly __type: "Effect";
    __key: keyof State;
    readonly __valueCounter: number;
    readonly __triggers: Promise<void>[];
    __store: () => StoreApi<State>;
    isLoading: boolean;
    trigger: (...args: Args) => Promise<void>;
}

export interface Query<State, T> {
    readonly __id: string;
    readonly __type: "Query";
    __key: keyof State;
    readonly __deps: Dependencies<State>;
    readonly __debounce: number;
    __trigger: Promise<T> | undefined;
    __triggerStart: number;
    __store: () => StoreApi<State>;
    value: T | undefined;
    isLoading: boolean;
    trigger: () => Promise<T>;
}

type Primitive = string | number | boolean | null | undefined | bigint | symbol;


export type Dependencies<Store> = (s: Store) => (Query<Store, any> | Effect<Store, any> | Primitive)[];