import { z } from "zod";

export interface Vendor {
  id: number;
  vendorname: string;
  email: string | null;
  phone: string | null;
  category: string | null;
  website: string | null;
  address: string | null; 
  city: string | null;
  state: string | null;
  postalcode: string | null; 
  country: string | null;
  description: string | null;
  assigned_user_id: number;
  assigned_user_name: string | null;
  createdtime: string;
  modifiedtime: string | null;
}

export interface VendorFormValues {
  vendorname: string;
  email?: string;
  phone?: string;
  category?: string;
  website?: string;
  street?: string; 
  city?: string;
  state?: string;
  code?: string;   
  country?: string;
  description?: string;
  assigned_user_id?: number;
}

//react-hook-form
export const vendorFormSchema = z.object({
  vendorname: z.string().min(2, "Vendor name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  category: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  code: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional(),
  assigned_user_id: z.number().optional(),
});