// ========================================
// src/components/common/EmptyState.jsx
// ========================================
import React from 'react';
import { FileX } from 'lucide-react';

const EmptyState = ({
    icon: Icon = FileX,
    title = 'No data available',
    description = 'Get started by creating your first scan.',
    action
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-slate-800 rounded-full p-4 mb-4">
                <Icon className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-center mb-6 max-w-md">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
};

export default EmptyState;