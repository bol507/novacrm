import { useMemo } from "react";
import type { PurchaseItemFormData } from "../types/purchase";

export const usePurchaseFormCalculations = (items: PurchaseItemFormData[]) => {
  return useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.listprice || 0);
      const discount = itemTotal * ((item.discount_percent || 0) / 100);
      return sum + (itemTotal - discount);
    }, 0);

    const taxtotal = subtotal * 0.07; // 7% ITBMS
    const total = subtotal + taxtotal;

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(value);
    };

    return {
      subtotal,
      taxtotal,
      total,
      formatCurrency,
    };
  }, [items]);
};