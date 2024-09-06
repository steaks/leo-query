const db = {bears: 0};

// Simulated async functions

export const fetchBears = (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(db.bears);
    }, 500);
  });
};

export const increasePopulation = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears + 1;
      resolve();
    }, 500);
  });
};

export const increaseMultiplePopulation = (value: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears + value;
      resolve();
    }, 500);
  });
};

export const removeAllBears = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears = 0;
      resolve();
    }, 500);
  });
};