import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const Dashboard = () => {
    const { dashboard, loading, error, loadDashboard } = useApp();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    useEffect(() => {
        if (dashboard) {
            setStats({
                total: dashboard.total_vulnerabilities,
                critical: dashboard.critical_count,
                high: dashboard.high_count,
                medium: dashboard.medium_count,
                low: dashboard.low_count,
            });
        }
    }, [dashboard]);

    if (loading) return <Loader fullScreen text="Loading dashboard data..." />;
    if (error) return (
        <div className="p-8 text-center">
            <p className="text-danger-600">{error}</p>
            <Button onClick={loadDashboard} className="mt-4">Retry</Button>
        </div>
    );
    if (!dashboard) return null;

    const riskData = [
        { name: 'Critical', value: stats?.critical || 0, color: '#dc2626' },
        { name: 'High', value: stats?.high || 0, color: '#d97706' },
        { name: 'Medium', value: stats?.medium || 0, color: '#3b82f6' },
        { name: 'Low', value: stats?.low || 0, color: '#16a34a' },
    ].filter(d => d.value > 0);

    const algoData = Object.entries(dashboard.algorithm_distribution || {}).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
                    <p className="text-gray-600 mt-1">Post-Quantum Cryptographic Analysis</p>
                </div>
                <Button onClick={() => window.location.href = '#/scan'}>New Scan</Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-l-4 border-danger-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-danger-700">Critical</p>
                            <p className="text-3xl font-bold text-danger-900">{stats?.critical || 0}</p>
                        </div>
                        <AlertTriangle className="w-10 h-10 text-danger-600" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-l-4 border-warning-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-warning-700">High Risk</p>
                            <p className="text-3xl font-bold text-warning-900">{stats?.high || 0}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-warning-600" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700">Total Findings</p>
                            <p className="text-3xl font-bold text-blue-900">{stats?.total || 0}</p>
                        </div>
                        <Shield className="w-10 h-10 text-blue-600" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-success-50 to-success-100 border-l-4 border-success-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-success-700">AI Analyzed</p>
                            <p className="text-3xl font-bold text-success-900">{stats?.total || 0}</p>
                        </div>
                        <FileText className="w-10 h-10 text-success-600" />
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Risk Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Algorithm Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={algoData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Top Priorities */}
            <Card title="Top Priority Vulnerabilities" subtitle="Immediate action required">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Algorithm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommended PQC</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dashboard.top_priorities?.slice(0, 5).map((vuln) => (
                                <tr key={vuln.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{vuln.priority_rank}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vuln.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {vuln.current_config.algorithm}-{vuln.current_config.key_size}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={vuln.risk_assessment.ml_risk_label.toLowerCase()}>
                                            {vuln.risk_assessment.ml_risk_label}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {vuln.recommendation.recommended_pqc}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;