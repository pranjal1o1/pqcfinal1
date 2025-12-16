// ========================================
// src/services/reportService.js
// ========================================
import api from './api';

const reportService = {
    generate: async (scanId, options = {}) => {
        const response = await api.post('/report/generate', {
            scan_id: scanId,
            include_ai_analysis: options.includeAI ?? true,
            include_shap_plots: options.includeSHAP ?? true,
            include_dashboard: options.includeDashboard ?? true,
            format: options.format || 'pdf',
        });
        return response.data;
    },

    download: async (scanId, format = 'pdf') => {
        const response = await api.get(`/report/export/${scanId}/${format}`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `crypto_report_${scanId}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    },

    list: async (scanId) => {
        const response = await api.get(`/report/list/${scanId}`);
        return response.data;
    },
};

export default reportService;
