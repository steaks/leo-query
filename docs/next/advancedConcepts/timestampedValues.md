# Timestamped Values

The query function provides a method for providing data and a timestamp the data was retrieved. This can be useful if you want use the data only if it was retrieved more recently than the current value in the query. This can be useful in edge cases with SSR frameworks like Next.js

## Usage
### Basic Example

```typescript
//server component
import {DogStoreProvider} from "@/app/store/provider";
import {Content} from "./content";

const fetchInitialDogs = async () => 
  Promise.resolve(100);

export default async function Page() {
  const initialDogs = await fetchInitialDogs();
  const timestamp = Date.now();
  return (
    <DogStoreProvider>
      <p>Initial Dogs: {initialDogs}</p>
      <Content initialDogs={initialDogs} timestamp={timestamp} />
    </DogStoreProvider>
  );
}
```
```typescript
//client component
"use client";

import {useDogStoreAsync} from "@/app/store/provider";

interface Props {
  initialDogs: number;
  timestamp: number;
}

export const Content = (p: Props) => {
  const dogs = useDogStoreAsync(s => s.dogs, {value: p.initialDogs, timestamp: p.timestamp}); //Use the value only if it's newer than the current value

  return (
    <div>
      <p>Dogs: {dogs.value}</p>
    </div>
  );
};
```