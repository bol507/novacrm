import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toOptional = <T>(value: T | null | undefined | ''): T | undefined => {
  if (value === null || value === '' || value === undefined) {
    return undefined;
  }
  return value as T;
};