"use client";

import { useCounterStore, useCounterStoreAsync } from "@/app/store/provider";
import { useEffect } from "react";

function logWithEnv(message: string) {
  const env = typeof window === 'undefined' ? 'Server' : 'Browser';
  console.log(`[${env}] ${message}`);
}

interface Props {
  initialDogs: number;
  timestamp: number;
}

export const Content = (p: Props) => {
  console.log("initialDogs2", p.initialDogs);
  const store = useCounterStore();
  const dogs = useCounterStoreAsync(s => s.dogs, {serverValue: p.initialDogs, serverValueTimestamp: p.timestamp});
  const [count, incrementCount] = useCounterStore(s => [s.count, s.incrementCount]);
  logWithEnv(`count: ${count}`);
  console.log("dogs", dogs.value);
  return (
    <div>
      <p>Customers Page</p>
      <p>Count: {count}</p>
      <button onClick={incrementCount}>Increment</button>
      <p>Dogs: {dogs.value}</p>
    </div>
  );
};

export const Content2 = () => {
  logWithEnv("Content2");
  return <div>Content2</div>;
};