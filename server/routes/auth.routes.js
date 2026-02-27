import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import passport from 'passport';

const router = express.Router();

// GOOGLE OAUTH
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    (req, res, next) => {
        console.log('[Route] /auth/google/callback hit');
        passport.authenticate('google', {
            session: true,
            failureRedirect: 'http://localhost:5173/login?error=google_auth_failed'
        }, (err, user, info) => {
            if (err) {
                console.error('[Route] Google callback error:', err);
                return res.redirect('http://localhost:5173/login?error=google_auth_failed');
            }
            if (!user) {
                console.error('[Route] Google callback: No user');
                return res.redirect('http://localhost:5173/login?error=google_auth_failed');
            }
            req.user = user;
            next();
        })(req, res, next);
    },
    authController.googleAuthSuccess
);

/**
 * Rate Limiter for sensitive endpoints
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { status: 'error', message: 'Too many industrial access attempts. Try again in 15 mins.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// PUBLIC REACH
router.post('/register', authController.register);
router.post('/signup', authController.register); // Alias for frontend
router.get('/check-email/:email', authController.checkEmail);
router.get('/check-phone/:phone', authController.checkPhone);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authController.forgotPassword);
router.get('/verify-token', authController.verifyToken);
router.post('/reset-password', authController.resetPassword);

// SOCIAL LOGIN
router.post('/social-login', authController.socialLogin);
// Google ID Token Login (API)
router.post('/google', authController.googleIdTokenLogin);

// PROTECTED REACH
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

export default router;
