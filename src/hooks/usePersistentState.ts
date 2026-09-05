import { Dispatch, SetStateAction, useEffect, useState } from 'react';

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  const storedValue = window.localStorage.getItem(key);
  if (storedValue === null) return fallback;

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export function usePersistentState<T>(key: string, fallback: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStoredValue(key, fallback));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}