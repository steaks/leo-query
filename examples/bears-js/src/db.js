const db = {bears: 0};

// Simulated async functions

export const fetchBears = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(db.bears);
    }, 500);
  });
};

export const increasePopulation = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears + 1;
      resolve();
    }, 500);
  });
};

export const removeAllBears = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears = 0;
      resolve();
    }, 500);
  });
};