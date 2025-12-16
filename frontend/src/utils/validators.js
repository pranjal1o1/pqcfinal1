// ========================================
// src/utils/validators.js
// ========================================
import { z } from 'zod';
import { FILE_UPLOAD } from './constants';

/**
 * Validate file upload
 */
export const validateFile = (file) => {
    const errors = [];

    if (!file) {
        errors.push('No file selected');
        return errors;
    }

    // Check file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
        errors.push(`File size exceeds ${FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB limit`);
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const hasValidExtension = FILE_UPLOAD.ALLOWED_TYPES.some(ext => fileName.endsWith(ext));
    const hasValidMimeType = FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(file.type);

    if (!hasValidExtension && !hasValidMimeType) {
        errors.push('Only ZIP files are allowed');
    }

    return errors;
};

/**
 * GitHub Repository URL Schema
 */
export const githubRepoSchema = z.object({
    repoUrl: z
        .string()
        .min(1, 'Repository URL is required')
        .url('Must be a valid URL')
        .refine(
            (url) => {
                try {
                    const urlObj = new URL(url);
                    return urlObj.hostname === 'github.com' && urlObj.pathname.split('/').length >= 3;
                } catch {
                    return false;
                }
            },
            { message: 'Must be a valid GitHub repository URL' }
        ),
    branch: z
        .string()
        .min(1, 'Branch name is required')
        .max(100, 'Branch name too long')
        .regex(/^[a-zA-Z0-9._/-]+$/, 'Invalid branch name format'),
});

/**
 * Report Generation Schema
 */
export const reportSchema = z.object({
    scanId: z.string().min(1, 'Scan ID is required'),
    format: z.enum(['pdf', 'csv', 'json', 'html'], {
        errorMap: () => ({ message: 'Invalid report format' }),
    }),
    includeAI: z.boolean().optional().default(true),
    includeSHAP: z.boolean().optional().default(true),
    includeDashboard: z.boolean().optional().default(true),
});

/**
 * Settings Schema
 */
export const settingsSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    emailNotifications: z.boolean().optional(),
    scanAlerts: z.boolean().optional(),
    autoScan: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
});

/**
 * Scan ID Validator
 */
export const validateScanId = (scanId) => {
    if (!scanId || typeof scanId !== 'string') {
        return { valid: false, error: 'Invalid scan ID' };
    }

    // UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(scanId)) {
        return { valid: true };
    }

    // Also accept simple alphanumeric IDs
    if (/^[a-zA-Z0-9_-]{8,}$/.test(scanId)) {
        return { valid: true };
    }

    return { valid: false, error: 'Invalid scan ID format' };
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors,
        strength: getPasswordStrength(password),
    };
};

/**
 * Get password strength score
 */
const getPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
};

/**
 * Validate URL
 */
export const validateUrl = (url) => {
    try {
        new URL(url);
        return { valid: true };
    } catch {
        return { valid: false, error: 'Invalid URL format' };
    }
};

/**
 * Validate risk level
 */
export const validateRiskLevel = (level) => {
    const validLevels = ['critical', 'high', 'medium', 'low', 'info'];
    return validLevels.includes(level?.toLowerCase());
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate, endDate) => {
    const errors = [];

    if (!startDate) {
        errors.push('Start date is required');
    }

    if (!endDate) {
        errors.push('End date is required');
    }

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime())) {
            errors.push('Invalid start date');
        }

        if (isNaN(end.getTime())) {
            errors.push('Invalid end date');
        }

        if (start > end) {
            errors.push('Start date must be before end date');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Sanitize input string
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .substring(0, 1000); // Limit length
};

/**
 * Validate JSON string
 */
export const validateJSON = (jsonString) => {
    try {
        JSON.parse(jsonString);
        return { valid: true };
    } catch (error) {
        return { valid: false, error: 'Invalid JSON format' };
    }
};

/**
 * Validate API key format
 */
export const validateApiKey = (apiKey) => {
    if (!apiKey || typeof apiKey !== 'string') {
        return { valid: false, error: 'API key is required' };
    }

    // Check minimum length
    if (apiKey.length < 32) {
        return { valid: false, error: 'API key too short' };
    }

    // Check if it's alphanumeric
    if (!/^[A-Za-z0-9_-]+$/.test(apiKey)) {
        return { valid: false, error: 'API key contains invalid characters' };
    }

    return { valid: true };
};

export default {
    validateFile,
    githubRepoSchema,
    reportSchema,
    settingsSchema,
    validateScanId,
    validateEmail,
    validatePassword,
    validateUrl,
    validateRiskLevel,
    validateDateRange,
    sanitizeInput,
    validateJSON,
    validateApiKey,
};