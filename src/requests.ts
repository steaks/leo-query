import { EffectRequest, QueryRequest, Timing, GlobalOptions, LeoRequestStatus } from "./types";
import { generateUUID } from "./util";

export const completeTiming = (timing: Timing) => {
  return {
    ...timing,
    endTime: Date.now(),
    duration: Date.now() - timing.startTime
  };
};

export const replaceRequest = (requests: EffectRequest<any, any>[], request: EffectRequest<any, any>) => {
  return requests.map(r => r.id === request.id ? request : r);
};

export const startQueryRequest = <T>(startTime: number, globalOptions: GlobalOptions) => {
  const request: QueryRequest<T> = {
    id: generateUUID(globalOptions),
    type: "query",
    timing: {startTime},
    status: 'pending' as LeoRequestStatus
  };
  return request;
};

export const completeQueryRequest = <T>(request: QueryRequest<T>, result?: T, error?: any): QueryRequest<T> => {
  const response = error !== undefined ? {error} : {result};
  const status = error !== undefined ? 'error' as LeoRequestStatus : 'success' as LeoRequestStatus;
  return {
    ...request,
    timing: completeTiming(request.timing),
    response,
    status
  };
};

export const startEffectRequest = <Args extends any[], R>(args: Args, globalOptions: GlobalOptions) => {
  const startTime = Date.now();
  const request: EffectRequest<Args, R> = {
    id: generateUUID(globalOptions),
    type: "effect",
    details: {args},
    timing: {startTime},
    status: 'pending' as LeoRequestStatus
  };
  return request;
};

export const completeEffectRequest = <Args extends any[], R>(request: EffectRequest<Args, R>, result?: R, error?: any): EffectRequest<Args, R> => {
  const response = error !== undefined ? {error} : {result};
  const status = error !== undefined ? 'error' as LeoRequestStatus : 'success' as LeoRequestStatus;
  return {
    ...request,
    timing: completeTiming(request.timing),
    response,
    status
  };
};