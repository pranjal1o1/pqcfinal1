// ========================================
// src/components/dashboard/TimelineChart.jsx
// ========================================
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '../../utils/formatters';

const TimelineChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Scan Timeline</h3>
                <p className="text-slate-400 text-center py-8">No timeline data available</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Scan Timeline</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                        }}
                        labelFormatter={(date) => formatDate(date)}
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TimelineChart;