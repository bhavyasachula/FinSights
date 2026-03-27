import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Treemap from './components/Treemap';
import BarChart from './components/BarChart';
import Gauge from './components/Gauge';
import Runway from './components/Runway';


function App() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentPage, setCurrentPage] = useState('upload');



    const handleFile = useCallback(async (file) => {
        if (!file || file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setIsLoading(true);
        setError(null);
        setUploadProgress(5); // Start immediately at 5%

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Progress updates more frequently and starts immediately
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev < 30) return prev + 8;      // Fast initial progress
                    if (prev < 60) return prev + 5;      // Medium speed
                    if (prev < 85) return prev + 2;      // Slower near end
                    return Math.min(prev + 1, 90);       // Cap at 90
                });
            }, 200);

            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze PDF');
            }

            const result = await response.json();
            setData(result);

            // Navigate to dashboard after successful processing
            setTimeout(() => {
                setCurrentPage('dashboard');
                setUploadProgress(0);
            }, 500);
        } catch (err) {
            setError(err.message);
            setUploadProgress(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile, isLoading]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsDragOver(true);
    }, [isLoading]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleInputChange = useCallback((e) => {
        const file = e.target.files[0];
        handleFile(file);
    }, [handleFile]);

    const handleUploadNew = useCallback(() => {
        setData(null);
        setError(null);
        setCurrentPage('upload');
    }, []);

    const runwayMonths = useMemo(() => {
        return data?.summary?.monthly_burn_rate > 0
            ? (data.summary.current_balance / data.summary.monthly_burn_rate).toFixed(1)
            : 0;
    }, [data]);

    return (
        <AnimatePresence mode="wait">
            {currentPage === 'upload' ? (
                <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* UPLOAD PAGE */}
                    <div className="upload-page">
                        <div className="upload-bg-gradient" />

                        <div className="upload-content">
                            {/* Logo and Title */}
                            <motion.div
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="upload-header"
                            >

                                <h1 className="upload-title">FinSights</h1>
                                <p className="upload-subtitle">Your Personal Financial Intelligence</p>
                            </motion.div>

                            {/* Project Description */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="project-description"
                            >
                                <p>
                                    Transform your bank statements into actionable insights. Upload your PDF and get
                                    instant visualizations of your spending patterns, Top Merchants, Financial Runway
                                    and Burn Rate
                                </p>
                            </motion.div>

                            {/* Upload Zone */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className={`upload-zone-full glass-card ${isDragOver ? 'drag-over' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => !isLoading && document.getElementById('file-input').click()}
                            >
                                <input
                                    type="file"
                                    id="file-input"
                                    accept=".pdf"
                                    onChange={handleInputChange}
                                    className="hidden"
                                    disabled={isLoading}
                                />

                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="upload-loading"
                                        >
                                            <div className="loading-spinner-container">
                                                <div className="spinner-ring" />
                                                <motion.div
                                                    className="spinner-ring-active"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                <span className="progress-text">{uploadProgress}%</span>
                                            </div>
                                            <p className="loading-title">Analyzing Statement</p>
                                            <p className="loading-subtitle">Extracting financial insights...</p>
                                            <div className="progress-container-full">
                                                <div className="progress-bar-full" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="ready"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="upload-ready"
                                        >
                                            <div className={`upload-icon-container ${isDragOver ? 'active' : ''}`}>
                                                <svg
                                                    className="upload-icon"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="upload-title-zone">
                                                {isDragOver ? 'Drop to Analyze' : 'Upload Bank Statement'}
                                            </h3>
                                            <p className="upload-instruction">
                                                Drag & drop your PDF or <span className="browse-link">Browse</span>
                                            </p>
                                            <p className="upload-format">Supported format: PDF</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="upload-error"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </motion.div>

                            {/* Features */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                                className="features-grid"
                            >
                                <div className="feature-item">
                                    <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #FF006E, #8338EC)' }}>📊</div>
                                    <span style={{ color: 'white' }}>Spending Treemap</span>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #3A86FF, #06FFA5)' }}>🏪</div>
                                    <span style={{ color: 'white' }}>Top Merchants</span>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #FFBE0B, #FB5607)' }}>📈</div>
                                    <span style={{ color: 'white' }}>Burn Gauge</span>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #8338EC, #3A86FF)' }}>🛫</div>
                                    <span style={{ color: 'white' }}>Financial Runway</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* DASHBOARD PAGE */}
                    <div className="dashboard-page">
                        {/* HEADER */}
                        <motion.header
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">

                                <h1 className="brand-title">
                                    FinSights
                                </h1>
                            </div>

                            <button
                                onClick={handleUploadNew}
                                className="upload-new-btn"
                            >
                                Upload New
                            </button>
                        </motion.header>

                        {/* DASHBOARD GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="col-span-1 lg:col-span-2 glass-card p-6"
                            >
                                <h2 className="text-2xl font-semibold mb-2 text-white">
                                    Transaction Ledger
                                </h2>
                                <Treemap data={data?.ledger || []} />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="col-span-1 lg:col-span-2 glass-card p-6"
                            >
                                <h2 className="text-3xl font-semibold mb-4 text-white">
                                    Merchants(Top - 5)
                                </h2>
                                <BarChart data={data?.merchants?.slice(0, 5) || []} />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card p-6"
                            >
                                <h2 className="text-xl font-semibold mb-4 text-white">
                                    Burn Rate
                                </h2>
                                <Gauge
                                    totalDebit={data?.summary?.total_debit || 0}
                                    totalCredit={data?.summary?.total_credit || 0}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="glass-card p-6"
                            >
                                <h2 className="text-xl font-semibold mb-4 text-white">
                                    Runway
                                </h2>
                                <Runway
                                    months={runwayMonths}
                                    balance={data?.summary?.current_balance || 0}
                                    burnRate={data?.summary?.monthly_burn_rate || 0}
                                />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default App;
