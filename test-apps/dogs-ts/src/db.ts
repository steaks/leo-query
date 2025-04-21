const db = {dogs: 0};

// Simulated async functions

export const fetchDogs = (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(db.dogs);
    }, 5000);
  });
};

export const increasePopulation = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.dogs = db.dogs + 1;
      resolve();
    }, 5000);
  });
};

export const removeAllDogs = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.dogs = db.dogs = 0;
      resolve();
    }, 500);
  });
};