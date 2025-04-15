# Timestamped Values

The query function provides a method for providing data and a timestamp the data was retrieved. This can be useful if you want use the data only if it was retrieved more recently than the current value in the query. This can be useful in edge cases with SSR frameworks like Next.js

## Usage
### Basic Example

```typescript
//server component
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
```
```typescript
//client component
"use client";

import {useDogsStoreAsync} from "@/app/store/provider";

interface Props {
  initialDogs: number;
  timestamp: number;
}

export const Content = (p: Props) => {
  const dogs = useDogsStoreAsync(s => s.dogs, {value: p.initialDogs, timestamp: p.timestamp}); //Use the value only if it's newer than the current value

  return (
    <div>
      <p>Dogs: {dogs.value}</p>
    </div>
  );
};
```