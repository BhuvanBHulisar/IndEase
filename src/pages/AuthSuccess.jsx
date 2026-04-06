import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

/**
 * AuthSuccess — Landing page for Google OAuth redirect
 *
 * Backend redirects here as:
 *   /auth-success?token=<jwt>
 *
 * PART 3 — Uses window.location.href (hard reload) after writing to
 * localStorage so App.jsx re-initialises with the token already present.
 * Using React Router navigate() is a soft nav and can race with the
 * mount-time useEffect that reads the token.
 */
export default function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    console.log('TOKEN FROM URL:', token); // PART 3 debug

    if (!token) {
      console.error('[AuthSuccess] No token in URL — redirecting to login');
      window.location.href = '/consumer/login';
      return;
    }

    try {
      // Decode JWT to extract user data
      const decoded = jwtDecode(token);
      const user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name || decoded.email,
      };

      // Write everything BEFORE navigating
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuth', 'true');

      console.log('[AuthSuccess] Token saved, role:', user.role);

      // PART 3 — HARD reload so App.jsx picks up the token from scratch
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('[AuthSuccess] Failed to decode token:', err);
      window.location.href = '/consumer/login';
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '3px solid #334155',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
        Completing Google sign-in…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
