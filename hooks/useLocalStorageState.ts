import { useState, useEffect } from 'react';

/**
 * A custom hook that manages state in React, while persisting it to the browser's localStorage.
 * @param key The key to use in localStorage.
 * @param initialValue The initial value to use if no value is found in localStorage.
 * @returns A stateful value, and a function to update it (similar to useState).
 */
function useLocalStorageState<T>(key: string, initialValue: T) {
  // Initialize state from localStorage or the provided initial value.
  // This function is only executed on the initial render.
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      // If a value is found in localStorage, parse it. Otherwise, use the initial value.
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // Use useEffect to update localStorage whenever the state changes.
  // This effect runs after every render where `key` or `value` has changed.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorageState;