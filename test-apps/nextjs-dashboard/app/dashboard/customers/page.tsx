import {Dogs} from "./content";
import {CounterStoreProvider} from "@/app/providers/counter-store-provider";
import {DogStoreProvider} from "@/app/store/provider";
const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const dogs = await fetchInitialDogs();
  return (
    <DogStoreProvider serverSideData={{dogs}}>
      <CounterStoreProvider>
        <p>Initial Dogs: {dogs}</p>
        <Dogs />
      </CounterStoreProvider>
    </DogStoreProvider>
  );
}