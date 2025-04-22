import { useDogStore } from "./App";
import { db } from "./db";

export const syncMockDb = () => {
  db.dogs = useDogStore.getState().dogs.value || 0;
};
