import express from 'express';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import db from '../config/db.js';
import { adminOnly } from '../middleware/adminAuth.js';
import { getErrors, clearErrors } from '../utils/errorStore.js';

const router = express.Router();

const REQUIRED_ENV_VARS = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'SMTP_HOST',
    'SMTP_PASS',
    'CLIENT_URL',
];

const API_ROUTES = [
    '/api/auth',
    '/api/machines',
    '/api/jobs',
    '/api/chat',
    '/api/payment',
    '/api/notifications',
    '/api/admin',
    '/api/reviews',
    '/api/providers',
    '/api/profile',
    '/api/support',
];

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

// Race a promise against a timeout to avoid health checks hanging
function withTimeout(promise, ms = 5000, label = 'operation') {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        ),
    ]);
}

// ─── GET /api/admin/health ────────────────────────────────────────────────────
router.get('/', adminOnly, async (req, res) => {
    const checks = {};
    const failedChecks = [];

    // 1. Database
    try {
        const start = Date.now();
        await withTimeout(db.query('SELECT 1'), 5000, 'database');
        checks.database = { status: 'ok', responseTime: `${Date.now() - start}ms` };
    } catch (err) {
        checks.database = { status: 'error', message: err.message };
        failedChecks.push('database');
    }

    // 2. API Routes (always registered — just return the manifest)
    checks.apiRoutes = { status: 'ok', count: API_ROUTES.length, routes: API_ROUTES };

    // 3. Email (SMTP)
    try {
        if (!process.env.SMTP_HOST || !process.env.SMTP_PASS) {
            throw new Error('SMTP credentials not configured');
        }
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        await withTimeout(transporter.verify(), 6000, 'SMTP');
        checks.email = { status: 'ok' };
    } catch (err) {
        checks.email = { status: 'error', message: 'SMTP connection failed' };
        failedChecks.push('email');
    }

    // 4. Razorpay
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set');
        }
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        await withTimeout(razorpay.orders.all({ count: 1 }), 6000, 'Razorpay');
        checks.razorpay = { status: 'ok' };
    } catch (err) {
        checks.razorpay = { status: 'error', message: err.message };
        failedChecks.push('razorpay');
    }

    // 5. Socket.io
    try {
        const io = global.io;
        const connectedClients = io?.engine?.clientsCount ?? 0;
        checks.socketio = { status: 'ok', connectedClients };
    } catch (err) {
        checks.socketio = { status: 'error', message: err.message };
        failedChecks.push('socketio');
    }

    // 6. Environment variables — never leak values, only existence
    const envChecks = {};
    for (const varName of REQUIRED_ENV_VARS) {
        envChecks[varName] = { exists: Boolean(process.env[varName]) };
    }
    checks.environment = envChecks;
    const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
    if (missingVars.length > 0) failedChecks.push('environment');

    // Overall status logic
    const isCritical =
        failedChecks.includes('database') ||
        missingVars.includes('JWT_ACCESS_SECRET') ||
        missingVars.includes('JWT_SECRET');

    let overall = 'healthy';
    if (isCritical) overall = 'critical';
    else if (failedChecks.length > 0) overall = 'degraded';

    res.json({
        timestamp: new Date().toISOString(),
        overall,
        uptime: formatUptime(process.uptime()),
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        checks,
        recentErrors: getErrors(),
    });
});

// ─── DELETE /api/admin/health/errors ─────────────────────────────────────────
router.delete('/errors', adminOnly, (req, res) => {
    clearErrors();
    res.json({ success: true, message: 'Error log cleared' });
});

export default router;
