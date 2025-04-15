# Persisting Data

You can plug into the [persist](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) middleware easily with Leo Query. Set up the persist middleware as you normally would. Then import Leo Query's merge and partialize functions. Pass them to the persist options. 

Leo Query's merge function properly handles queries and effects when merging data from your storage into the Zustand state. And the persist function properly saves query and effect data.

## Usage

### Basic Example
Pass in merge and partialize to the persist options to handle Leo Query's effects and queries properly.

```typescript
import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {effect, query, partialize, merge} from "leo-query";

const useDogStore = create<DogsState>()(persist(() => ({
    increasePopulation: effect(increasePopulation),
    removeAllDogs: effect(removeAllDogs),
    dogs: query(fetchDogs, s => [s.increasePopulation, s.removeAllDogs]),
  }), {
    name: "dogs-storage",
    merge,
    partialize
  })
);
```