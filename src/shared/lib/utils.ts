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

/**
 * Format date for Panama locale with abbreviated month in Spanish
 * 
 * @param dateString - ISO date string or null/undefined
 * @param format - Format pattern: 'short' (12/dic/2026) or 'long' (12 de diciembre de 2026)
 * @returns Formatted date string or '-' if invalid
 * 
 * @example
 * formatDateEs('2026-12-12') // '12/dic/2026'
 * formatDateEs(null, 'long') // '-'
 */
export const formatDateEs = (
  dateString: string | null | undefined,
  format: 'short' | 'long' = 'short'
): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return '-';
    
    if (format === 'short') {
      // Formato corto: 12/dic/2026
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      // Formato largo: 12 de diciembre de 2026
      return date.toLocaleDateString('es-PA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }
  } catch {
    return '-';
  }
};

/**
 * Format date with time for Panama locale
 * 
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted datetime string or '-' if invalid
 * 
 * @example
 * formatDateTimeEs('2026-12-12T14:30:00') // '12/dic/2026 14:30'
 */
export const formatDateTimeEs = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const datePart = formatDateEs(dateString, 'short');
    const timePart = date.toLocaleTimeString('es-PA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    return `${datePart} ${timePart}`;
  } catch {
    return '-';
  }
};