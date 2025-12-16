// ========================================
// src/pages/RiskAnalysis.jsx (FIXED)
// ========================================
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRiskData } from '../hooks/useRiskData';
import Loading from '../components/common/Loading';
import RiskChart from '../components/dashboard/RiskChart';
import Button from '../components/common/Button';
import { Shield, TrendingUp, AlertTriangle, Clock, ArrowLeft, Brain, FileText } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

const RiskAnalysis = () => {
    const { scanId } = useParams();
    const navigate = useNavigate();
    const { data, loading, error } = useRiskData(scanId);

    if (loading) return <Loading text="Loading risk analysis..." />;

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-400">No risk analysis data available</p>
            </div>
        );
    }

    // Transform risk_distribution object to array for chart
    const riskChartData = data.risk_distribution
        ? Object.entries(data.risk_distribution)
            .filter(([level]) => level !== 'Unmatched')
            .map(([level, count]) => ({
                level,
                count
            }))
        : [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/scan/${scanId}`)}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Scan
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Risk Analysis</h1>
                        <p className="text-slate-400">Scan ID: {scanId}</p>
                    </div>
                </div>
                <div className="flex gap-3">
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-8 h-8 text-blue-400" />
                        <h3 className="font-semibold text-white">Risk Score</h3>
                    </div>
                    <p className="text-4xl font-bold text-blue-400">
                        {data.average_risk_score?.toFixed(1) || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">Average across all findings</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                        <h3 className="font-semibold text-white">Critical Issues</h3>
                    </div>
                    <p className="text-4xl font-bold text-red-400">
                        {data.risk_distribution?.Critical || 0}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">Require immediate action</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-8 h-8 text-orange-400" />
                        <h3 className="font-semibold text-white">Total Findings</h3>
                    </div>
                    <p className="text-4xl font-bold text-orange-400">
                        {formatNumber(data.total_findings || 0)}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">Vulnerabilities detected</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-8 h-8 text-yellow-400" />
                        <h3 className="font-semibold text-white">Scan Date</h3>
                    </div>
                    <p className="text-lg font-bold text-yellow-400">
                        {data.scan_timestamp
                            ? new Date(data.scan_timestamp).toLocaleDateString()
                            : 'N/A'
                        }
                    </p>
                    <p className="text-sm text-slate-400 mt-2">Analysis timestamp</p>
                </div>
            </div>

            {/* Risk Distribution Chart */}
            {riskChartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RiskChart data={riskChartData} />

                    {/* Algorithm Distribution */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Algorithm Distribution</h3>
                        <div className="space-y-3">
                            {data.algorithm_distribution && Object.entries(data.algorithm_distribution).map(([algo, count]) => (
                                <div key={algo} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                                    <span className="text-slate-300 font-medium">{algo}</span>
                                    <span className="text-2xl font-bold text-blue-400">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* PQC Recommendations */}
            {data.pqc_recommendations && Object.keys(data.pqc_recommendations).length > 0 && (
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        Post-Quantum Cryptography Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(data.pqc_recommendations).map(([algo, count]) => (
                            <div key={algo} className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4">
                                <p className="text-purple-300 font-medium mb-1">{algo}</p>
                                <p className="text-2xl font-bold text-purple-400">{count} occurrences</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Migration Timelines */}
            {data.migration_timelines && Object.keys(data.migration_timelines).length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        Migration Timelines
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(data.migration_timelines).map(([timeline, count]) => (
                            <div key={timeline} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                                <span className="text-slate-300">{timeline}</span>
                                <span className="text-xl font-bold text-yellow-400">{count} items</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Priority Findings */}
            {data.priority_findings && data.priority_findings.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Priority Findings</h3>
                    <div className="space-y-3">
                        {data.priority_findings.slice(0, 5).map((finding, idx) => (
                            <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 text-xs font-medium rounded border bg-red-500/20 text-red-400 border-red-500/50">
                                                {finding.ml_risk_label}
                                            </span>
                                            <span className="text-lg font-semibold text-white">{finding.algorithm}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 font-mono mb-1">
                                            {finding.file_path.split('\\').pop()}
                                        </p>
                                        <p className="text-xs text-slate-500">Line {finding.line_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-red-400">{finding.risk_score}</p>
                                        <p className="text-xs text-slate-500">Risk Score</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-700">
                                    <span className="text-purple-400">→ {finding.recommended_pqc}</span>
                                    <span className="text-yellow-400">{finding.migration_timeline}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {data.recommendations && data.recommendations.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
                    <div className="space-y-3">
                        {data.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-white mb-1">{rec.message}</p>
                                    <p className="text-sm text-slate-400">{rec.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary Alert */}
            {data.summary?.requires_immediate_action && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <h3 className="text-lg font-semibold text-red-400">Immediate Action Required</h3>
                    </div>
                    <p className="text-slate-300 mb-2">
                        {data.summary.total_vulnerabilities} vulnerabilities detected in quantum-vulnerable algorithms.
                    </p>
                    <p className="text-slate-400 text-sm">
                        Vulnerable algorithms: {data.summary.quantum_vulnerable_algorithms?.join(', ')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default RiskAnalysis;