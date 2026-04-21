import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LogoutModal from './LogoutModal';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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

    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/auth/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update role');

            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            setMessage(`User promoted to ${newRole} successfully`);
        } catch (err) {
            setError(err.message);
        }
    };



    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
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
                                        <th>Role</th>
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
                                            <td>
                                                <span className={`role-badge ${user.role}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="table-actions">
                                                <button 
                                                    onClick={() => handleToggleRole(user._id, user.role)}
                                                    className={`btn-role ${user.role === 'admin' ? 'revoke' : 'promote'}`}
                                                >
                                                    {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                                </button>
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
            <LogoutModal 
                isOpen={isLogoutModalOpen}
                onConfirm={confirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
            />
        </div>
    );
};

export default AdminDashboard;
