import { useMemo } from 'react';
import type { Quote, QuoteItem } from '../types/quote';

/**
 * Custom hook for quote financial calculations.
 *
 * Provides memoized calculations and formatting utilities for quote pricing,
 * including tax calculation (ITBMS), total discounts, and currency formatting.
 *
 * @param quote - Quote object with items and pricing data, can be null or undefined
 * @returns Object containing calculated values and formatting utilities
 *
 * @example
 * // Basic usage
 * const { itbms, totalDiscountAmount, formatCurrency } = useQuoteCalculations(quote);
 *
 * @example
 * // With null safety
 * const { itbms, formatCurrency } = useQuoteCalculations(quote);
 * return <div>Total: {formatCurrency(quote?.total || 0)}</div>;
 *
 * @example
 * // Accessing all values
 * const calculations = useQuoteCalculations(quote);
 */
export const useQuoteCalculations = (quote: Quote | null | undefined) => {
  return useMemo(() => {
    if (!quote) {
      return {
        /** Panama ITBMS tax (7% of subtotal) */
        itbms: 0,
        /** Total discount amount calculated from all quote items */
        totalDiscountAmount: 0,
        /** Formats a number as USD currency with Panamanian locale */
        formatCurrency: () => '',
        /** Formats a date string (placeholder - actual formatting done in component) */
        formatDate: () => '-',
      };
    }

    // Calculate ITBMS (7% Panama tax)
    const itbms = quote.subtotal * 0.07;

    // Calculate total discount from all items
    const totalDiscountAmount = quote.items.reduce((sum, item: QuoteItem) => {
      const itemDiscount = (item.listprice * item.quantity) * (item.discount_percent / 100);
      return sum + itemDiscount;
    }, 0);

    /**
     * Formats a number as USD currency with Panamanian locale.
     *
     * @param value - The number to format
     * @returns Formatted currency string (e.g., "$1,234.56")
     */
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    };

    /**
     * Formats a date string (placeholder implementation).
     * Note: For actual date formatting, use date-fns in the consuming component.
     *
     * @param dateString - ISO date string or null
     * @returns The original date string or '-' if null
     */
    const formatDate = (dateString: string | null): string => {
      if (!dateString) return '-';
      return dateString;
    };

    return {
      itbms,
      totalDiscountAmount,
      formatCurrency,
      formatDate,
    };
  }, [quote]);
};