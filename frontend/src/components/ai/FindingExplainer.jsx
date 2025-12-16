// ========================================
// src/components/ai/FindingExplainer.jsx
// ========================================
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useGroqAI } from '../../hooks/useGroqAI';
import Loading from '../common/Loading';

const FindingExplainer = ({ scanId, findingIndex, finding }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [explanation, setExplanation] = useState(null);
    const { explainFinding, loading } = useGroqAI();

    const handleExplain = async () => {
        if (!isOpen) {
            setIsOpen(true);
            if (!explanation) {
                try {
                    const result = await explainFinding(scanId, findingIndex);
                    setExplanation(result.explanation);
                } catch (err) {
                    console.error('Failed to get explanation:', err);
                }
            }
        } else {
            setIsOpen(false);
        }
    };

    return (
        <div className="border-t border-slate-700 mt-4 pt-4">
            <button
                onClick={handleExplain}
                className="flex items-center justify-between w-full text-left p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">AI Explanation</span>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
            </button>

            {isOpen && (
                <div className="mt-3 p-4 bg-purple-900/10 border border-purple-500/30 rounded-lg">
                    {loading && <Loading size="sm" text="Generating explanation..." />}
                    {explanation && !loading && (
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{explanation}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FindingExplainer;