// ========================================
// src/utils/formatters.js
// ========================================
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { RISK_LEVELS, DATE_FORMATS } from './constants';

/**
 * Format a number with comma separators
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date, formatStr = DATE_FORMATS.WITH_TIME) => {
    if (!date) return 'N/A';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr);
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
    if (!date) return 'Unknown';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
        console.error('Relative time formatting error:', error);
        return 'Unknown';
    }
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(decimals)}%`;
};

/**
 * Get risk level badge CSS classes
 */
export const getRiskBadgeClass = (riskLevel) => {
    const level = riskLevel?.toLowerCase();

    const classes = {
        [RISK_LEVELS.CRITICAL]: 'bg-red-500/20 text-red-400 border-red-500/50',
        [RISK_LEVELS.HIGH]: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
        [RISK_LEVELS.MEDIUM]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        [RISK_LEVELS.LOW]: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        [RISK_LEVELS.INFO]: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
    };

    return classes[level] || classes[RISK_LEVELS.INFO];
};

/**
 * Get status badge CSS classes
 */
export const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();

    const classes = {
        completed: 'bg-green-500/20 text-green-400 border-green-500/50',
        processing: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        failed: 'bg-red-500/20 text-red-400 border-red-500/50',
    };

    return classes[statusLower] || 'bg-slate-500/20 text-slate-400 border-slate-500/50';
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

/**
 * Format risk score with color
 */
export const formatRiskScore = (score) => {
    if (score === null || score === undefined) return { value: 'N/A', color: 'text-slate-400' };

    const value = typeof score === 'number' ? score.toFixed(1) : score;

    let color = 'text-slate-400';
    if (score >= 8.0) color = 'text-red-400';
    else if (score >= 6.0) color = 'text-orange-400';
    else if (score >= 4.0) color = 'text-yellow-400';
    else if (score >= 2.0) color = 'text-blue-400';
    else color = 'text-green-400';

    return { value, color };
};

/**
 * Format algorithm name for display
 */
export const formatAlgorithmName = (algorithm) => {
    if (!algorithm) return 'Unknown';
    return algorithm.toUpperCase().replace(/_/g, '-');
};

/**
 * Format file path for display (shorten long paths)
 */
export const formatFilePath = (path, maxSegments = 3) => {
    if (!path) return '';

    const segments = path.split('/');
    if (segments.length <= maxSegments) return path;

    return `.../${segments.slice(-maxSegments).join('/')}`;
};

/**
 * Format duration in milliseconds to readable string
 */
export const formatDuration = (milliseconds) => {
    if (!milliseconds) return '0s';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

/**
 * Format code snippet with line numbers
 */
export const formatCodeSnippet = (code, startLine = 1) => {
    if (!code) return [];

    const lines = code.split('\n');
    return lines.map((line, index) => ({
        number: startLine + index,
        content: line,
    }));
};

/**
 * Get severity color for charts
 */
export const getSeverityColor = (level) => {
    const colors = {
        critical: '#ef4444',
        high: '#f97316',
        medium: '#eab308',
        low: '#3b82f6',
        info: '#64748b',
    };

    return colors[level?.toLowerCase()] || colors.info;
};

/**
 * Format scan statistics for display
 */
export const formatScanStats = (stats) => {
    if (!stats) return null;

    return {
        totalScans: formatNumber(stats.total_scans),
        criticalCount: formatNumber(stats.critical_count),
        resolvedCount: formatNumber(stats.resolved_count),
        avgRiskScore: stats.avg_risk_score?.toFixed(1) || 'N/A',
    };
};

export default {
    formatNumber,
    formatFileSize,
    formatDate,
    formatRelativeTime,
    formatPercentage,
    getRiskBadgeClass,
    getStatusBadgeClass,
    truncateText,
    formatRiskScore,
    formatAlgorithmName,
    formatFilePath,
    formatDuration,
    formatCodeSnippet,
    getSeverityColor,
    formatScanStats,
};