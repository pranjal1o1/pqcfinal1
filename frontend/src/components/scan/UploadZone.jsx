// ========================================
// src/components/scan/UploadZone.jsx
// ========================================
import React, { useState, useCallback } from 'react';
import { Upload, File, X } from 'lucide-react';
import { validateFile } from '../../utils/validators';
import { formatFileSize } from '../../utils/formatters';

const UploadZone = ({ onFileSelect, loading = false }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState([]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        const validationErrors = validateFile(file);
        setErrors(validationErrors);

        if (validationErrors.length === 0) {
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setErrors([]);
    };

    return (
        <div className="space-y-4">
            <div
                className={`relative border-2 border-dashed rounded-lg transition-all ${dragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                    } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".zip"
                    onChange={handleChange}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="p-12 text-center">
                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-white mb-2">
                        Drop your ZIP file here, or click to browse
                    </p>
                    <p className="text-sm text-slate-400">
                        Maximum file size: 100MB
                    </p>
                </div>
            </div>

            {selectedFile && !loading && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <File className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="font-medium text-white">{selectedFile.name}</p>
                            <p className="text-sm text-slate-400">{formatFileSize(selectedFile.size)}</p>
                        </div>
                    </div>
                    <button
                        onClick={clearFile}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            )}

            {errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="font-medium text-red-400 mb-2">Validation Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, idx) => (
                            <li key={idx} className="text-sm text-red-300">{error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UploadZone;