import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const message = error.response?.data?.detail || error.message || 'An error occurred';
        console.error('[API] Response error:', message);
        return Promise.reject({ message, status: error.response?.status });
    }
);

// API Methods
export const api = {
    // Health Check
    healthCheck: () => apiClient.get('/health'),

    // Scan Operations
    uploadScan: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/scan/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    scanRepo: (repoUrl, branch = 'main') =>
        apiClient.post('/scan/repo', { repo_url: repoUrl, branch }),

    getScanResults: (scanId) => apiClient.get(`/scan/results/${scanId}`),

    listScans: (limit = 10) => apiClient.get(`/scan/list?limit=${limit}`),

    // Risk Analysis
    getRiskAnalysis: (scanId) => apiClient.get(`/risk/analysis/${scanId}`),

    getAiResults: (limit = 50) => apiClient.get(`/risk/ai-results?limit=${limit}`),

    getTopPriorities: (limit = 10) => apiClient.get(`/risk/top-priorities?limit=${limit}`),

    getRiskByLevel: (level) => apiClient.get(`/risk/by-risk-level/${level}`),

    getDashboard: () => apiClient.get('/risk/dashboard'),

    getStatistics: () => apiClient.get('/risk/statistics'),

    getShapData: () => apiClient.get('/risk/shap'),

    // Reports
    generateReport: (scanId, format = 'pdf', options = {}) =>
        apiClient.post('/report/generate', {
            scan_id: scanId,
            format,
            include_ai_analysis: options.includeAi ?? true,
            include_shap_plots: options.includeShap ?? true,
            include_dashboard: options.includeDashboard ?? true,
        }),

    exportReport: (scanId, format) => {
        return axios.get(`${API_BASE_URL}/report/export/${scanId}/${format}`, {
            responseType: 'blob',
        });
    },

    listReports: (scanId) => apiClient.get(`/report/list/${scanId}`),

    // Groq AI
    generateExecutiveSummary: (scanId, companyContext) =>
        apiClient.post('/groq/executive-summary', {
            scan_id: scanId,
            company_context: companyContext,
        }),

    askQuestion: (scanId, question, includeTechnical = false) =>
        apiClient.post('/groq/ask', {
            scan_id: scanId,
            question,
            include_technical_details: includeTechnical,
        }),

    explainFinding: (scanId, findingIndex, level = 'executive') =>
        apiClient.get(`/groq/explain/${scanId}/${findingIndex}?explanation_level=${level}`),

    getGroqStatus: () => apiClient.get('/groq/status'),
};

export default apiClient;