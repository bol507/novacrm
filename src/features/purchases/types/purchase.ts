export type PurchaseStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Received' | 'Cancelled';

export interface PurchaseItem {
  productid: number | null;
  sequence_no: number;
  productname: string;
  quantity: number;
  listprice: number;
  discount_percent: number;
  description: string | null;
  total?: number;
}

export interface PurchaseItemFormData {
  productid: number | null;
  sequence_no: number;
  productname: string;
  quantity: number;
  listprice: number;
  discount_percent: number;
  description: string | null;
}

export interface Purchase {
  purchaseorderid: number;
  subject: string;
  ponumber: string;
  projectid: number;
  projectname?: string;
  vendorid: number;
  vendorname?: string;
  status: PurchaseStatus;
  podate: string | null;
  validtill: string | null;
  subtotal: number;
  taxtotal: number;
  total: number;
  items: PurchaseItem[];
  description: string | null;
  assigned_user_id: number;
  assigned_user_name?: string;
  createdtime?: string;
  modifiedtime?: string;
  budget?: {
    projectBudget: number | null;
    projectSpent: number;
    percentageUsed: number;
  };
}

export interface PurchaseFormData {
  subject: string;
  projectid: number;
  vendorid: number;
  postatus: PurchaseStatus;
  podate: string | null;
  validtill: string | null;
  description: string | null;
  assigned_user_id: number;
  items: PurchaseItemFormData[];
}

export interface PurchaseFormValues {
  subject: string;
  projectid: number;
  vendorid: number;
  postatus: PurchaseStatus;
  podate?: string;
  validtill?: string;
  description?: string;
  assigned_user_id?: number;
  project_search?: string;
  vendor_search?: string;
}

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  'Draft': 'Borrador',
  'Pending Approval': 'Pendiente Aprobación',
  'Approved': 'Aprobada',
  'Received': 'Recibida',
  'Cancelled': 'Cancelada',
};

export const PURCHASE_STATUS_COLORS: Record<PurchaseStatus, string> = {
  'Draft': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  'Pending Approval': 'bg-warning/10 text-warning border-warning/20',
  'Approved': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Received': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Cancelled': 'bg-destructive/10 text-destructive border-destructive/20',
};

import { z } from "zod";

export const purchaseFormSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(255),
  projectid: z.number().min(1, "Project is required"),
  vendorid: z.number().min(1, "Vendor is required"),
  postatus: z.enum(['Draft', 'Pending Approval', 'Approved', 'Received']).default('Draft'),
  podate: z.string().optional(),
  validtill: z.string().optional(),
  description: z.string().optional(),
  assigned_user_id: z.number().optional(),
  project_search: z.string().optional(),
  vendor_search: z.string().optional(),
});