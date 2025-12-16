// ========================================
// src/components/scan/FindingCard.jsx
// ========================================
import React from 'react';
import { AlertTriangle, FileCode, MapPin } from 'lucide-react';
import { getRiskBadgeClass } from '../../utils/formatters';

const FindingCard = ({ finding, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-white mb-1">{finding.algorithm}</h4>
                        <p className="text-sm text-slate-400">{finding.description || 'Cryptographic vulnerability detected'}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getRiskBadgeClass(finding.risk_level)}`}>
                    {finding.risk_level?.toUpperCase()}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FileCode className="w-4 h-4" />
                    <span className="font-mono text-xs">{finding.file_path}</span>
                </div>
                {finding.line_number && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>Line {finding.line_number}</span>
                    </div>
                )}
            </div>

            {finding.recommendation && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500">
                        <strong className="text-blue-400">Recommendation:</strong> {finding.recommendation}
                    </p>
                </div>
            )}
        </div>
    );
};

export default FindingCard;