import { useState, useCallback, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Treemap from './components/Treemap';
import BarChart from './components/BarChart';
import Gauge from './components/Gauge';
import Runway from './components/Runway';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, role }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/" />;

    return children;
};

function MainApp() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

    const handleFile = useCallback(async (file) => {
        if (!file || file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setIsLoading(true);
        setError(null);
        setUploadProgress(5);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev < 30) return prev + 8;
                    if (prev < 60) return prev + 5;
                    if (prev < 85) return prev + 2;
                    return Math.min(prev + 1, 90);
                });
            }, 200);

            const token = localStorage.getItem('token');
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    // Inclusion of token if analyze is protected
                    'Authorization': `Bearer ${token}`
                },
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

            setTimeout(() => {
                setUploadProgress(0);
            }, 500);
        } catch (err) {
            setError(err.message);
            setUploadProgress(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const runwayMonths = useMemo(() => {
        return data?.summary?.monthly_burn_rate > 0
            ? (data.summary.current_balance / data.summary.monthly_burn_rate).toFixed(1)
            : 0;
    }, [data]);

    return (
        <div className="app-container">
            <AnimatePresence mode="wait">
                {!data ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* UPLOAD PAGE */}
                        <div className="upload-page">
                            <div className="upload-bg-gradient" />

                            {/* Top-right logout button */}
                            <div className="upload-topbar">
                                <button onClick={handleLogout} className="upload-logout-btn">Logout</button>
                            </div>

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
                                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                    onDragLeave={() => setIsDragOver(false)}
                                    onClick={() => !isLoading && document.getElementById('file-input').click()}
                                >
                                    <input
                                        type="file"
                                        id="file-input"
                                        accept=".pdf"
                                        onChange={(e) => handleFile(e.target.files[0])}
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
                                                    <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                </div>
                                                <h3 className="upload-title-zone">
                                                    {isDragOver ? 'Drop to Analyze' : 'Upload Bank Statement'}
                                                </h3>
                                                <p className="upload-instruction">
                                                    Drag &amp; drop your PDF or <span className="browse-link">Browse</span>
                                                </p>
                                                <p className="upload-format">Supported format: PDF</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {error && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="upload-error">
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
                        className="dashboard-page"
                    >
                        <header className="mb-8 flex items-center justify-between">
                            <h1 className="brand-title">FinSights</h1>
                            <div className="flex gap-4">
                                <button onClick={() => setData(null)} className="upload-new-btn">Upload New</button>
                                <button onClick={handleLogout} className="btn-logout">Logout</button>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="col-span-1 lg:col-span-2 glass-card p-6">
                                <h2 className="text-2xl font-semibold mb-2 text-white">Transaction Ledger</h2>
                                <Treemap data={data?.ledger || []} />
                            </div>
                            <div className="col-span-1 lg:col-span-2 glass-card p-6">
                                <h2 className="text-2xl font-semibold mb-4 text-white">Top Merchants</h2>
                                <BarChart data={data?.merchants?.slice(0, 5) || []} />
                            </div>
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-semibold mb-4 text-white">Burn Rate</h2>
                                <Gauge totalDebit={data?.summary?.total_debit || 0} totalCredit={data?.summary?.total_credit || 0} />
                            </div>
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-semibold mb-4 text-white">Runway</h2>
                                <Runway months={runwayMonths} balance={data?.summary?.current_balance || 0} burnRate={data?.summary?.monthly_burn_rate || 0} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/upload" element={
                    <ProtectedRoute role="user">
                        <MainApp />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute role="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
