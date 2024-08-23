const db = {bears: 0};

// Simulated async functions

export const bears = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(db.bears);
    }, 1000);
  });
};

export const increasePopulation = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears + 1;
      resolve();
    }, 1000);
  });
};

export const removeAllBears = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.bears = db.bears = 0;
      resolve();
    }, 1000);
  });
};