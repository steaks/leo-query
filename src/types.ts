export interface Effect<State> {
    readonly __id: string;
    readonly __type: "Effect";
    readonly __deps: Dependencies<State>;
    readonly __key: keyof State,
    readonly __valueCounter: number
    readonly __triggers: Promise<void>[];
    isLoading: boolean;
    trigger: () => Promise<void>;
}

export interface Query<State, T> {
    readonly __id: string;
    readonly __type: "Query";
    readonly __key: keyof State,
    readonly __deps: Dependencies<State>;
    readonly __debounce: number,
    __trigger: Promise<T> | undefined;
    __triggerStart: number;
    value: T | undefined;
    isLoading: boolean;
    trigger: () => Promise<T>;
}

export type Dependencies<Store> = (keyof Store)[];