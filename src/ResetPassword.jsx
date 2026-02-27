import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from './api';
import './App.css'; // Inherit styling

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
        <div className="login-page-wrapper">
            <div className="auth-card" style={{ width: '400px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '10px' }}>Secure Reset</h2>

                {isValidating ? (
                    <div style={{ color: 'white', margin: '30px 0' }}>Validating your secure token...</div>
                ) : tokenError ? (
                    <div style={{ margin: '20px 0' }}>
                        <div className="error-alert animate-fade" style={{ marginBottom: '20px' }}>{tokenError}</div>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Login</button>
                    </div>
                ) : resetSuccess ? (
                    <div className="animate-fade" style={{ margin: '20px 0' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <span style={{ color: 'white', fontSize: '2rem' }}>✓</span>
                        </div>
                        <h3 style={{ color: 'white' }}>Credential Updated</h3>
                        <p style={{ color: '#94a3b8', margin: '15px 0' }}>Your industrial identity has been secured. Redirecting you to the portal...</p>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="animate-fade" style={{ textAlign: 'left' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '25px', textAlign: 'center' }}>
                            Your identity has been verified. Enter a new secure password below to regain access.
                        </p>

                        <div className="input-row" style={{ marginBottom: '15px' }}>
                            <label style={{ color: 'var(--amber-gold)' }}>New Password</label>
                            <input
                                type="password"
                                placeholder="Min 8 chars, 1 Uppercase, 1 Num"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-row" style={{ marginBottom: '20px' }}>
                            <label style={{ color: 'var(--amber-gold)' }}>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Repeat new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {formError && <div className="error-alert animate-fade" style={{ marginBottom: '15px' }}>{formError}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Securing Update...' : 'Commit Password Reset'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <span onClick={() => navigate('/')} style={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>Cancel and Return</span>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
