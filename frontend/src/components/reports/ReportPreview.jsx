// ========================================
// src/components/reports/ReportPreview.jsx
// ========================================
import React from 'react';
import { FileText, Calendar, User } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const ReportPreview = ({ report }) => {
    if (!report) return null;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-blue-400" />
                <div>
                    <h4 className="font-semibold text-white">{report.filename}</h4>
                    <p className="text-sm text-slate-400">{report.format.toUpperCase()}</p>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Generated: {formatDate(report.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <User className="w-4 h-4" />
                    <span>Scan ID: {report.scan_id}</span>
                </div>
            </div>
        </div>
    );
};

export default ReportPreview;
