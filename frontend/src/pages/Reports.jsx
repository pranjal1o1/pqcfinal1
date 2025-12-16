// ========================================
// src/pages/Reports.jsx
// ========================================
import React, { useState } from 'react';
import ReportGenerator from '../components/reports/ReportGenerator';
import Card from '../components/common/Card';
import { FileText } from 'lucide-react';

const Reports = () => {
    const [scanId, setScanId] = useState('');

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
                <p className="text-slate-400">Generate comprehensive security reports</p>
            </div>

            <Card>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Scan ID
                    </label>
                    <input
                        type="text"
                        value={scanId}
                        onChange={(e) => setScanId(e.target.value)}
                        placeholder="Enter scan ID"
                        className="input"
                    />
                </div>

                {scanId && <ReportGenerator scanId={scanId} />}

                {!scanId && (
                    <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-6 text-center">
                        <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                        <p className="text-slate-300">Enter a scan ID to generate a report</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Reports;