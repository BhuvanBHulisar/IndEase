import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';
import * as authService from '../services/auth.service.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/token.util.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../validators/auth.validator.js';

import { OAuth2Client } from 'google-auth-library';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
};

/**
 * Controller for Auth Endpoints
 */
export const register = async (req, res, next) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const user = await authService.registerUser(validatedData);

        // Issue tokens for immediate access
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const hRT = hashToken(refreshToken);
        await db.query(
            'INSERT INTO auth_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
            [user.id, hRT, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(201).json({
            status: 'success',
            message: 'Industrial account created. Verification email dispatched.',
            token: accessToken,
            user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name || validatedData.firstName }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Social Login Controller (Google)
 * POST /api/auth/social-login
 */
export const socialLogin = async (req, res, next) => {
    try {
        const { provider, token, email, name, picture } = req.body;

        const normalizedProvider = (provider || '').toLowerCase().trim();
        if (normalizedProvider !== 'google') {
            console.error('[SocialLogin] Unsupported provider:', provider);
            return res.status(400).json({ success: false, message: 'Only Google social login supported.' });
        }

        // 1. Verify Google token
        if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
            console.error('[SocialLogin] Missing or invalid Google ID token:', token);
            return res.status(400).json({ success: false, message: 'Missing or invalid Google ID token.' });
        }
        const client = new OAuth2Client();
        let payload;
        try {
            const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
            payload = ticket.getPayload();
        } catch (err) {
            console.error('[SocialLogin] Google token verification failed:', err);
            return res.status(401).json({ success: false, message: 'Invalid Google token.', error: err?.message });
        }

        // 2. Find user by email or google_id
        let user;
        try {
            const dbUserRes = await db.query(
                'SELECT * FROM users WHERE LOWER(email) = $1 OR google_id = $2',
                [email.toLowerCase(), payload.sub]
            );
            user = dbUserRes.rows[0];

            if (user) {
                // 3. Update google_id if missing
                if (!user.google_id) {
                    await db.query('UPDATE users SET google_id = $1 WHERE id = $2', [payload.sub, user.id]);
                    user.google_id = payload.sub;
                }
                // Optionally update photo_url if missing
                if (!user.photo_url && picture) {
                    await db.query('UPDATE users SET photo_url = $1 WHERE id = $2', [picture, user.id]);
                    user.photo_url = picture;
                }
            } else {
                // 4. Create user
                const insertRes = await db.query(
                    `INSERT INTO users (email, google_id, first_name, photo_url, role, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                    [email.toLowerCase(), payload.sub, name, picture, 'consumer', true]
                );
                user = insertRes.rows[0];
            }
        } catch (err) {
            console.error('[SocialLogin] DB error:', err);
            return res.status(500).json({ success: false, message: 'Database error during social login.', error: err?.message });
        }

        // 5. Generate tokens
        try {
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            const hRT = hashToken(refreshToken);
            await db.query(
                'INSERT INTO auth_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
                [user.id, hRT, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
            );

            // Set cookies
            res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
            res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

            // Return user info and tokens
            res.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.first_name,
                    photo_url: user.photo_url,
                    role: user.role,
                    google_id: user.google_id
                },
                accessToken,
                refreshToken
            });
        } catch (err) {
            console.error('[SocialLogin] Token/cookie error:', err);
            return res.status(500).json({ success: false, message: 'Token or cookie error during social login.', error: err?.message });
        }
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password, role } = loginSchema.parse(req.body);
        const normalizedEmail = email.toLowerCase();

        // 1. Locate Identity
        const result = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
        if (result.rows.length === 0) {
            return next(new AppError('No account found, create one', 404));
        }

        const user = result.rows[0];

        // 2. Lockout Check
        if (user.locked_until && user.locked_until > new Date()) {
            return next(new AppError('Account locked. Too many failed attempts.', 403));
        }

        // 3. Role Restriction
        if (role && user.role !== role) {
            return next(new AppError(`Forbidden: Registered as ${user.role}`, 403));
        }

        // 4. Verify Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            // Increment failures
            await db.query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1', [user.id]);
            if (user.failed_login_attempts + 1 >= 5) {
                await db.query('UPDATE users SET locked_until = $1 WHERE id = $2', [new Date(Date.now() + 15 * 60 * 1000), user.id]);
            }
            return next(new AppError('Invalid credentials', 401));
        }

        // 5. Success reset
        await db.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1', [user.id]);

        // 6. Tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const hRT = hashToken(refreshToken);
        await db.query(
            'INSERT INTO auth_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
            [user.id, hRT, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({
            status: 'success',
            token: accessToken,
            user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name }
        });
    } catch (err) {
        next(err);
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

export const getMe = async (req, res, next) => {
    try {
        const result = await db.query('SELECT id, email, role, first_name, last_name, email_verified, company_name FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) throw new AppError('Identity lost', 404);
        res.json({ status: 'success', user: result.rows[0] });
    } catch (err) {
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

        // Redirect to dashboard
        return res.redirect('http://localhost:5173/dashboard');
    } catch (err) {
        console.error('[Controller] Industrial authentication via Google failed:', err);
        return res.redirect('http://localhost:5173/login?error=google_auth_failed');
    }
};
