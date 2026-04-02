export interface Client {
  // Required fields (never null in database)
  accountid: number;
  account_no: string;
  accountname: string;
  
  //  Optional fields (can be null in database)
  parentid: number | null;  
  account_type: string | null;
  industry: string | null;
  annualrevenue: number | null;
  rating: string | null;
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
  
  // Vtiger boolean flags stored as "0" or "1" strings (required)
  emailoptout: "0" | "1";
  notify_owner: "0" | "1";
  isconvertedfromlead: "0" | "1";
  
  tags: string | null;
  is_active: boolean;
  
  // Billing address (all optional)
  bill_street: string | null;
  bill_city: string | null;
  bill_state: string | null;
  bill_code: string | null;
  bill_country: string | null;
  bill_pobox: string | null;
  
  // Shipping address (all optional)
  ship_street: string | null;
  ship_city: string | null;
  ship_state: string | null;
  ship_code: string | null;
  ship_country: string | null;
  ship_pobox: string | null;
  
  //  Audit fields from vtiger_crmentity (optional)
  createdtime?: string;        // "YYYY-MM-DD HH:MM:SS"
  modifiedtime?: string;       // "YYYY-MM-DD HH:MM:SS"
  smcreatorid?: number;        // User ID who created the record
  smownerid?: number;          // User ID who owns the record
  modifiedby?: number;         // User ID who last modified the record
  
  // Description from vtiger_crmentity
  description?: string | null;
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

/**
 * Form values for creating or updating a client.
 * Matches the validation schema used in ClientForm.
 * 
 * @remarks
 * - Boolean fields (emailoptout, notify_owner, isconvertedfromlead) 
 *   are converted to "0"/"1" strings when sending to Vtiger API
 * - All fields except accountname are optional for partial updates
 * - Address fields support both billing (bill_*) and shipping (ship_*) prefixes
 */
export interface ClientFormData {
  // Required fields
  accountname: string;
  
  // Optional identity fields
  account_no?: string;
  account_type?: AccountType | string;
  industry?: Industry | string;
  rating?: Rating | string;
  ownership?: string;
  siccode?: string;
  tickersymbol?: string;
  
  // Contact information
  phone?: string;
  otherphone?: string;
  email1?: string;
  email2?: string;
  website?: string;
  fax?: string;
  
  // Financial information
  annualrevenue?: number;
  employees?: number;
  
  // Boolean flags (converted to "0"/"1" for API)
  emailoptout: boolean;
  notify_owner: boolean;
  isconvertedfromlead: boolean;
  
  // Billing address
  bill_street?: string;
  bill_city?: string;
  bill_state?: string;
  bill_code?: string;
  bill_country?: string;
  bill_pobox?: string;
  
  // Shipping address
  ship_street?: string;
  ship_city?: string;
  ship_state?: string;
  ship_code?: string;
  ship_country?: string;
  ship_pobox?: string;
  
  // Description (stored in vtiger_crmentity)
  description?: string;
}

/**
 * Summary of related entities for a client.
 * Used to display counts in the client detail view.
 */
export interface ClientSummary {
  clientId: number;
  opportunitiesCount: number;
  quotesCount: number;
  projectsCount: number;
  contactsCount: number;
  lastActivity?: string;
}

/**
 * View mode options for client list display.
 * 
 * @remarks
 * - "cards": Grid layout with visual client cards, better for visual scanning
 * - "table": Tabular layout with sortable columns, better for data comparison
 * - User preference can be persisted to localStorage for consistent experience
 */
export type ClientViewMode = "cards" | "table";