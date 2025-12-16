// ========================================
// src/context/ScanContext.jsx
// ========================================
import React, { createContext, useContext, useState, useCallback } from 'react';
import scanService from '../services/scanService';
import { useApp } from './AppContext';

const ScanContext = createContext(null);

export const useScan = () => {
    const context = useContext(ScanContext);
    if (!context) {
        throw new Error('useScan must be used within ScanProvider');
    }
    return context;
};

export const ScanProvider = ({ children }) => {
    const [scans, setScans] = useState([]);
    const [currentScan, setCurrentScan] = useState(null);
    const [recentScans, setRecentScans] = useState([]);
    const { showSuccess, showError } = useApp();

    // Fetch all scans
    const fetchScans = useCallback(async (limit = 10) => {
        try {
            const data = await scanService.listScans(limit);
            setScans(data.scans || []);
            return data.scans;
        } catch (error) {
            showError(error.message || 'Failed to fetch scans');
            return [];
        }
    }, [showError]);

    // Fetch scan by ID
    const fetchScanById = useCallback(async (scanId) => {
        try {
            const data = await scanService.getResults(scanId);
            setCurrentScan(data);
            return data;
        } catch (error) {
            showError(error.message || 'Failed to fetch scan details');
            return null;
        }
    }, [showError]);

    // Add scan to recent list
    const addToRecent = useCallback((scan) => {
        setRecentScans((prev) => {
            const filtered = prev.filter((s) => s.scan_id !== scan.scan_id);
            const updated = [scan, ...filtered].slice(0, 5); // Keep last 5

            // Save to localStorage
            try {
                localStorage.setItem('recent_scans', JSON.stringify(updated));
            } catch (error) {
                console.error('Failed to save recent scans:', error);
            }

            return updated;
        });
    }, []);

    // Load recent scans from localStorage
    const loadRecentScans = useCallback(() => {
        try {
            const stored = localStorage.getItem('recent_scans');
            if (stored) {
                const parsed = JSON.parse(stored);
                setRecentScans(parsed);
                return parsed;
            }
        } catch (error) {
            console.error('Failed to load recent scans:', error);
        }
        return [];
    }, []);

    // Clear recent scans
    const clearRecentScans = useCallback(() => {
        setRecentScans([]);
        try {
            localStorage.removeItem('recent_scans');
        } catch (error) {
            console.error('Failed to clear recent scans:', error);
        }
    }, []);

    // Update scan status
    const updateScanStatus = useCallback((scanId, status) => {
        setScans((prev) =>
            prev.map((scan) =>
                scan.scan_id === scanId ? { ...scan, status } : scan
            )
        );

        if (currentScan?.scan_id === scanId) {
            setCurrentScan((prev) => ({ ...prev, status }));
        }
    }, [currentScan]);

    // Delete scan (placeholder - implement if backend supports)
    const deleteScan = useCallback((scanId) => {
        setScans((prev) => prev.filter((scan) => scan.scan_id !== scanId));
        setRecentScans((prev) => prev.filter((scan) => scan.scan_id !== scanId));

        if (currentScan?.scan_id === scanId) {
            setCurrentScan(null);
        }

        showSuccess('Scan deleted successfully');
    }, [currentScan, showSuccess]);

    // Get scan statistics
    const getScanStats = useCallback(() => {
        const total = scans.length;
        const completed = scans.filter((s) => s.status === 'completed').length;
        const pending = scans.filter((s) => s.status === 'pending' || s.status === 'processing').length;
        const failed = scans.filter((s) => s.status === 'failed').length;

        return {
            total,
            completed,
            pending,
            failed,
            completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
        };
    }, [scans]);

    // Filter scans by status
    const filterScansByStatus = useCallback((status) => {
        return scans.filter((scan) => scan.status === status);
    }, [scans]);

    // Search scans
    const searchScans = useCallback((query) => {
        if (!query) return scans;

        const lowerQuery = query.toLowerCase();
        return scans.filter((scan) => {
            return (
                scan.scan_id?.toLowerCase().includes(lowerQuery) ||
                scan.source?.toLowerCase().includes(lowerQuery) ||
                scan.status?.toLowerCase().includes(lowerQuery)
            );
        });
    }, [scans]);

    const value = {
        // State
        scans,
        currentScan,
        recentScans,

        // Methods
        fetchScans,
        fetchScanById,
        addToRecent,
        loadRecentScans,
        clearRecentScans,
        updateScanStatus,
        deleteScan,
        getScanStats,
        filterScansByStatus,
        searchScans,
        setCurrentScan,
    };

    return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
};