// ========================================
// src/services/groqService.js
// ========================================
import api from './api';

const groqService = {
    checkStatus: async () => {
        const response = await api.get('/groq/status');
        return response.data;
    },

    generateSummary: async (scanId, companyContext = 'Technology Company') => {
        const response = await api.post('/groq/executive-summary', {
            scan_id: scanId,
            company_context: companyContext,
            target_audience: 'Executive Leadership',
        });
        return response.data;
    },

    askQuestion: async (scanId, question, includeTechnical = false) => {
        const response = await api.post('/groq/ask', {
            scan_id: scanId,
            question,
            include_technical_details: includeTechnical,
        });
        return response.data;
    },

    explainFinding: async (scanId, findingIndex, level = 'executive') => {
        const response = await api.get(`/groq/explain/${scanId}/${findingIndex}`, {
            params: { explanation_level: level },
        });
        return response.data;
    },
};

export default groqService;