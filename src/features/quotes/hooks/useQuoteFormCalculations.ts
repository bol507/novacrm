import { useMemo } from 'react';
import type { QuoteFormData } from '../types/quote';

/**
 * Return type for useQuoteFormCalculations hook
 */
export interface QuoteFormCalculations {
  /** Calculated subtotal from all items */
  subtotal: number;
  /** ITBMS tax amount (7% of subtotal) */
  itbms: number;
  /** Grand total with tax */
  totalWithTax: number;
  /** Items with updated sequence numbers and calculated totals */
  updatedItems: QuoteFormData['items'];
  /** Currency formatter function */
  formatCurrency: (value: number) => string;
}

/**
 * Custom hook for quote form financial calculations
 * 
 * @param items - Array of quote form items
 * @returns Calculated financial values and utilities
 * 
 * @example
 * const { subtotal, itbms, totalWithTax, formatCurrency } = useQuoteFormCalculations(items);
 */
export const useQuoteFormCalculations = (
  items: QuoteFormData['items']
): QuoteFormCalculations => {
  return useMemo(() => {
    let subtotal = 0;

    const updatedItems = items.map((item, index) => {
      const netprice = item.listprice * (1 - (item.discount_percent || 0) / 100);
      const total = (item.quantity || 0) * netprice;
      subtotal += total;
      return { ...item, sequence_no: index + 1 };
    });

    // ITBMS 7% (Panama tax)
    const itbms = subtotal * 0.07;
    const totalWithTax = subtotal + itbms;

    // Currency formatter for Panama (USD with 2 decimals)
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    };

    return {
      subtotal,
      itbms,
      totalWithTax,
      updatedItems,
      formatCurrency,
    };
  }, [items]);
};