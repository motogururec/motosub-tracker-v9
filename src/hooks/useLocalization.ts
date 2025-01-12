import { useCallback } from 'react';

export function useLocalization() {
  const t = useCallback((key: string) => {
    return key;
  }, []);

  return { 
    t,
    isLoading: false
  };
}