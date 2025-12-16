// ========================================
// src/components/reports/ReportGenerator.jsx
// ========================================
import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import reportService from '../../services/reportService';
import { useApp } from '../../context/AppContext';

const ReportGenerator = ({ scanId }) => {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit } = useForm({
        defaultValues: {
            format: 'pdf',
            includeAI: true,
            includeSHAP: true,
            includeDashboard: true,
        },
    });
    const { showSuccess, showError } = useApp();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await reportService.generate(scanId, data);
            await reportService.download(scanId, data.format);
            showSuccess('Report generated successfully');
        } catch (error) {
            showError(error.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Generate Report</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Report Format
                    </label>
                    <select {...register('format')} className="input">
                        <option value="pdf">PDF Report</option>
                        <option value="csv">CSV Data</option>
                        <option value="json">JSON Data</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" {...register('includeAI')} className="w-4 h-4 rounded" />
                        <span className="text-sm text-slate-300">Include AI Analysis</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" {...register('includeSHAP')} className="w-4 h-4 rounded" />
                        <span className="text-sm text-slate-300">Include SHAP Plots</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" {...register('includeDashboard')} className="w-4 h-4 rounded" />
                        <span className="text-sm text-slate-300">Include Dashboard</span>
                    </label>
                </div>

                <Button type="submit" loading={loading} className="w-full">
                    <Download className="w-4 h-4" />
                    Generate & Download
                </Button>
            </form>
        </div>
    );
};

export default ReportGenerator;
