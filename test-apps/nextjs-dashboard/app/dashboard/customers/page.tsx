import {DogsStoreProvider} from "@/app/store/provider";
import {Content} from "./content";

const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const initialDogs = await fetchInitialDogs();
  const timestamp = Date.now();
  return (
    <DogsStoreProvider>
      <p>Initial Dogs: {initialDogs}</p>
      <Content initialDogs={initialDogs} timestamp={timestamp} />
    </DogsStoreProvider>
  );
}