// ========================================
// src/pages/ScanResults.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScanOperations } from '../hooks/useScan';
import { usePolling } from '../hooks/usePolling';
import FindingCard from '../components/scan/FindingCard';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { Brain, FileText, TrendingUp } from 'lucide-react';

const ScanResults = () => {
    const { scanId } = useParams();
    const navigate = useNavigate();
    const { getResults, loading } = useScanOperations();
    const [results, setResults] = useState(null);

    const fetchResults = async () => {
        try {
            const data = await getResults(scanId);
            setResults(data);
        } catch (err) {
            console.error('Failed to fetch results:', err);
        }
    };

    const { isPolling, stopPolling } = usePolling(fetchResults, 5000, true);

    useEffect(() => {
        fetchResults();
    }, [scanId]);

    useEffect(() => {
        if (results?.status === 'completed' || results?.status === 'failed') {
            stopPolling();
        }
    }, [results?.status]);

    if (loading && !results) return <Loading text="Loading scan results..." />;

    if (!results) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <p className="text-red-400">Failed to load scan results</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Scan Results</h1>
                    <p className="text-slate-400">Scan ID: {scanId}</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => navigate(`/risk/${scanId}`)}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Risk Analysis
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate(`/ai-insights/${scanId}`)}
                    >
                        <Brain className="w-4 h-4" />
                        AI Insights
                    </Button>
                    <Button onClick={() => navigate('/reports')}>
                        <FileText className="w-4 h-4" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Status Badge */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400">Status</p>
                        <p className="text-xl font-semibold text-white capitalize">{results.status}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Total Findings</p>
                        <p className="text-xl font-semibold text-white">{results.findings?.length || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Critical Issues</p>
                        <p className="text-xl font-semibold text-red-400">
                            {results.findings?.filter(f => f.risk_level === 'critical').length || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Findings */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Findings</h2>
                {results.findings && results.findings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {results.findings.map((finding, idx) => (
                            <FindingCard
                                key={idx}
                                finding={finding}
                                onClick={() => {/* Handle click */ }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
                        <p className="text-slate-400">No findings detected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanResults;