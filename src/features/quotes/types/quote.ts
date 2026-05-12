// ============================================================================
// QUOTE STAGE TYPES
// ============================================================================

/**
 * All possible quote stages in the system
 * 
 * These values should match the backend enum/database values from Vtiger CRM.
 * Used for displaying quote status throughout the application.
 */
export type QuoteStage =
  | 'Draft'
  | 'Pending'
  | 'Sent'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Converted';

/**
 * Human-readable labels for quote stages (English to Spanish)
 */
export const QUOTE_STAGE_LABELS: Record<QuoteStage, string> = {
  Draft: 'Borrador',
  Pending: 'Pendiente',
  Sent: 'Enviada',
  Accepted: 'Aceptada',
  Rejected: 'Rechazada',
  Cancelled: 'Cancelada',
  Converted: 'Convertida',
};

/**
 * Color variants for quote stage badges
 * 
 * Maps each stage to a Tailwind CSS class for consistent styling.
 */
export const QUOTE_STAGE_COLORS: Record<QuoteStage, string> = {
  Draft: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Sent: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  Accepted: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  Cancelled: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  Converted: 'bg-primary/10 text-primary border-primary/20',
};

/**
 * Type guard to validate if a string is a valid QuoteStage
 * 
 * @param value - String to validate
 * @returns True if value is a valid QuoteStage
 * 
 * @example
 * if (isValidQuoteStage(someValue)) {
 *   // TypeScript knows someValue is QuoteStage here
 *   <QuoteStatusBadge stage={someValue} />
 * }
 */
export function isValidQuoteStage(value: string): value is QuoteStage {
  return [
    'Draft',
    'Pending',
    'Sent',
    'Accepted',
    'Rejected',
    'Cancelled',
    'Converted',
  ].includes(value as QuoteStage);
}

/**
 * Get default stage if value is invalid
 * 
 * @param value - Potentially invalid stage string
 * @returns Valid QuoteStage or fallback default
 */
export function normalizeQuoteStage(value: string | null | undefined): QuoteStage {
  if (!value || !isValidQuoteStage(value)) {
    return 'Draft'; // Default fallback
  }
  return value;
}


/**
 * Normalize any QuoteStage to a valid form stage
 * 
 * @param stage - Any QuoteStage value (from backend or user input)
 * @returns Valid FormQuoteStage for form submission
 * 
 * @example
 * normalizeFormStage('Pending') // returns 'Draft'
 * normalizeFormStage('Accepted') // returns 'Accepted'
 */
export function normalizeFormStage(stage: string | null | undefined): FormQuoteStage {
  if (!stage || !isValidFormQuoteStage(stage)) {
    return 'Draft'; // Default fallback seguro
  }

  return stage;
}

// ============================================================================
// QUOTE ITEM TYPES
// ============================================================================


/**
 * Individual line item in a quote
 * 
 * Represents a product or service being quoted with pricing details.
 * Matches the Vtiger CRM inventory_items structure.
 */
export interface QuoteItem {
  productid: number | null;
  sequence_no: number;
  quantity: number;
  listprice: number;
  discount_percent: number;
  description: string | null;
  comment: string | null;
  total?: number;
  netprice?: number;
}


/**
 * Quote item form data (editable fields)
 * 
 * Used for form input validation and state management.
 * Differs from QuoteItem by allowing null/undefined for optional fields.
 */
export interface QuoteItemFormData {
  productid: number | null;
  sequence_no: number;
  quantity: number;
  listprice: number;
  discount_percent: number;
  description: string | null;
  comment: string | null;
}

// ============================================================================
// QUOTE ENTITY TYPES
// ============================================================================



/**
 * Main quote entity
 * 
 * Represents a complete quote in the CRM system with all related data.
 * Matches the Vtiger CRM vtiger_quotes table structure.
 */
export interface Quote {
  quoteid: number;
  quoteno: string;
  subject: string;
  quote_stage: QuoteStage;
  accountid: number;
  account_name?: string;
  assigned_user_id: number;
  assigned_user_name?: string;
  validtill: string | null;
  description: string | null;
  subtotal: number;
  discount_total?: number;
  taxtotal?: number;
  total: number;
  items: QuoteItem[];
  potentialid: number | null;
  contactid: number | null;
  createdtime?: string;
  modifiedtime?: string;
  smcreatorid?: number;
  smownerid?: number;
  currency_id?: number;
  conversion_rate?: number;
}


// ============================================================================
// QUOTE FORM DATA TYPES
// ============================================================================

/**
 * Quote form submission payload
 * 
 * Used when creating or updating a quote via API.
 * Contains only editable fields (excludes read-only fields like quoteid).
 */
export interface QuoteFormData {
  subject: string;
  accountid: number;
  assigned_user_id: number;
  quote_stage: QuoteStage;
  validtill: string | null;
  description: string | null;
  potentialid: number | null;
  items: QuoteItemFormData[];
}


