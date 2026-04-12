import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
    { icon: '📊', title: 'Spending Treemap', desc: 'Visualize where every rupee goes with an interactive heatmap.' },
    { icon: '🏪', title: 'Top Merchants', desc: 'See your top 5 merchants ranked by total spend.' },
    { icon: '📈', title: 'Burn Rate Gauge', desc: 'Know your monthly spend rate at a glance.' },
    { icon: '🛫', title: 'Financial Runway', desc: 'How many months until your balance hits zero?' },
];

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Ambient background */}
            <div className="landing-bg">
                <div className="landing-orb orb-1" />
                <div className="landing-orb orb-2" />
                <div className="landing-orb orb-3" />
                <div className="landing-grid" />
            </div>

            <div className="landing-wrapper">
                {/* NAV */}
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="landing-nav"
                >
                    <span className="landing-nav-brand">FinSights</span>
                    <div className="landing-nav-links">
                        <button onClick={() => navigate('/login')} className="landing-nav-btn">Login</button>
                        <button onClick={() => navigate('/register')} className="landing-nav-cta">Get Started</button>
                    </div>
                </motion.nav>

                {/* HERO */}
                <div className="landing-hero">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="landing-badge"
                    >
                        <span className="badge-dot" />
                        Privacy‑First · AI‑Powered · Zero Storage
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.2 }}
                        className="landing-hero-title"
                    >
                        Understand Your
                        <br />
                        <span className="hero-gradient-text">Financial DNA</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.35 }}
                        className="landing-hero-sub"
                    >
                        Upload your bank statement and get instant AI‑powered insights —
                        spending patterns, burn rate, merchant breakdown and more.
                        <strong> Your financial data never leaves your session.</strong>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="landing-hero-actions"
                    >
                        <button onClick={() => navigate('/register')} className="landing-cta-primary">
                            Start for Free
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                        <button onClick={() => navigate('/login')} className="landing-cta-secondary">
                            Sign In
                        </button>
                    </motion.div>

                    {/* trust badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.75 }}
                        className="landing-trust"
                    >
                        <span>🔒 Bank-grade privacy</span>
                        <span className="trust-divider">·</span>
                        <span>⚡ Results in seconds</span>
                        <span className="trust-divider">·</span>
                        <span>🛡️ No data stored</span>
                    </motion.div>
                </div>

                {/* FEATURE CARDS */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="landing-features-grid"
                >
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            className="landing-feature-card glass-card"
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        >
                            <div className="lfc-icon">{f.icon}</div>
                            <h3 className="lfc-title">{f.title}</h3>
                            <p className="lfc-desc">{f.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Landing;
