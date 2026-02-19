export type QuoteStage = 'Draft' | 'Sent' | 'Accepted' | 'Rejected';

export interface QuoteItem {
  productid?: number | null;
  sequence_no: number;
  productname: string; 
  quantity: number;
  listprice: number;
  discount_percent: number;
  netprice: number;
  total: number;
  description?: string | null;
}

export interface Quote {
  quoteid: number;
  quoteno: string;
  subject: string;
  potentialid?: number | null;
  accountid: number;
  assigned_user_id: number;
  quote_stage: QuoteStage;
  validtill?: string | null;
  closingdate?: string | null;
  description?: string | null;
  subtotal: number;
  discount_percent: number;
  total: number;
  createdtime: string;
  modifiedtime: string;
  items: QuoteItem[];
  taxes: QuoteTax[];
  
  account_name?: string;
  potential_name?: string;
  assigned_user_name?: string;
}


export interface QuoteFormData {
  subject: string;
  potentialid?: number | null;
  accountid: number;
  assigned_user_id: number;
  quote_stage: QuoteStage;
  validtill?: string | null;
  closingdate?: string | null;
  description?: string | null;
  items: Omit<QuoteItem, 'netprice' | 'total'>[]; 
}

export interface QuoteTax {
  taxname: string;      // 'tax1', 'tax2', etc.
  taxlabel: string;     // 'ITBMS', 'Sales', etc.
  percentage: number;
}