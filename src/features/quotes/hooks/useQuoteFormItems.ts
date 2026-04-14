import { useState, useCallback } from 'react';
import type { QuoteFormData } from '../types/quote';

/**
 * Return type for useQuoteFormItems hook
 */
export interface QuoteFormItemsActions {
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, field: string, value: any) => void;
  items: QuoteFormData['items'];
  canRemoveItems: boolean;
  reorderItems: (newOrder: QuoteFormData['items']) => void;
}

/**
 * Default empty item structure
 */
const createEmptyItem = (sequenceNo: number): QuoteFormData['items'][0] => ({
  productid: null,
  sequence_no: sequenceNo,
  quantity: 1,
  listprice: 0,
  discount_percent: 0,
  description: '',
  comment: '',
});

/**
 * Custom hook for managing quote form items
 * 
 * @param initialItems - Optional initial items array (for edit mode)
 * @returns Actions and state for managing items
 * 
 * @example
 * const { items, addItem, removeItem, updateItem } = useQuoteFormItems(initialData?.items);
 */
export const useQuoteFormItems = (
  initialItems?: QuoteFormData['items']
): QuoteFormItemsActions => {
  const [items, setItems] = useState<QuoteFormData['items']>(
    initialItems && initialItems.length > 0
      ? initialItems.map((item, index) => ({
          ...item,
          sequence_no: index + 1,
          
        }))
      : [createEmptyItem(1)]
  );

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, createEmptyItem(prev.length + 1)]);
  }, []);

  const removeItem = useCallback((index: number) => {
    if (items.length <= 1) return;
    
    setItems((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, sequence_no: i + 1 }))
    );
  }, [items.length]);

  const updateItem = useCallback((index: number, field: string, value: any) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems.map((item, i) => ({ ...item, sequence_no: i + 1 }));
    });
  }, []);

  const reorderItems = (newOrder: QuoteFormData['items']) => {
  // Actualizar el estado interno con el nuevo orden
  setItems(newOrder);
};

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    canRemoveItems: items.length > 1,
    reorderItems,

  };
};