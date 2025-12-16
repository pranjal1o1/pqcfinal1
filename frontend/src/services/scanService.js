// ========================================
// src/services/scanService.js
// ========================================
import api from './api';

const scanService = {
    uploadZip: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/scan/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
        return response.data;
    },

    scanRepo: async (repoUrl, branch = 'main') => {
        const response = await api.post('/scan/repo', {
            repo_url: repoUrl,
            branch
        });
        return response.data;
    },

    getResults: async (scanId) => {
        const response = await api.get(`/scan/results/${scanId}`);
        return response.data;
    },

    listScans: async (limit = 10) => {
        const response = await api.get('/scan/list', { params: { limit } });
        return response.data;
    },
};

export default scanService;