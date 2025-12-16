// ========================================
// src/pages/NewScan.jsx
// ========================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Github } from 'lucide-react';
import { useScanOperations } from '../hooks/useScan';
import UploadZone from '../components/scan/UploadZone';
import GitHubRepoForm from '../components/scan/GitHubRepoForm';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const NewScan = () => {
    const [scanType, setScanType] = useState('upload');
    const [selectedFile, setSelectedFile] = useState(null);
    const { uploadZip, scanRepo, loading, progress } = useScanOperations();
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const result = await uploadZip(selectedFile);
            navigate(`/scan/${result.scan_id}`);
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    const handleRepoScan = async (data) => {
        try {
            const result = await scanRepo(data.repoUrl, data.branch);
            navigate(`/scan/${result.scan_id}`);
        } catch (err) {
            console.error('Repo scan failed:', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">New Security Scan</h1>
                <p className="text-slate-400">
                    Upload a ZIP file or scan a GitHub repository for cryptographic vulnerabilities
                </p>
            </div>

            <div className="flex gap-4 border-b border-slate-700">
                <button
                    onClick={() => setScanType('upload')}
                    className={`px-6 py-3 font-medium transition-all ${scanType === 'upload'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload ZIP
                </button>
                <button
                    onClick={() => setScanType('repo')}
                    className={`px-6 py-3 font-medium transition-all ${scanType === 'repo'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <Github className="w-4 h-4 inline mr-2" />
                    GitHub Repository
                </button>
            </div>

            <Card>
                {scanType === 'upload' ? (
                    <div className="space-y-6">
                        <UploadZone onFileSelect={setSelectedFile} loading={loading} />

                        {loading && progress > 0 && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-slate-400">
                                    <span>Uploading...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || loading}
                            loading={loading}
                            className="w-full"
                        >
                            Start Scan
                        </Button>
                    </div>
                ) : (
                    <GitHubRepoForm onSubmit={handleRepoScan} loading={loading} />
                )}
            </Card>
        </div>
    );
};

export default NewScan;
