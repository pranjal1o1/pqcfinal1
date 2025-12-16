// ========================================
// src/hooks/useScan.js
// ========================================
import { useState } from 'react';
import scanService from '../services/scanService';
import { useApp } from '../context/AppContext';

export const useScanOperations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const { showSuccess, showError } = useApp();

    const uploadZip = async (file) => {
        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            const result = await scanService.uploadZip(file, (percent) => {
                setProgress(percent);
            });
            showSuccess('File uploaded successfully');
            return result;
        } catch (err) {
            const message = err.message || 'Failed to upload file';
            setError(message);
            showError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const scanRepo = async (repoUrl, branch = 'main') => {
        setLoading(true);
        setError(null);

        try {
            const result = await scanService.scanRepo(repoUrl, branch);
            showSuccess('Repository scan started');
            return result;
        } catch (err) {
            const message = err.message || 'Failed to scan repository';
            setError(message);
            showError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getResults = async (scanId) => {
        setLoading(true);
        setError(null);

        try {
            const result = await scanService.getResults(scanId);
            return result;
        } catch (err) {
            const message = err.message || 'Failed to fetch scan results';
            setError(message);
            showError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        uploadZip,
        scanRepo,
        getResults,
        loading,
        error,
        progress,
    };
};
