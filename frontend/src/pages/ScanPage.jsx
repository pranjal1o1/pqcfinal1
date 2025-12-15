import { useState } from 'react';
import { Upload, GitBranch } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const ScanPage = () => {
    const { uploadAndScan, scanRepository, loading } = useApp();
    const [selectedFile, setSelectedFile] = useState(null);
    const [repoUrl, setRepoUrl] = useState('');
    const [branch, setBranch] = useState('main');
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.name.endsWith('.zip')) {
            setSelectedFile(file);
            setError(null);
        } else {
            setError('Please select a ZIP file');
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        try {
            setError(null);
            const result = await uploadAndScan(selectedFile);
            setScanResult(result);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRepoScan = async () => {
        if (!repoUrl) {
            setError('Please enter a repository URL');
            return;
        }

        try {
            setError(null);
            const result = await scanRepository(repoUrl, branch);
            setScanResult(result);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <Loader fullScreen text="Scanning code... This may take a few minutes." />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">New Cryptographic Scan</h1>
                <p className="text-gray-600 mt-1">Upload source code or scan a repository</p>
            </div>

            {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {scanResult && (
                <Card className="bg-success-50 border border-success-200">
                    <h3 className="text-lg font-semibold text-success-900 mb-2">Scan Complete!</h3>
                    <p className="text-success-700">Scan ID: {scanResult.scan_id}</p>
                    <p className="text-success-700">Files Scanned: {scanResult.total_files_scanned}</p>
                    <p className="text-success-700">Findings: {scanResult.findings?.length || 0}</p>
                    <Button onClick={() => window.location.href = `#/results/${scanResult.scan_id}`} className="mt-4">
                        View Results
                    </Button>
                </Card>
            )}

            {/* Upload Section */}
            <Card title="Upload Source Code" subtitle="Upload a ZIP file containing your source code">
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="text-primary-600 hover:text-primary-700 font-medium">
                                Choose a file
                            </span>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".zip"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">ZIP files only, max 100MB</p>
                    </div>

                    {selectedFile && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                                Selected: <span className="font-medium">{selectedFile.name}</span>
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile}
                        loading={loading}
                        className="w-full"
                    >
                        Start Scan
                    </Button>
                </div>
            </Card>

            {/* Repository Section */}
            <Card title="Scan Git Repository" subtitle="Clone and scan a public GitHub repository">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Repository URL
                        </label>
                        <input
                            type="text"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            placeholder="https://github.com/username/repository"
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Branch
                        </label>
                        <input
                            type="text"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            placeholder="main"
                            className="input"
                        />
                    </div>

                    <Button
                        onClick={handleRepoScan}
                        disabled={!repoUrl}
                        loading={loading}
                        className="w-full"
                    >
                        <GitBranch className="w-4 h-4 mr-2" />
                        Clone & Scan Repository
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ScanPage;