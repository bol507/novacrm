import { useState,  useRef, useCallback } from 'react';

type CheckFn = (name: string) => Promise<boolean>;


export function useAsyncNameValidation(
  checkFn: CheckFn,
  debounceMs = 400,
) {
  const [isChecking, setIsChecking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 const validate = useCallback(async (value: string, onError?: (msg: string) => void, onSuccess?: () => void) => {
    if (!value || value.length < 3) {
      onSuccess?.();
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsChecking(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const isAvailable = await checkFn(value);
        if (!isAvailable) {
          onError?.('Este nombre ya está en uso');
        } else {
          onSuccess?.();
        }
      } catch {
        // Ignorar errores de red; el submit los manejará
      } finally {
        setIsChecking(false);
      }
    }, debounceMs);
  }, [checkFn, debounceMs]);

  
  const cancel = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return { isChecking, validate, cancel };
}