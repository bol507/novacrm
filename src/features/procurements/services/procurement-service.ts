import apiClient from '@/shared/lib/axios';
import type {
    CreateMaterialRequestPayload,
    ApproveRequestPayload,
    CreateRequestResponse,
    ApproveRequestResponse,
    MaterialRequest,
    PurchaseOrder,
    VendorQuote,
    CreateRFQPayload,
    AcceptQuotePayload,
    Vendor,
    GeneratePOFromQuotePayload,
    NegotiateQuoteResponse,
    RecordReceiptParams,
    RecordReceiptResponse,
    UpdatePOStatusPayload,
    UpdatePOStatusResponse,
    VendorQuoteSummary,
    UpdateMaterialRequestPayload,
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

    updateRequest: (projectId: number, requestId: number, payload: UpdateMaterialRequestPayload) =>
        apiClient.patch<ApiDataResponse<{ id: number; updated_at: string }>>(
            `/projects/${projectId}/material-requests/${requestId}`,
            payload
        ),

    approveRequest: (projectId: number, requestId: number, payload: ApproveRequestPayload) =>
        apiClient.patch<ApproveRequestResponse>(
            `/projects/${projectId}/material-requests/${requestId}/approve`,
            payload
        ),


    // Vendors
    getVendors: (projectId: number) =>
        apiClient.get<{ data: Vendor[] }>(
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

    listQuotesByMR: (projectId: number, mrId: number) =>
        apiClient.get<{ data: VendorQuoteSummary[] }>(
            `/projects/${projectId}/vendor-quotes`,
            { params: { material_request_id: mrId } }
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
            `projects/vendor-quotes/${quoteId}/accept`,
            payload
        ),


    negotiateQuote: (quoteId: number, payload: Partial<CreateRFQPayload>) =>
        apiClient.patch<NegotiateQuoteResponse>(
            `projects/vendor-quotes/${quoteId}/negotiate`,
            payload
        ),

    //  PURCHASE ORDERS
    createPOFromQuote: (projectId: number, payload: GeneratePOFromQuotePayload) =>
        apiClient.post<{ data: { id: number, po_number: string } }>(
            `/projects/${projectId}/purchase-orders/from-quote`,
            payload
        ),

    listPOs: (projectId: number, params?: { status?: string; vendor_id?: number; page?: number }) =>
        apiClient.get<{ data: PurchaseOrder[]; meta: any }>(
            `/projects/${projectId}/purchase-orders`,
            { params }
        ),

    getPO: (projectId: number, poId: number) =>
        apiClient.get<{ data: PurchaseOrder }>(
            `/projects/${projectId}/purchase-orders/${poId}`
        ),

    updatePOStatus: ({ poId, status, notes }: UpdatePOStatusPayload) =>
        apiClient.patch<UpdatePOStatusResponse>(
            `/projects/purchase-orders/${poId}/status`,
            { status, notes }
        ),

    recordReceipt: ({ poId, poItemId, payload }: RecordReceiptParams) =>
        apiClient.post<RecordReceiptResponse>(
            `/projects/purchase-orders/${poId}/items/${poItemId}/receipt`,
            payload
        ),

    downloadPOPdf: async (poId: number): Promise<Blob> => {
        const response = await apiClient.get(
            `/projects/purchase-orders/${poId}/pdf`,
            {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf',
                },
            }
        );
        return response.data;
    },

};