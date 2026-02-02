export interface Client {
  accountid: number;
  account_no: string;
  accountname: string;
  parentid: number;
  account_type: string | null;
  industry: string | null;
  annualrevenue: number | null;
  rating: string | null; // "Active", "Acquired", "Shutdown", etc.
  ownership: string | null;
  siccode: string | null;
  tickersymbol: string | null;
  phone: string | null;
  otherphone: string | null;
  email1: string | null;
  email2: string | null;
  website: string | null;
  fax: string | null;
  employees: number | null;
  emailoptout: "0" | "1"; // Vtiger usa strings para booleanos
  notify_owner: "0" | "1";
  isconvertedfromlead: "0" | "1";
  tags: string | null;
  is_active: boolean;
  // Dirección de facturación
  bill_street: string | null;
  bill_city: string | null;
  bill_state: string | null;
  bill_code: string | null;
  bill_country: string | null;
  bill_pobox: string | null;
  
  // Dirección de envío
  ship_street: string | null;
  ship_city: string | null;
  ship_state: string | null;
  ship_code: string | null;
  ship_country: string | null;
  ship_pobox: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}



export const ACCOUNT_TYPES = [
  "Customer",
  "Prospect",
  "Partner",
  "Reseller",
  "Supplier"
] as const;

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Transportation",
  "Energy",
  "Media",
  "Other"
] as const;

export const RATINGS = [
  "Active",
  "Acquired",
  "Shutdown"
] as const;

// Tipos derivados
export type AccountType = typeof ACCOUNT_TYPES[number];
export type Industry = typeof INDUSTRIES[number];
export type Rating = typeof RATINGS[number];