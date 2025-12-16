// ========================================
// src/App.jsx
// ========================================
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import ScanResults from './pages/ScanResults';
import RiskAnalysis from './pages/RiskAnalysis';
import Reports from './pages/Reports';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AppProvider } from './context/AppContext';

function App() {
    return (
        <ErrorBoundary>
            <AppProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="scan/new" element={<NewScan />} />
                            <Route path="scan/:scanId" element={<ScanResults />} />
                            <Route path="risk/:scanId" element={<RiskAnalysis />} />
                            <Route path="ai-insights/:scanId" element={<AIInsights />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </Router>
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;