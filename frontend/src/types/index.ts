// ========================================
// src/types/index.ts
// ========================================

// Risk Levels
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

// Scan Status
export type ScanStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Report Format
export type ReportFormat = 'pdf' | 'csv' | 'json' | 'html';

// Finding Interface
export interface Finding {
    algorithm: string;
    file_path: string;
    line_number?: number;
    risk_level: RiskLevel;
    risk_score: number;
    description?: string;
    recommendation?: string;
    code_snippet?: string;
    confidence_score?: number;
}

// Scan Result Interface
export interface ScanResult {
    scan_id: string;
    status: ScanStatus;
    source: string;
    created_at: string;
    completed_at?: string;
    findings: Finding[];
    total_findings?: number;
    risk_score?: number;
}

// Risk Analysis Interface
export interface RiskAnalysis {
    scan_id: string;
    risk_score: number;
    risk_level: RiskLevel;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    risk_distribution: RiskDistribution[];
    shap_data?: any;
    trend?: string;
}

// Risk Distribution Interface
export interface RiskDistribution {
    level: string;
    count: number;
}

// Dashboard Stats Interface
export interface DashboardStats {
    total_scans: number;
    critical_count: number;
    resolved_count: number;
    avg_risk_score: number;
}

// Dashboard Data Interface
export interface DashboardData {
    stats: DashboardStats;
    risk_distribution: RiskDistribution[];
    top_priorities: Finding[];
    timeline?: TimelineData[];
}

// Timeline Data Interface
export interface TimelineData {
    date: string;
    count: number;
}

// AI Summary Interface
export interface AISummary {
    summary: string;
    key_findings: string[];
    recommendations: string[];
}

// AI Question Response Interface
export interface AIQuestionResponse {
    answer: string;
    sources?: string[];
}

// Report Interface
export interface Report {
    report_id: string;
    scan_id: string;
    filename: string;
    format: ReportFormat;
    created_at: string;
    file_path?: string;
}

// API Error Interface
export interface APIError {
    message: string;
    status?: number;
    data?: any;
}

// Notification Interface
export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

// Upload Progress Interface
export interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

// Scan Operations Result Interface
export interface ScanOperationResult {
    scan_id: string;
    message: string;
    status: ScanStatus;
}

// Settings Interface
export interface Settings {
    email?: string;
    emailNotifications?: boolean;
    scanAlerts?: boolean;
    autoScan?: boolean;
    theme?: 'light' | 'dark' | 'auto';
}

// User Interface
export interface User {
    id: string;
    email: string;
    name?: string;
}

// Statistics Interface
export interface Statistics {
    total_scans: number;
    completed: number;
    pending: number;
    failed: number;
    completionRate: string;
}