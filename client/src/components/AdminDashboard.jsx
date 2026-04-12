import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
            setUsers(data.users);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/auth/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Delete failed');
            }
            setUsers(users.filter(u => u._id !== userId));
            setMessage('User deleted successfully');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleClearMemory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/admin/clear-data', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMessage(data.message);
        } catch (err) {
            setError('Failed to clear memory');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="admin-page">
            <div className="upload-bg-gradient" />
            <div className="admin-content">
                <header className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <div className="admin-actions">
                        <button onClick={handleClearMemory} className="btn-secondary">
                            Clear In-Memory Data
                        </button>
                        <button onClick={handleLogout} className="btn-logout">
                            Logout
                        </button>
                    </div>
                </header>

                <div className="admin-main">
                    {message && <div className="admin-message success">{message}</div>}
                    {error && <div className="admin-message error">{error}</div>}

                    <div className="glass-card admin-card">
                        <h3>Registered Users</h3>
                        <div className="user-table-container">
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Joined At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4">Loading users...</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan="4">No users found</td></tr>
                                    ) : users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="btn-delete"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
