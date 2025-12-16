// ========================================
// src/hooks/useGroqAI.js
// ========================================
import { useState } from 'react';
import groqService from '../services/groqService';
import { useApp } from '../context/AppContext';

export const useGroqAI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showError } = useApp();

    const generateSummary = async (scanId, companyContext) => {
        setLoading(true);
        setError(null);

        try {
            const result = await groqService.generateSummary(scanId, companyContext);
            return result;
        } catch (err) {
            const message = err.message || 'Failed to generate summary';
            setError(message);
            showError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const askQuestion = async (scanId, question, includeTechnical = false) => {
        setLoading(true);
        setError(null);

        try {
            const result = await groqService.askQuestion(scanId, question, includeTechnical);
            return result;
        } catch (err) {
            const message = err.message || 'Failed to get answer';
            setError(message);
            showError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const explainFinding = async (scanId, findingIndex, level = 'executive') => {
        setLoading(true);
        setError(null);

        try {
            const result = await groqService.explainFinding(scanId, findingIndex, level);
            return result;
        } catch (err) {
            const message = err.message || 'Failed to explain finding';
            setError(message);
            showError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        generateSummary,
        askQuestion,
        explainFinding,
        loading,
        error,
    };
};