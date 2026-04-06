import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';
import * as authService from '../services/auth.service.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/token.util.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../validators/auth.validator.js';

export const googleAuthReact = async (req, res) => {
    try {
        console.log("AUTH HIT - googleAuthReact");
        console.log(req.body);
        const { idToken } = req.body;
        console.log("idToken:", idToken);
        if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
        let payload;
        try {
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
            payload = ticket.getPayload();
        } catch {
            return res.status(401).json({ error: 'Invalid Google token' });
        }
        const { email, name, picture } = payload;
        if (!email) return res.status(400).json({ error: 'No email in token' });
        const normalizedEmail = email.toLowerCase();
        let userResult = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
        let user;

        if (userResult.rows.length > 0) {
            user = userResult.rows[0];
            // Update photo if missing
            if (!user.photo_url) {
                await db.query('UPDATE users SET photo_url = $1 WHERE id = $2', [picture, user.id]);
            }
        } else {
            const result = await db.query(
                `INSERT INTO users (email, first_name, photo_url, role, password) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [normalizedEmail, name, picture, 'consumer', 'google-auth-react']
            );
            user = result.rows[0];
        }

        const token = generateAccessToken(user);
        return res.status(200).json({
            token,
            message: 'Login successful',
            user: { id: user.id, email: user.email, name: user.first_name, picture: user.photo_url, role: user.role }
        });
    } catch (err) {
        console.error('Google Auth React failed:', err);
        return res.status(500).json({ error: 'Database or internal error' });
    }
};
// Google ID Token Login (API)
export const googleIdTokenLogin = async (req, res) => {
    try {
        const { token: googleToken } = req.body;
        if (!googleToken) return res.status(400).json({ error: 'ID token required' });

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const normalizedEmail = payload.email.toLowerCase();

        // STEP 4 — Fix User Creation Logic
        let userResult = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [normalizedEmail]
        );

        let user;
        if (!userResult.rows.length) {
            // STEP 4 — Fix Google Login Logic (Do NOT require password)
            const newUserRes = await db.query(
                `INSERT INTO users (email, first_name, photo_url, google_id, provider, email_verified, role)
                 VALUES ($1, $2, $3, $4, 'google', true, 'consumer')
                 RETURNING *`,
                [normalizedEmail, payload.name, payload.picture || '', payload.sub]
            );
            user = newUserRes.rows[0];
        } else {
            user = userResult.rows[0];
            // Link Google ID if missing
            if (!user.google_id) {
                await db.query('UPDATE users SET google_id = $1 WHERE id = $2', [payload.sub, user.id]);
            }
        }

        // STEP 5 — Return Token Properly
        const token = generateAccessToken(user);

        res.json({
            token,
            user: user
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ error: 'Google login failed', message: err.message });
    }
};


const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
};

/**
 * Controller for Auth Endpoints
 */
export const register = async (req, res) => {
    try {
        console.log("AUTH HIT - register");
        console.log(req.body);
        const { email, password, role, firstName, lastName, phone, dob, organization } = req.body;
        const normalizedEmail = email.toLowerCase();
        const userRes = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
        if (userRes.rows.length > 0) {
            return res.status(400).json({ message: 'Account already exists. Please login.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserRes = await db.query(
            'INSERT INTO users (email, password, role, first_name, last_name, phone, dob, organization, provider) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [normalizedEmail, hashedPassword, role, firstName || null, lastName || null, phone || null, dob || null, organization || null, 'local']
        );
        const user = newUserRes.rows[0];

        // If role = expert (producer) → create producer_profiles
        if (role === 'producer') {
            await db.query(
                'INSERT INTO producer_profiles (user_id) VALUES ($1)',
                [user.id]
            );
        }

        const token = generateAccessToken(user);
        res.status(201).json({ token, user });
    } catch (err) {
        if (err.code === '23505') { // Code for unique violation
            return res.status(400).json({ message: 'Account already exists. Please login.' });
        }
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
};

/**
 * Social Login Controller (Google)
 * POST /api/auth/social-login
 */
export const socialLogin = async (req, res) => {
    try {
        const { token: idToken } = req.body;
        let payload;
        try {
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch {
            return res.status(401).json({ message: 'Invalid Google token.' });
        }
        const normalizedEmail = payload.email.toLowerCase();
        let userResult = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
        let user;

        if (userResult.rows.length > 0) {
            user = userResult.rows[0];
            if (!user.google_id) {
                await db.query('UPDATE users SET google_id = $1 WHERE id = $2', [payload.sub, user.id]);
            }
        } else {
            // STEP 4 — Fix Google Login Logic (Do NOT require password)
            const newUserRes = await db.query(
                'INSERT INTO users (email, first_name, photo_url, google_id, provider, email_verified, role) VALUES ($1, $2, $3, $4, \'google\', true, \'consumer\') RETURNING *',
                [normalizedEmail, payload.name, payload.picture || '', payload.sub]
            );
            user = newUserRes.rows[0];
        }

        const jwtToken = generateAccessToken(user);
        return res.json({ token: jwtToken, user });
    } catch (err) {
        console.error('Social login failed:', err);
        res.status(500).json({ status: "error", message: 'Social authentication via Google failed.' });
    }
};

export const login = async (req, res) => {
    try {
        console.log("AUTH HIT - login");
        console.log(req.body);
        console.log('[Auth] Login attempt for:', req.body.email);
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Missing credentials.' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Query users table (admin users have role='admin')
        const userRes = await db.query(
            "SELECT * FROM users WHERE LOWER(email) = $1",
            [normalizedEmail]
        );

        if (userRes.rows.length === 0) {
            console.log('[Auth] Login failed: No such user -', normalizedEmail);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = userRes.rows[0];

        if (user.is_deleted) {
            console.log('[Auth] Login blocked: User account deleted -', normalizedEmail);
            return res.status(403).json({ message: 'Account has been removed. Contact support.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('[Auth] Login failed: Password mismatch for', normalizedEmail);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
        const token = generateAccessToken({ id: user.id, email: user.email, role: user.role, name });
        console.log('[Auth] Login successful for', normalizedEmail, '(role:', user.role + ')');

        const userData = {
            id: user.id,
            name,
            email: user.email,
            role: user.role
        };

        res.json({
            token,
            user: userData,
            admin: userData  // alias for admin portal compatibility
        });
    } catch (err) {
        console.error('[Auth] Login exception:', err.message);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};

export const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) throw new AppError('No refresh token found', 401);

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const hRT = hashToken(refreshToken);

        const result = await db.query(
            'SELECT * FROM auth_tokens WHERE user_id = $1 AND token_hash = $2 AND revoked = FALSE AND expires_at > NOW()',
            [decoded.id, hRT]
        );

        if (result.rows.length === 0) throw new AppError('Session expired', 401);

        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        const user = userResult.rows[0];

        await db.query('UPDATE auth_tokens SET revoked = TRUE WHERE id = $1', [result.rows[0].id]);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        const hNewRT = hashToken(newRefreshToken);
        await db.query(
            'INSERT INTO auth_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
            [user.id, hNewRT, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        res.cookie('accessToken', newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({ status: 'success', accessToken: newAccessToken });
    } catch (err) {
        next(new AppError('Session invalid', 401));
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const hRT = hashToken(refreshToken);
            await db.query('UPDATE auth_tokens SET revoked = TRUE WHERE token_hash = $1', [hRT]);
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ status: 'success', message: 'Logged out' });
    } catch (err) {
        next(err);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = verifyEmailSchema.parse(req.body);
        const result = await authService.verifyUserEmail(token);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);
        await authService.initiatePasswordReset(email);
        res.json({ status: 'success', message: 'Reset email dispatched if account exists.' });
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = resetPasswordSchema.parse(req.body);
        await authService.resetUserPassword(token, password);
        res.json({ status: 'success', message: 'Password updated.' });
    } catch (err) {
        next(err);
    }
};

export const verifyToken = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ status: 'error', message: 'Token is required' });
        await authService.validateResetToken(token);
        res.json({ status: 'success', valid: true });
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const result = await db.query('SELECT id, email, role, first_name, last_name, email_verified, organization, photo_url FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'Identity lost' });
        res.json({ status: 'success', user: result.rows[0] });
    } catch (err) {
        console.error('getMe failure:', err);
        next(err);
    }
};

export const checkEmail = async (req, res, next) => {
    try {
        const email = req.params.email.toLowerCase();
        const result = await db.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
        res.json({ exists: result.rows.length > 0 });
    } catch (err) {
        next(new AppError('Identity check failure', 500));
    }
};

export const checkPhone = async (req, res, next) => {
    try {
        const { phone } = req.params;
        const result = await db.query('SELECT id FROM users WHERE phone_number = $1', [phone]);
        res.json({ exists: result.rows.length > 0 });
    } catch (err) {
        next(new AppError('Phone check failure', 500));
    }
};

/**
 * Handle Google OAuth Success
 */
export const googleAuthSuccess = async (req, res, next) => {
    try {
        console.log('[Controller] googleAuthSuccess called');
        const user = req.user;
        if (!user) {
            console.error('[Controller] No user in googleAuthSuccess');
            return res.redirect('http://localhost:5173/login?error=google_auth_failed');
        }

        // Generate JWT tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        console.log('[Controller] Tokens generated:', { accessToken, refreshToken });

        // Store refresh token hash
        const hRT = hashToken(refreshToken);
        await db.query(
            'INSERT INTO auth_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
            [user.id, hRT, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );
        console.log('[Controller] Refresh token stored');

        // Set httpOnly cookies
        res.cookie('accessToken', accessToken, { ...cookieOptions, httpOnly: true, maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        console.log('[Controller] Cookies set');

        // Redirect to frontend auth-success page with token in URL so React can persist it
        const clientUrl = process.env.CLIENT_URL?.split(',')[0]?.trim() || 'http://localhost:5173';
        return res.redirect(`${clientUrl}/auth-success?token=${accessToken}`);
    } catch (err) {
        console.error('[Controller] Industrial authentication via Google failed:', err);
        const clientUrl = process.env.CLIENT_URL?.split(',')[0]?.trim() || 'http://localhost:5173';
        return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
    }
};
