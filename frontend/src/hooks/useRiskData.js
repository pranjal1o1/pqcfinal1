// ========================================
// src/hooks/useRiskData.js
// ========================================
import { useState, useEffect } from 'react';
import riskService from '../services/riskService';
import { useApp } from '../context/AppContext';

export const useRiskData = (scanId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showError } = useApp();

    const fetchAnalysis = async () => {
        if (!scanId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await riskService.getAnalysis(scanId);
            setData(result);
        } catch (err) {
            const message = err.message || 'Failed to fetch risk analysis';
            setError(message);
            showError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, [scanId]);

    return {
        data,
        loading,
        error,
        refetch: fetchAnalysis,
    };
};

export const useDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showError } = useApp();

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await riskService.getDashboard();
            setData(result);
        } catch (err) {
            const message = err.message || 'Failed to fetch dashboard data';
            setError(message);
            showError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    return {
        data,
        loading,
        error,
        refetch: fetchDashboard,
    };
};

