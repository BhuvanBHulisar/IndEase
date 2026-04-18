import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 as CheckCircleIcon } from 'lucide-react';
import api from '../services/api';
import '../App.css'; // Inherit styling

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [isValidating, setIsValidating] = useState(true);
    const [tokenError, setTokenError] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    // Initial check for token validity
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setTokenError('No reset token provided. Please use the link sent to your email.');
                setIsValidating(false);
                return;
            }

            try {
                await api.get(`/auth/verify-token?token=${token}`);
                setIsValidating(false);
            } catch (err) {
                setTokenError(err.response?.data?.message || 'Invalid or expired reset token.');
                setIsValidating(false);
            }
        };

        verifyToken();
    }, [token]);

    const validatePassword = (pass) => {
        return pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass);
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!validatePassword(newPassword)) {
            setFormError('Password must be at least 8 characters, contain 1 uppercase letter, and 1 number.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setFormError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post('/auth/reset-password', {
                token: token,
                password: newPassword
            });
            setResetSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000); // Redirect back to login
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to reset password. Token might be expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page-view">
            {/* SaaS Header */}
            <div className="auth-logo-header">
                <button className="logo-container" onClick={() => navigate('/')} aria-label="Go to home page">
                    <div className="logo-text">IndEase</div>
                </button>
                <button 
                    className="auth-return-link"
                    onClick={() => navigate('/')}
                >
                    ← Return to Landing Page
                </button>
            </div>

            <motion.div 
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset Your Password</h2>
                    <p className="text-sm text-slate-500">Secure your industrial identity</p>
                </div>

                {isValidating ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium">Validating secure token...</p>
                    </div>
                ) : tokenError ? (
                    <div className="space-y-6 text-center">
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                            {tokenError}
                        </div>
                        <button className="auth-submit-btn" onClick={() => navigate('/')}>
                            Return to Login
                        </button>
                    </div>
                ) : resetSuccess ? (
                    <div className="text-center space-y-6 animate-fade-in">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">Credential Updated</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Your account has been secured successfully.
                            </p>
                            <p className="text-xs text-slate-400">
                                Redirecting you to the portal access...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-5">
                        <div className="auth-form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="Min 8 chars, 1 Uppercase, 1 Num"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="auth-form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Repeat new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {formError && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[11px] font-bold text-center">
                                {formError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Securing Update...' : 'Update Password'}
                        </button>

                        <div className="auth-footer">
                            <button type="button" onClick={() => navigate('/')}>
                                Cancel and return to Login
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
