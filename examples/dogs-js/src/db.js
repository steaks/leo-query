const db = {dogs: 0};

// Simulated async functions

export const fetchDogs = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(db.dogs);
    }, 500);
  });
};

export const increasePopulation = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.dogs = db.dogs + 1;
      resolve();
    }, 500);
  });
};

export const removeAllDogs = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.dogs = db.dogs = 0;
      resolve();
    }, 500);
  });
};