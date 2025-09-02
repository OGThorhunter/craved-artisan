"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/session', (req, res) => {
    try {
        if (req.session && req.session.user) {
            res.json({
                user: req.session.user,
                authenticated: true
            });
        }
        else {
            res.status(401).json({
                code: 'NO_SESSION',
                message: 'No active session'
            });
        }
    }
    catch (error) {
        console.error('Session check error:', error);
        res.status(500).json({
            code: 'SESSION_ERROR',
            message: 'Error checking session'
        });
    }
});
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                code: 'MISSING_CREDENTIALS',
                message: 'Email and password are required'
            });
        }
        if (email === 'dev@local' && password === 'dev') {
            req.session.user = {
                id: 'dev',
                email: 'dev@local',
                name: 'Development User',
                vendorId: 'dev-user-id',
                role: 'vendor'
            };
            res.json({
                message: 'Login successful',
                user: req.session.user
            });
        }
        else {
            res.status(401).json({
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            code: 'LOGIN_ERROR',
            message: 'Error during login'
        });
    }
});
router.post('/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({
                    code: 'LOGOUT_ERROR',
                    message: 'Error during logout'
                });
            }
            res.json({ message: 'Logout successful' });
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            code: 'LOGOUT_ERROR',
            message: 'Error during logout'
        });
    }
});
router.get('/dev-login', (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ error: 'Not found' });
    }
    try {
        req.session.user = {
            id: 'dev',
            vendorId: 'dev-user-id',
            role: 'vendor',
            email: 'dev@local'
        };
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({
                    code: 'SESSION_ERROR',
                    message: 'Failed to save session'
                });
            }
            console.log('Dev login successful, session saved');
            res.redirect('/');
        });
    }
    catch (error) {
        console.error('Dev login error:', error);
        res.status(500).json({
            code: 'DEV_LOGIN_ERROR',
            message: 'Error during dev login'
        });
    }
});
router.get('/_health/auth', (req, res) => {
    try {
        const hasSession = !!req.session;
        const user = req.session?.user || null;
        const sid = req.sessionID || null;
        res.json({
            hasSession,
            user,
            sid,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Auth health check error:', error);
        res.status(500).json({
            error: 'Health check failed',
            message: 'Error checking authentication status'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map