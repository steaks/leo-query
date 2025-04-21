import {Dogs} from "./dogs";
import {DogStoreProvider} from "@/app/store/provider";
const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const dogs = await fetchInitialDogs();
  console.log("page.tsx", dogs);
  return (
    <DogStoreProvider serverSideData={{dogs}}>
      <p>Initial Dogs: {dogs}</p>
      <Dogs />
    </DogStoreProvider>
  );
}