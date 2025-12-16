// ========================================
// src/pages/AIInsights.jsx
// ========================================
import React from 'react';
import { useParams } from 'react-router-dom';
import AISummaryCard from '../components/ai/AISummaryCard';
import ChatInterface from '../components/ai/ChatInterface';
import { Brain } from 'lucide-react';

const AIInsights = () => {
    const { scanId } = useParams();

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">AI Insights</h1>
                    <p className="text-slate-400">AI-powered analysis for scan: {scanId}</p>
                </div>
            </div>

            <AISummaryCard scanId={scanId} companyContext="Technology Company" />

            <ChatInterface scanId={scanId} />
        </div>
    );
};

export default AIInsights;
