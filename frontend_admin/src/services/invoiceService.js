import api from "./api";

const unwrap = (resp) => resp?.data ?? resp;

export const invoiceService = {

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

    getExportInvoiceById: async (orderId) => {
        const response = await api.get(`/admin/invoices/export/${orderId}`);
        return unwrap(response);
    },

    printExportInvoice: async (orderId) => {
        const response = await api.post(`/admin/invoices/export/${orderId}/print`);
        return unwrap(response);
    },

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

    getImportInvoiceById: async (purchaseOrderId) => {
        const response = await api.get(`/admin/invoices/import/${purchaseOrderId}`);
        return unwrap(response);
    },

    printImportInvoice: async (purchaseOrderId) => {
        const response = await api.post(`/admin/invoices/import/${purchaseOrderId}/print`);
        return unwrap(response);
    },
};
