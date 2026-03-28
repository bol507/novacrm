import { z } from "zod";

/**
 * Contact entity - Individual person associated with an Account.
 * Based on REAL structure of vtiger_contactdetails + vtiger_crmentity
 */
export interface Contact {
  contactid: number;
  firstname?: string;
  lastname: string; // Required in DB
  email?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
  accountid?: number; // Nullable in DB
  account_name?: string; // Denormalized from vtiger_account
  assigned_user_id?: number; // From vtiger_crmentity.smownerid
  assigned_user_name?: string; // Denormalized
  description?: string; // From vtiger_crmentity
  createdtime?: string; // From vtiger_crmentity
  modifiedtime?: string; // From vtiger_crmentity
  deleted: number; // From vtiger_crmentity
  
  // Real fields from vtiger_contactdetails
  salutation?: string;
  fax?: string;
  reportsto?: string; // String, NOT number (varchar(30) in DB)
  training?: string;
  usertype?: string;
  contacttype?: string; // Use this INSTEAD of contact_status
  otheremail?: string;
  secondaryemail?: string;
  donotcall?: string;
  emailoptout?: string;
  imagename?: string;
  reference?: string;
  notify_owner?: string;
  isconvertedfromlead?: string;
  tags?: string;
  
  // Calculated for display
  full_name?: string;
}

/**
 * Form data for creating/editing contacts (ONLY fields that persist to DB)
 */
export interface ContactFormData {
  // Required
  lastname: string;
  
  // Optional fields that exist in vtiger_contactdetails
  firstname?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
  accountid?: number | null; // Nullable per your DB
  salutation?: string;
  fax?: string;
  reportsto?: string; // String, not number
  training?: string;
  usertype?: string;
  contacttype?: string; // Instead of contact_status
  otheremail?: string;
  secondaryemail?: string;
  donotcall?: string;
  emailoptout?: string;
  imagename?: string;
  reference?: string;
  notify_owner?: string;
  isconvertedfromlead?: string;
  tags?: string;
  
  // Fields from vtiger_crmentity (handled separately)
  description?: string;
  assigned_user_id?: number; // Maps to smownerid in crmentity
}

/**
 * Filters for contact search and listing
 */
export interface ContactFilters {
  page: number;
  limit: number;
  search?: string;
  accountId?: number;
  assignedTo?: number;
  status?: 'Active' | 'Inactive';
  sortBy?: 'createdtime' | 'lastname' | 'email' | 'firstname';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Paginated API response for contacts
 */
export interface ContactResponse {
  data: Contact[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

/**
 * Search result for contact autocomplete
 */
export interface ContactSearchResult {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  account_name?: string;
  full_name: string;
}

/**
 * Zod validation schema for contact form
 * Field limits match vtiger_contactdetails column definitions
 */
export const contactFormSchema = z.object({
  // Required
  lastname: z.string().min(1, "Last name is required").max(80), // varchar(80)
  
  // Optional with DB limits
  firstname: z.string().max(40).optional(), // varchar(40)
  email: z.string().email("Invalid email").max(100).optional().or(z.literal('')), // varchar(100)
  phone: z.string().max(50).optional(), // varchar(50)
  mobile: z.string().max(50).optional(), // varchar(50)
  title: z.string().max(50).optional(), // varchar(50)
  department: z.string().max(30).optional(), // varchar(30)
  accountid: z.number().nullable().optional(), // int(11), nullable
  
  // Real fields from vtiger_contactdetails
  salutation: z.string().max(200).optional(), // varchar(200)
  fax: z.string().max(50).optional(), // varchar(50)
  reportsto: z.string().max(30).optional(), // varchar(30), NOT number
  training: z.string().max(50).optional(), // varchar(50)
  usertype: z.string().max(50).optional(), // varchar(50)
  contacttype: z.string().max(50).optional(), // varchar(50), use instead of contact_status
  otheremail: z.string().max(100).optional(), // varchar(100)
  secondaryemail: z.string().email().max(100).optional().or(z.literal('')), // varchar(100)
  donotcall: z.string().max(3).optional(), // varchar(3)
  emailoptout: z.string().max(3).optional(), // varchar(3)
  imagename: z.string().max(150).optional(), // varchar(150)
  reference: z.string().max(3).optional(), // varchar(3)
  notify_owner: z.string().max(3).optional(), // varchar(3)
  isconvertedfromlead: z.string().max(3).optional(), // varchar(3)
  tags: z.string().max(1).optional(), // varchar(1)
  
  // Fields from vtiger_crmentity
  description: z.string().optional(),
  assigned_user_id: z.number().nullable().optional(),
  
  // UI-only fields (not persisted)
  account_search: z.string().optional(),
  assigned_user_search: z.string().optional(),
});

/**
 * Form values type inferred from schema
 * Includes UI-only fields for autocomplete
 */
export type ContactFormValues = z.infer<typeof contactFormSchema>;