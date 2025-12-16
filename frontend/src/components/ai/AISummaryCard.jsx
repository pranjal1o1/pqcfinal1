// ========================================
// src/components/ai/AISummaryCard.jsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { useGroqAI } from '../../hooks/useGroqAI';
import Loading from '../common/Loading';
import Button from '../common/Button';

const AISummaryCard = ({ scanId, companyContext }) => {
    const [summary, setSummary] = useState(null);
    const { generateSummary, loading, error } = useGroqAI();

    const handleGenerate = async () => {
        try {
            const result = await generateSummary(scanId, companyContext);
            setSummary(result.summary);
        } catch (err) {
            console.error('Failed to generate summary:', err);
        }
    };

    useEffect(() => {
        if (scanId) {
            handleGenerate();
        }
    }, [scanId]);

    return (
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">AI Executive Summary</h3>
                <Sparkles className="w-4 h-4 text-purple-400" />
            </div>

            {loading && <Loading size="sm" text="Generating AI summary..." />}

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {summary && !loading && (
                <div className="prose prose-invert max-w-none">
                    <div className="text-slate-300 whitespace-pre-wrap">{summary}</div>
                    <Button
                        onClick={handleGenerate}
                        variant="ghost"
                        size="sm"
                        className="mt-4"
                    >
                        Regenerate Summary
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AISummaryCard;
