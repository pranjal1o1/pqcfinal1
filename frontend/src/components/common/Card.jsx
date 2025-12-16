// ========================================
// src/components/common/Card.jsx
// ========================================
import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className = '', title, actions, ...props }) => {
    return (
        <div className={clsx('bg-slate-800 border border-slate-700 rounded-lg', className)} {...props}>
            {(title || actions) && (
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
};

export default Card;

