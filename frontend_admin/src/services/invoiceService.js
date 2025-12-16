import api from "./api";

const unwrap = (resp) => resp?.data ?? resp;

/**
 * Invoice Service
 * Handles all invoice-related API calls for admin
 * Backend API: /api/v1/admin/invoices
 */
export const invoiceService = {
    /**
     * Get paginated list of export invoices (from orders)
     * GET /api/v1/admin/invoices/export
     * @param {Object} params - Query parameters
     * @param {number} params.pageNo - Page number (default: 1)
     * @param {number} params.pageSize - Page size (default: 10)
     * @param {string} params.fromDate - Filter from date (ISO string)
     * @param {string} params.toDate - Filter to date (ISO string)
     * @param {string} params.status - Filter by status
     * @returns {Promise<PageResponse<ExportInvoiceDTO>>}
     */
    getExportInvoices: async (params = {}) => {
        const {
            pageNo = 1,
            pageSize = 10,
            fromDate,
            toDate,
            status,
        } = params;

        const queryParams = { pageNo, pageSize };

        if (fromDate) queryParams.fromDate = fromDate;
        if (toDate) queryParams.toDate = toDate;
        if (status) queryParams.status = status;

        const response = await api.get("/admin/invoices/export", { params: queryParams });
        return unwrap(response);
    },

    /**
     * Get export invoice detail by order ID
     * GET /api/v1/admin/invoices/export/{orderId}
     * @param {number} orderId - Order ID
     * @returns {Promise<ExportInvoiceDTO>}
     */
    getExportInvoiceById: async (orderId) => {
        const response = await api.get(`/admin/invoices/export/${orderId}`);
        return unwrap(response);
    },

    /**
     * Print export invoice (one-time only)
     * POST /api/v1/admin/invoices/export/{orderId}/print
     * @param {number} orderId - Order ID
     * @returns {Promise<ExportInvoiceDTO>} - Returns invoice data for printing
     * @throws {Error} - 409 Conflict if already printed
     */
    printExportInvoice: async (orderId) => {
        const response = await api.post(`/admin/invoices/export/${orderId}/print`);
        return unwrap(response);
    },

    /**
     * Get paginated list of import invoices (from purchase orders)
     * GET /api/v1/admin/invoices/import
     * @param {Object} params - Query parameters
     * @param {number} params.pageNo - Page number (default: 1)
     * @param {number} params.pageSize - Page size (default: 10)
     * @param {string} params.fromDate - Filter from date (ISO string)
     * @param {string} params.toDate - Filter to date (ISO string)
     * @param {number} params.supplierId - Filter by supplier ID
     * @returns {Promise<PageResponse<ImportInvoiceDTO>>}
     */
    getImportInvoices: async (params = {}) => {
        const {
            pageNo = 1,
            pageSize = 10,
            fromDate,
            toDate,
            supplierId,
        } = params;

        const queryParams = { pageNo, pageSize };

        if (fromDate) queryParams.fromDate = fromDate;
        if (toDate) queryParams.toDate = toDate;
        if (supplierId) queryParams.supplierId = supplierId;

        const response = await api.get("/admin/invoices/import", { params: queryParams });
        return unwrap(response);
    },

    /**
     * Get import invoice detail by purchase order ID
     * GET /api/v1/admin/invoices/import/{purchaseOrderId}
     * @param {number} purchaseOrderId - Purchase Order ID
     * @returns {Promise<ImportInvoiceDTO>}
     */
    getImportInvoiceById: async (purchaseOrderId) => {
        const response = await api.get(`/admin/invoices/import/${purchaseOrderId}`);
        return unwrap(response);
    },

    /**
     * Print import invoice (one-time only)
     * POST /api/v1/admin/invoices/import/{purchaseOrderId}/print
     * @param {number} purchaseOrderId - Purchase Order ID
     * @returns {Promise<ImportInvoiceDTO>} - Returns invoice data for printing
     * @throws {Error} - 409 Conflict if already printed
     */
    printImportInvoice: async (purchaseOrderId) => {
        const response = await api.post(`/admin/invoices/import/${purchaseOrderId}/print`);
        return unwrap(response);
    },
};
