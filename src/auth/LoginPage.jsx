import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import {
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';

export default function LoginPage({ theme, toggleTheme }) {
  const { loginWithGoogle, loginWithKeycloak } = useAuth();
  const [loadingType, setLoadingType] = useState(null);

  const handleGoogleClick = () => {
    setLoadingType('google');
    setTimeout(() => {
      loginWithGoogle();
      setLoadingType(null);
    }, 300);
  };

  const handleKeycloakClick = () => {
    setLoadingType('keycloak');
    setTimeout(() => {
      loginWithKeycloak();
      setLoadingType(null);
    }, 300);
  };

  return (
    <div className="login-page-clean-container">
      {/* Theme Toggle Top Right */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon nav-theme-btn"
          title="Ganti Tema"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#facc15" />}
        </button>
      </div>

      {/* Clean Single Centered Login Card */}
      <div className="login-clean-card">
        {/* Logo & Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <img
            src="/telkom-icon.png"
            alt="Telkom Indonesia"
            style={{ height: '52px', objectFit: 'contain', marginBottom: '1.25rem' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: 'var(--text-title)',
            letterSpacing: '-0.025em',
            margin: '0 0 0.45rem 0'
          }}>
            SMART GS <span style={{ color: 'var(--primary-red)' }}>PORTAL</span>
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0,
            fontWeight: 500
          }}>
            PT Telkom Indonesia — Regional 3
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Google SSO Button */}
          <button
            id="btn-google-login"
            onClick={handleGoogleClick}
            disabled={Boolean(loadingType)}
            className="btn-login-sso-google"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{loadingType === 'google' ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
          </button>

          {/* Keycloak SSO Button */}
          <button
            id="btn-keycloak-login"
            onClick={handleKeycloakClick}
            disabled={Boolean(loadingType)}
            className="btn-login-sso-keycloak"
          >
            <ShieldCheck size={19} color="var(--primary-red)" />
            <span>{loadingType === 'keycloak' ? 'Menghubungkan...' : 'Masuk via SSO Telkom'}</span>
          </button>
        </div>

        {/* Footer info */}
        <div style={{
          marginTop: '2.5rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          © 2026 PT Telkom Indonesia (Persero) Tbk — Regional 3
        </div>
      </div>
    </div>
  );
}
