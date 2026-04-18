// src/features/purchases/hooks/usePurchaseFormItems.ts

import { useState, useMemo } from "react";
import type { PurchaseItemFormData } from "../types/purchase";

export const usePurchaseFormItems = (initialItems?: PurchaseItemFormData[]) => {
  const [items, setItems] = useState<PurchaseItemFormData[]>(
    initialItems?.map((item, index) => ({
      ...item,
      sequence_no: item.sequence_no || index + 1,
    })) || []
  );

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        productid: null,
        sequence_no: prev.length + 1,
        productname: '',
        quantity: 1,
        listprice: 0,
        discount_percent: 0,
        description: null,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const reorderItems = (reorderedItems: PurchaseItemFormData[]) => {
    setItems(reorderedItems);
  };

  const canRemoveItems = items.length > 1;

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    reorderItems,
    canRemoveItems,
  };
};