/**
 * React Hook Form values for quote form
 * 
 * Includes additional fields for UI state (search inputs) that are not
 * part of the API payload.
 */
export interface QuoteFormValues {
  subject: string;
  accountid: number;
  assigned_user_id: number;
  quote_stage: QuoteStage;
  validtill?: string;
  description?: string;
  comment?: string;
  /** Search input for client autocomplete (not sent to API) */
  account_search?: string;
  /** Search input for user autocomplete (not sent to API) */
  assigned_user_search?: string;
}


// ============================================================================
// QUOTE API RESPONSE TYPES
// ============================================================================

/**
 * Pagination metadata from API responses
 * 
 * Standard structure used across all paginated endpoints.
 */
export interface PaginationMeta {
  /** Current page number (1-based) */
  current_page: number;
  /** Last page number available */
  last_page: number;
  /** Number of items per page */
  per_page: number;
  /** Total number of items across all pages */
  total: number;
}

/**
 * Pagination links from API responses
 * 
 * URLs for navigating through paginated results.
 */
export interface PaginationLinks {
  /** URL to first page */
  first: string;
  /** URL to last page */
  last: string;
  /** URL to previous page (undefined if on first page) */
  prev?: string;
  /** URL to next page (undefined if on last page) */
  next?: string;
}

/**
 * Standard API response wrapper for quote lists
 * 
 * Used for paginated quote list endpoints.
 */
export interface QuoteResponse {
  /** Array of quote entities */
  data: Quote[];
  /** Pagination metadata */
  meta: PaginationMeta;
  /** Pagination links */
  links: PaginationLinks;
}

/**
 * API response for single quote operations
 * 
 * Used for create, update, and delete operations.
 */
export interface QuoteOperationResponse {
  /** Success message */
  message: string;
  /** Created/updated quote data (for create/update operations) */
  data?: Quote;
  /** Quote ID (for delete operations) */
  quoteid?: number;
}


// ============================================================================
// QUOTE FILTER TYPES
// ============================================================================


/**
 * Partial quote for list views and dropdowns
 * 
 * Contains only essential fields for performance optimization.
 */
export interface QuoteSummary {
  quoteid: number;
  quoteno: string;
  subject: string;
  quote_stage: QuoteStage;
  account_name?: string;
  total: number;
  validtill: string | null;
}

export interface QuoteTax {
  taxname: string;      // 'tax1', 'tax2', etc.
  taxlabel: string;     // 'ITBMS', 'Sales', etc.
  percentage: number;
}





/**
 * Valid stages that can be set via the form
 * (subset of all possible QuoteStage values)
 */
export const FORM_QUOTE_STAGES = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Cancelled', 'Converted', 'Pending'] as const;
export function isValidFormQuoteStage(value: string): value is FormQuoteStage {
  return (FORM_QUOTE_STAGES as readonly string[]).includes(value);
}

export type FormQuoteStage = typeof FORM_QUOTE_STAGES[number];

export type QuoteViewMode = "cards" | "table";



/**
 * Quote export data structure
 * 
 * Used for generating PDF exports and reports.
 */
export interface QuoteExportData {
  quote: Quote;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  client: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  generatedAt: string;
  expiresAt: string;
}

/**
 * Quote duplication payload
 * 
 * Used when creating a new quote based on an existing one.
 */
export interface QuoteDuplicatePayload {
  /** Source quote ID to duplicate from */
  sourceQuoteId: number;
  /** New subject for the duplicated quote */
  newSubject: string;
  /** New valid until date (optional) */
  newValidTill?: string;
  /** Whether to reset stage to 'Draft' (default: true) */
  resetStage?: boolean;
}


// ============================================================================
// QUOTE SORTING TYPES
// ============================================================================

/**
 * Fields that can be used for sorting quotes
 */
export type QuoteSortField = 
  | 'subject'           // Quote subject/title
  | 'quoteno'           // Quote number (e.g., C-26-00001)
  | 'account_name'      // Client name
  | 'total'             // Total amount
  | 'subtotal'          // Subtotal
  | 'createdtime'       // Creation date
  | 'modifiedtime'      // Modification date
  | 'validtill'         // Expiration date
  | 'quote_stage';      // Quote status

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Complete sort configuration
 */
export interface QuoteSortConfig {
  field: QuoteSortField;
  direction: SortDirection;
}

/**
 * Human-readable labels for sort fields
 */
export const QUOTE_SORT_FIELD_LABELS: Record<QuoteSortField, string> = {
  subject: 'Title',
  quoteno: 'Number',
  account_name: 'Client',
  total: 'Total Amount',
  subtotal: 'Subtotal',
  createdtime: 'Creation Date',
  modifiedtime: 'Modification Date',
  validtill: 'Expiration Date',
  quote_stage: 'Status',
};

/**
 * Default sort configuration
 */
export const DEFAULT_QUOTE_SORT: QuoteSortConfig = {
  field: 'createdtime',
  direction: 'desc',
};