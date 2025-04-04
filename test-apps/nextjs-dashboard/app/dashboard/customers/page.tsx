import { CounterStoreProvider, useCounterStore, useCounterStoreAsync } from "@/app/store/provider";
import { Content } from "./content";

const fetchInitialDogs = async () => {
  if (typeof window === 'undefined') {
    return Promise.resolve(100);
  } else {
    return Promise.resolve(1);
  }
}

export default async function Page() {
  const initialDogs = await fetchInitialDogs();
  const timestamp = Date.now();
  console.log("initialDogs", initialDogs);
  return (
    <div>
      <p>Initial Dogs: {initialDogs}</p>
      <Content initialDogs={initialDogs} timestamp={timestamp} />
    </div>
  );
}