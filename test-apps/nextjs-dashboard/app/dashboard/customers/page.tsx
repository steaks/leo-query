import {DogsStoreProvider} from "@/app/store/provider";
import {Content} from "./content";
import {createDogsStore, DogsState} from "@/app/store/store";

const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const initialDogs = await fetchInitialDogs();
  return (
    <DogsStoreProvider>
      <p>Initial Dogs: {initialDogs}</p>
      <Content initialDogs={initialDogs} />
    </DogsStoreProvider>
  );
}