// ========================================
// src/components/dashboard/PriorityList.jsx
// ========================================
import React from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRiskBadgeClass } from '../../utils/formatters';

const PriorityList = ({ priorities }) => {
    const navigate = useNavigate();

    if (!priorities || priorities.length === 0) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Priorities</h3>
                <p className="text-slate-400 text-center py-8">No priorities found</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Priorities</h3>
            <div className="space-y-3">
                {priorities.slice(0, 5).map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => item.scan_id && navigate(`/scan/${item.scan_id}`)}
                        className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{item.algorithm}</p>
                            <p className="text-sm text-slate-400 truncate">{item.file_path}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getRiskBadgeClass(item.risk_level)}`}>
                            {item.risk_level}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PriorityList;
