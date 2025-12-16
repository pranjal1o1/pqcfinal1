// ========================================
// src/components/dashboard/RiskChart.jsx
// ========================================
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RiskChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-center py-8">No data available</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="level" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Findings" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RiskChart;