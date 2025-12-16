// ========================================
// src/services/riskService.js
// ========================================
import api from './api';

const riskService = {
    getDashboard: async () => {
        const response = await api.get('/risk/dashboard');
        return response.data;
    },

    getAnalysis: async (scanId) => {
        const response = await api.get(`/risk/analysis/${scanId}`);
        return response.data;
    },

    getTopPriorities: async (limit = 10) => {
        const response = await api.get('/risk/top-priorities', { params: { limit } });
        return response.data;
    },

    getByRiskLevel: async (level) => {
        const response = await api.get(`/risk/by-risk-level/${level}`);
        return response.data;
    },

    getSHAPData: async () => {
        const response = await api.get('/risk/shap');
        return response.data;
    },

    getStatistics: async () => {
        const response = await api.get('/risk/statistics');
        return response.data;
    },
};

export default riskService;
