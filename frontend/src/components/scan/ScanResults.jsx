// ========================================
// src/components/scan/FindingCard.jsx
// ========================================
import React from 'react';
import { AlertCircle } from 'lucide-react';

const FindingCard = ({ finding }) => {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-white">{finding.title}</span>
            </div>
            <p className="text-sm text-slate-400">{finding.description}</p>
        </div>
    );
};

export default FindingCard;