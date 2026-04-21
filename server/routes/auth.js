import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: 'All fields are required' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const role = email.toLowerCase() === 'admin@finsights.com' ? 'admin' : 'user';
        const user = await User.create({ name, email, password, role });
        const token = signToken(user._id);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ error: 'Invalid email or password' });

        const token = signToken(user._id);
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me  — verify token & return user
router.get('/me', protect, (req, res) => {
    res.json({ user: req.user });
});

// ── Admin Routes ──────────────────────────────────────

// GET /api/auth/admin/users
router.get('/admin/users', protect, adminOnly, async (req, res) => {
    try {
        // Find all users except the one making the request
        const users = await User.find({ _id: { $ne: req.user._id } }).select('name email role createdAt');
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/auth/admin/users/:id/role
router.patch('/admin/users/:id/role', protect, adminOnly, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.role = role;
        await user.save();

        res.json({ message: `User role updated to ${role}`, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/auth/admin/users/:id
router.delete('/admin/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/admin/clear-data  — in-memory cleanup signal
router.post('/admin/clear-data', protect, adminOnly, (req, res) => {
    // Financial data is never persisted; this is a no-op confirming the privacy-first approach
    res.json({ message: 'All in-memory financial data cleared (privacy-first: no data was stored)' });
});

export default router;
