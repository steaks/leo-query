"use client";
import { DogStoreContext } from "@/app/store/provider";
import { useEffect, useContext } from "react";
import { db } from "@/app/store/db";
import { DogState } from "@/app/store/store";

export const SyncMockDb = () => {
  const ctx = useContext(DogStoreContext);

  useEffect(() => {
    (ctx?.store as any).persist.onFinishHydration((s: DogState) => {
      db.dogs = s.dogs.value || 0;
    });
  }, []);

  return null;
};

export default SyncMockDb;
