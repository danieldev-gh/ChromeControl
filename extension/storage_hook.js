// Create a proxy to intercept localStorage operations
const originalLocalStorage = window.localStorage;
const localStorageProxy = new Proxy(originalLocalStorage, {
  get(target, prop) {
    const value = target[prop];
    if (typeof value === "function") {
      return function (...args) {
        const result = value.apply(target, args);
        // Only report for methods that modify storage
        if (["setItem", "removeItem", "clear"].includes(prop)) {
          window.dispatchEvent(new CustomEvent("localStorage-changed"));
        }
        return result;
      };
    }
    return value;
  },
  set(target, prop, value) {
    target[prop] = value;
    window.dispatchEvent(new CustomEvent("localStorage-changed"));
    return true;
  },
});

// Override the global localStorage
Object.defineProperty(window, "localStorage", {
  configurable: true,
  get: () => localStorageProxy,
});
