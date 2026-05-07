import type { ApiDataResponse, PaginatedResponse } from '@/shared/types/api-response';

// 📦 Input Payloads
export interface MaterialRequestItemInput {
  name: string;
  type: 'material' | 'tool' | 'consumable' | 'service';
  reason: 'new_requirement' | 'missing' | 'damaged' | 'lost' | 'replacement' | 'other';
  qty: number;
  unit: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  est_cost?: number;
  notes?: string;
  reasonOther?: string;
}

export interface CreateMaterialRequestPayload {
  items: MaterialRequestItemInput[];
}

export interface ApproveItemDecision {
  itemId: number; 
  decision: 'approve' | 'reject' | 'partial';
  quantity?: number;
}

export interface ApproveRequestPayload {
  items: ApproveItemDecision[];
  notes?: string;
}

export interface GeneratePOPayload {
  vendor_id?: number;
  approved_item_ids: number[];
  po_notes?: string;
  expected_delivery?: string; // YYYY-MM-DD
}

export interface GeneratePOResponse {
   data:{
    purchase_order_ids: number[];
    summary: {
      total_pos: number;
      by_vendor: Array<{
        vendor_name: string;
        po_id: number;
        items_count: number;
      }>;
    };
  };
  message: string;
}

export interface RecordReceptionPayload {
  received_qty: number;
}

// 📦 Domain Entities (lo que retorna el backend en `data`)
export interface MaterialRequest {
  id: number;
  project_id: number;
  
  requested_by: number;
  requested_by_name?: string;   
  requested_by_email?: string | null;

  approved_by?: number | null;
  approved_by_name?: string | null;
  approved_at?: string | null;

  status: MaterialRequestStatus;
  submitted_at: string | null;

  rejection_notes: string | null;
  created_at: string;
  updated_at: string;
  items?: MaterialRequestItem[]; 
}

export interface MaterialRequestItem {
  id: number;
  request_id: number;
  item_name: string;
  catalog_item_type: string;
  catalog_reason_type: string;

  reason_other?: string | null;
  notes?: string | null;          // ⚠️ Nota: Según tu JSON, está en el ÍTEM, no en la cabecera
  approved_quantity?: string | number | null;
  approved_by?: number | null;

  quantity: number;
  unit: string;
  priority: string;
  estimated_cost: number | null;
  item_status: 'pending' | 'approved' | 'rejected' | 'partially_approved';
  
  vendor_id?: number | null;
}

export interface PurchaseOrder {
  id: number;
  project_id: number;
  po_number: string;
  vendor_quote_id?: number;
  material_request_id?: number;
  vendor_id: number;
  vendor_name?: string;
  status: PurchaseOrderStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  terms?: string;
  notes?: string;
  internal_notes?: string;
  created_by: number;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  items: PurchaseOrderItem[];
}

export type PurchaseOrderStatus = 
  | 'draft' | 'submitted' | 'approved' | 'rejected' 
  | 'partially_received' | 'fully_received' | 'cancelled';

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  vendor_quote_item_id?: number;
  material_request_item_id?: number;
  item_name: string;
  catalog_item_type?: string;
  unit: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  line_total: number;
  expected_delivery_date?: string;
  terms?: string;
  notes?: string;
  received_quantity: number;
  receipt_status: 'pending' | 'partial' | 'complete';
}

export interface GeneratePOFromQuotePayload {
  vendor_quote_id: number;
  items: Array<{
    vendor_quote_item_id: number;
    material_request_item_id?: number;
    item_name: string;
    unit: string;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
    line_total: number;
    expected_delivery_date?: string;
    terms?: string;
    notes?: string;
  }>;
  po_number_override?: string;
  internal_notes?: string;
}

export interface Vendor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface VendorQuote {
  id: number;
  project_id: number;
  material_request_id: number;
  vendor_id: number;
  vendor_name?: string; // Del JOIN en backend
  quote_number: string; // CF-2026-0001
  status: 'draft' | 'sent' | 'submitted' | 'negotiated' | 'accepted' | 'rejected';
  valid_until?: string;
  terms?: string;
  notes?: string;
  total_amount: number;
  created_by: number;
  created_by_name?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  items?: VendorQuoteItem[];
  created_at: string;
  updated_at: string;
}

export interface VendorQuoteItem {
  id: number;
  vendor_quote_id: number;
  material_request_item_id: number;
  item_name?: string; // Opcional: para mostrar en UI sin join extra
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent?: number;
  delivery_date?: string;
  terms?: string;
  notes?: string;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRFQPayload {
  material_request_id: number;
  vendor_id: number;
  items: Array<{
    material_request_item_id: number;
    quantity: number;
    unit: string;
    unit_price: number;
    discount_percent?: number;
    delivery_date?: string;
    terms?: string;
    notes?: string;
  }>;
  valid_until?: string;
  terms?: string;
  notes?: string;
  new_terms?: string;
}

export interface AcceptQuotePayload {
  notes?: string;
}

export type MaterialRequestStatus = 
  | 'draft' 
  | 'submitted' 
  | 'approved' 
  | 'partially_approved' 
  | 'rejected'
  | 'procurement_in_progress' 
  | 'partially_procured'       
  | 'fully_procured'          
  | 'closed';


export type CreateRequestResponse = ApiDataResponse<{ id: number }>;
export type ListRequestsResponse = PaginatedResponse<MaterialRequest>;
export type ApproveRequestResponse = ApiDataResponse<{ message: string }>;
export type ListPOsResponse = ApiDataResponse<PurchaseOrder[]>;
export type RecordReceptionResponse = ApiDataResponse<{ message: string }>;