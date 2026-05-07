import apiClient from '@/shared/lib/axios';
import type {
    CreateMaterialRequestPayload,
    ApproveRequestPayload,
    GeneratePOPayload,
    CreateRequestResponse,
    ApproveRequestResponse,
    GeneratePOResponse,
    MaterialRequest,
    PurchaseOrder,
    VendorQuote,
    CreateRFQPayload,
    AcceptQuotePayload,
    Vendor,
} from '@/features/procurements/types/procurement';
import type { ApiDataResponse, PaginatedResponse } from '@/shared/types/api-response';



export const procurementService = {
    //  MATERIAL REQUESTS
    createRequest: (projectId: number, payload: CreateMaterialRequestPayload) =>
        apiClient.post<CreateRequestResponse>(
            `/projects/${projectId}/material-requests`,
            payload
        ),

    listRequests: (projectId: number, params?: { page?: number; limit?: number; status?: string }) =>
        apiClient.get<PaginatedResponse<MaterialRequest>>(
            `/projects/${projectId}/material-requests`,
            { params }
        ),

    getRequest: (projectId: number, requestId: number) =>
        apiClient.get<ApiDataResponse<MaterialRequest>>(
            `/projects/${projectId}/material-requests/${requestId}`
        ),

    approveRequest: (projectId: number, requestId: number, payload: ApproveRequestPayload) =>
        apiClient.patch<ApproveRequestResponse>(
            `/projects/${projectId}/material-requests/${requestId}/approve`,
            payload
        ),

    //  PURCHASE ORDERS
    generatePO: (projectId: number, payload: GeneratePOPayload) => {
        return apiClient.post<GeneratePOResponse>(
            `/projects/${projectId}/purchase-orders/generate`,
            payload
        );
    },

    listPOs: (projectId: number, filters?: { status?: string; vendor_id?: number }) =>
        apiClient.get<PaginatedResponse<PurchaseOrder>>(
            `/projects/${projectId}/purchase-orders`,
            { params: filters }
        ),
    getPO: (projectId: number, poId: number) =>
        apiClient.get<ApiDataResponse<PurchaseOrder>>(
            `/projects/${projectId}/purchase-orders/${poId}`
        ),
    // Vendors
    getVendors: (projectId: number) =>
        apiClient.get<{ data: Vendor[]}>(
            `/projects/${projectId}/vendors`
        ),

    // =====  VENDOR QUOTES (RFQ) =====

  createRFQ: (projectId: number, payload: CreateRFQPayload) =>
    apiClient.post<{ id: number }>(
      `/projects/${projectId}/vendor-quotes`,
      payload
    ),

  listQuotes: (projectId: number, params?: { page?: number; limit?: number; status?: string; vendor_id?: number }) =>
    apiClient.get<PaginatedResponse<VendorQuote>>(
      `/projects/${projectId}/vendor-quotes`,
      { params }
    ),

  getQuote: (projectId: number, quoteId: number) =>
    apiClient.get<ApiDataResponse<VendorQuote>>(
      `/projects/${projectId}/vendor-quotes/${quoteId}`
    ),

  sendQuote: (quoteId: number) =>
    apiClient.patch<{ message: string }>(
      `/vendor-quotes/${quoteId}/send`
    ),

  acceptQuote: (quoteId: number, payload: AcceptQuotePayload) =>
    apiClient.patch<{ message: string }>(
      `/vendor-quotes/${quoteId}/accept`,
      payload
    ),

  negotiateQuote: (quoteId: number, payload: Partial<CreateRFQPayload>) =>
    apiClient.patch<{ id: number }>(
      `/vendor-quotes/${quoteId}/negotiate`,
      payload
    ),
};