// ========================================
// src/utils/constants.js
// ========================================

// Risk Levels
export const RISK_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info',
};

// Risk Level Display Names
export const RISK_LEVEL_NAMES = {
    [RISK_LEVELS.CRITICAL]: 'Critical',
    [RISK_LEVELS.HIGH]: 'High',
    [RISK_LEVELS.MEDIUM]: 'Medium',
    [RISK_LEVELS.LOW]: 'Low',
    [RISK_LEVELS.INFO]: 'Info',
};

// Scan Status
export const SCAN_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
};

// Report Formats
export const REPORT_FORMATS = {
    PDF: 'pdf',
    CSV: 'csv',
    JSON: 'json',
    HTML: 'html',
};

// File Upload
export const FILE_UPLOAD = {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_TYPES: ['.zip'],
    ALLOWED_MIME_TYPES: ['application/zip', 'application/x-zip-compressed'],
};

// API Configuration
export const API_CONFIG = {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
};

// Polling Configuration
export const POLLING_CONFIG = {
    SCAN_RESULTS_INTERVAL: 5000, // 5 seconds
    DASHBOARD_INTERVAL: 30000, // 30 seconds
};

// Vulnerable Algorithms
export const VULNERABLE_ALGORITHMS = [
    'MD5',
    'SHA1',
    'DES',
    'RC4',
    'RSA-1024',
    'ECB',
];

// Recommended Algorithms
export const RECOMMENDED_ALGORITHMS = [
    'SHA-256',
    'SHA-384',
    'SHA-512',
    'AES-256',
    'ChaCha20',
    'RSA-2048',
    'RSA-4096',
    'ECDSA',
    'Ed25519',
];

// Chart Colors
export const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
};

// Risk Score Ranges
export const RISK_SCORE_RANGES = {
    CRITICAL: { min: 8.0, max: 10.0 },
    HIGH: { min: 6.0, max: 7.9 },
    MEDIUM: { min: 4.0, max: 5.9 },
    LOW: { min: 2.0, max: 3.9 },
    INFO: { min: 0.0, max: 1.9 },
};

// Date Formats
export const DATE_FORMATS = {
    SHORT: 'MMM d, yyyy',
    LONG: 'MMMM d, yyyy',
    WITH_TIME: 'MMM d, yyyy h:mm a',
    ISO: 'yyyy-MM-dd',
};

// Notification Duration
export const NOTIFICATION_DURATION = 5000; // 5 seconds

// Local Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
    THEME: 'theme',
    RECENT_SCANS: 'recent_scans',
};

// AI Configuration
export const AI_CONFIG = {
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    EXPLANATION_LEVELS: ['executive', 'technical', 'developer'],
};

// Navigation Items
export const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/scan/new', label: 'New Scan', icon: 'Scan' },
    { path: '/reports', label: 'Reports', icon: 'FileText' },
];

export default {
    RISK_LEVELS,
    RISK_LEVEL_NAMES,
    SCAN_STATUS,
    REPORT_FORMATS,
    FILE_UPLOAD,
    API_CONFIG,
    POLLING_CONFIG,
    VULNERABLE_ALGORITHMS,
    RECOMMENDED_ALGORITHMS,
    CHART_COLORS,
    RISK_SCORE_RANGES,
    DATE_FORMATS,
    NOTIFICATION_DURATION,
    STORAGE_KEYS,
    AI_CONFIG,
    NAV_ITEMS,
};