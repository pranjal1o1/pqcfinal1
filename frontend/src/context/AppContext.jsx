import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/apiService';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [scans, setScans] = useState([]);
    const [currentScan, setCurrentScan] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [groqAvailable, setGroqAvailable] = useState(false);

    // Check backend health on mount
    useEffect(() => {
        checkHealth();
        checkGroqStatus();
    }, []);

    const checkHealth = async () => {
        try {
            await api.healthCheck();
        } catch (err) {
            setError('Backend is not reachable');
        }
    };

    const checkGroqStatus = async () => {
        try {
            const status = await api.getGroqStatus();
            setGroqAvailable(status.groq_available);
        } catch (err) {
            setGroqAvailable(false);
        }
    };

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await api.getDashboard();
            setDashboard(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadScans = async () => {
        try {
            setLoading(true);
            const data = await api.listScans(20);
            setScans(data.scans || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadScanResults = async (scanId) => {
        try {
            setLoading(true);
            const data = await api.getScanResults(scanId);
            setCurrentScan(data);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadAndScan = async (file) => {
        try {
            setLoading(true);
            const result = await api.uploadScan(file);
            await loadScans();
            setError(null);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const scanRepository = async (repoUrl, branch) => {
        try {
            setLoading(true);
            const result = await api.scanRepo(repoUrl, branch);
            await loadScans();
            setError(null);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        scans,
        currentScan,
        dashboard,
        loading,
        error,
        groqAvailable,
        setError,
        loadDashboard,
        loadScans,
        loadScanResults,
        uploadAndScan,
        scanRepository,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};