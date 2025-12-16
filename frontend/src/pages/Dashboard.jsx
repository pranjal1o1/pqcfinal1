// ========================================
// src/pages/Dashboard.jsx
// ========================================
import React from 'react';
import { useDashboard } from '../hooks/useRiskData';
import StatsGrid from '../components/dashboard/StatsGrid';
import RiskChart from '../components/dashboard/RiskChart';
import PriorityList from '../components/dashboard/PriorityList';
import TimelineChart from '../components/dashboard/TimelineChart';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const Dashboard = () => {
    const { data, loading, error } = useDashboard();
    const navigate = useNavigate();

    if (loading) return <Loading text="Loading dashboard..." />;

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    if (!data || !data.stats) {
        return (
            <EmptyState
                title="No Data Available"
                description="Start by creating your first security scan."
                action={
                    <Button onClick={() => navigate('/scan/new')}>
                        <Plus className="w-4 h-4" />
                        New Scan
                    </Button>
                }
            />
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-slate-400">Overview of your cryptographic security scans</p>
                </div>
                <Button onClick={() => navigate('/scan/new')}>
                    <Plus className="w-4 h-4" />
                    New Scan
                </Button>
            </div>

            <StatsGrid stats={data.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskChart data={data.risk_distribution} />
                <PriorityList priorities={data.top_priorities} />
            </div>

            {data.timeline && <TimelineChart data={data.timeline} />}
        </div>
    );
};

export default Dashboard;

