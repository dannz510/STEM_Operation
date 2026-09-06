// src/hooks/usePersistentState.ts
import { Dispatch, SetStateAction, useEffect, useState, useCallback } from 'react';

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue === null) return fallback;
    return JSON.parse(storedValue) as T;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export function usePersistentState<T>(key: string, fallback: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStoredValue(key, fallback));

  // Đồng bộ lại state khi key thay đổi để tránh ghi đè dữ liệu sai lệch giữa các key
  useEffect(() => {
    setValue(readStoredValue(key, fallback));
  }, [key]);

  // Lưu xuống localStorage mỗi khi value hoặc key thay đổi
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to persist state for key "${key}":`, error);
    }
  }, [key, value]);

  // Lắng nghe sự kiện storage từ các tab khác để đồng bộ real-time
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setValue(JSON.parse(event.newValue) as T);
        } catch {
          // Bỏ qua nếu dữ liệu ở tab khác bị lỗi format
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [value, setValue];
}