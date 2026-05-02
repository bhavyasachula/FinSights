import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Profile({ handleLogout, handleClearMemory, hasData }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit name state
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [nameLoading, setNameLoading] = useState(false);
    const [nameMsg, setNameMsg] = useState({ type: '', text: '' });

    // Change password state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setUser(data.user);
                    setNewName(data.user.name);
                }
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [token]);

    const handleUpdateName = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setNameLoading(true);
        setNameMsg({ type: '', text: '' });

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName.trim() })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(prev => ({ ...prev, name: data.user.name }));
                // Sync localStorage
                const stored = JSON.parse(localStorage.getItem('user'));
                localStorage.setItem('user', JSON.stringify({ ...stored, name: data.user.name }));
                setIsEditingName(false);
                setNameMsg({ type: 'success', text: 'Name updated successfully' });
            } else {
                setNameMsg({ type: 'error', text: data.error });
            }
        } catch {
            setNameMsg({ type: 'error', text: 'Something went wrong' });
        } finally {
            setNameLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwMsg({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setPwMsg({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        if (newPassword.length < 6) {
            setPwMsg({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setPwLoading(true);
        try {
            const res = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setPwMsg({ type: 'success', text: 'Password changed successfully' });
                setShowPasswordForm(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPwMsg({ type: 'error', text: data.error });
            }
        } catch {
            setPwMsg({ type: 'error', text: 'Something went wrong' });
        } finally {
            setPwLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-bg-gradient" />
                <div className="profile-loading">Loading profile…</div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-bg-gradient" />
            <motion.div
                className="profile-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="profile-top">
                    <button onClick={() => navigate(-1)} className="profile-back-btn">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="profile-heading">My Profile</h1>
                </div>

                {/* Avatar & Role Badge */}
                <div className="profile-avatar-section">
                    <div className="profile-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="profile-identity">
                        <h2 className="profile-display-name">{user?.name}</h2>
                        <span className={`role-badge ${user?.role}`}>{user?.role}</span>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="profile-cards-grid">

                    {/* Personal Info Card */}
                    <div className="profile-card glass-card">
                        <h3 className="profile-card-title">Personal Information</h3>

                        {/* Name row */}
                        <div className="profile-field">
                            <label className="profile-label">Name</label>
                            {isEditingName ? (
                                <form onSubmit={handleUpdateName} className="profile-inline-edit">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="profile-input"
                                        autoFocus
                                        id="profile-name-input"
                                    />
                                    <div className="profile-edit-actions">
                                        <button type="submit" className="profile-save-btn" disabled={nameLoading}>
                                            {nameLoading ? 'Saving…' : 'Save'}
                                        </button>
                                        <button type="button" className="profile-cancel-btn" onClick={() => { setIsEditingName(false); setNewName(user.name); }}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="profile-value-row">
                                    <span className="profile-value">{user?.name}</span>
                                    <button className="profile-edit-btn" onClick={() => setIsEditingName(true)} id="edit-name-btn">
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        <AnimatePresence>
                            {nameMsg.text && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`profile-msg ${nameMsg.type}`}
                                >
                                    {nameMsg.text}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Email row */}
                        <div className="profile-field">
                            <label className="profile-label">Email</label>
                            <span className="profile-value">{user?.email}</span>
                        </div>

                        {/* Role row */}
                        <div className="profile-field">
                            <label className="profile-label">Role</label>
                            <span className={`role-badge ${user?.role}`}>{user?.role}</span>
                        </div>

                        {/* Member since */}
                        <div className="profile-field">
                            <label className="profile-label">Member Since</label>
                            <span className="profile-value">{formatDate(user?.createdAt)}</span>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="profile-card glass-card">
                        <h3 className="profile-card-title">Security</h3>

                        <AnimatePresence>
                            {pwMsg.text && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`profile-msg ${pwMsg.type}`}
                                >
                                    {pwMsg.text}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {!showPasswordForm ? (
                            <div className="profile-field">
                                <label className="profile-label">Password</label>
                                <div className="profile-value-row">
                                    <span className="profile-value">••••••••</span>
                                    <button className="profile-edit-btn" onClick={() => setShowPasswordForm(true)} id="change-password-btn">
                                        Change
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <motion.form
                                onSubmit={handleChangePassword}
                                className="profile-password-form"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div className="profile-field">
                                    <label className="profile-label">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="profile-input"
                                        required
                                        id="current-password-input"
                                    />
                                </div>
                                <div className="profile-field">
                                    <label className="profile-label">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="profile-input"
                                        required
                                        minLength={6}
                                        id="new-password-input"
                                    />
                                </div>
                                <div className="profile-field">
                                    <label className="profile-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="profile-input"
                                        required
                                        minLength={6}
                                        id="confirm-password-input"
                                    />
                                </div>
                                <div className="profile-edit-actions">
                                    <button type="submit" className="profile-save-btn" disabled={pwLoading}>
                                        {pwLoading ? 'Updating…' : 'Update Password'}
                                    </button>
                                    <button type="button" className="profile-cancel-btn" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwMsg({ type: '', text: '' }); }}>
                                        Cancel
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </div>
                    {/* Account & System Actions Card */}
                    <div className="profile-card glass-card">
                        <h3 className="profile-card-title">Account & System</h3>
                        
                        <div className="profile-actions-stack">
                            <div className="profile-action-item">
                                <div className="profile-action-info">
                                    <h4 className="profile-action-label">Memory Management</h4>
                                    <p className="profile-action-desc">Clear all currently loaded financial data from local memory.</p>
                                </div>
                                <button onClick={handleClearMemory} className="upload-clear-btn" id="profile-clear-btn">
                                    {hasData ? '🗑 Clear Data' : 'Memory is Clear'}
                                </button>
                            </div>

                            <div className="profile-action-item">
                                <div className="profile-action-info">
                                    <h4 className="profile-action-label">Session Control</h4>
                                    <p className="profile-action-desc">Safely sign out of your FinSights account.</p>
                                </div>
                                <button onClick={handleLogout} className="upload-logout-btn" id="profile-logout-btn">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
