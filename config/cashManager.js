let viewCache = {};

export const setViewCache = (key, value) => {
  viewCache[key] = value;
};

export const getViewCache = (key) => {
  return viewCache[key];
};

export const deleteViewCache = (key) => {
  delete viewCache[key];
};

export const startCacheCleanup = () => {
  setInterval(() => {
    const now = Date.now();
    for (const key in viewCache) {
      if (now - viewCache[key] > 3600000) {
        // 1 hour
        delete viewCache[key];
      }
    }
    console.log("✅ Cache cleanup completed");
  }, 10 * 60 * 1000); // Run every 10 minutes
};
