import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import {
  ShieldCheck,
  Sun,
  Moon,
  Loader2
} from 'lucide-react';

export default function LoginPage({ theme, toggleTheme }) {
  const { login, authMode } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const isKeycloakMode = authMode === 'keycloak' || (import.meta.env.VITE_AUTH_MODE || '').toLowerCase() === 'keycloak';
  const buttonLabel = isKeycloakMode ? 'Masuk/Login dengan LDAP' : 'Masuk/Login dengan non LDAP';

  const handleLoginClick = () => {
    setIsConnecting(true);
    setTimeout(() => {
      login();
      setIsConnecting(false);
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
          aria-label="Toggle Theme"
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
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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

        {/* Single SSO Telkom Login Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            id="btn-sso-telkom"
            onClick={handleLoginClick}
            disabled={isConnecting}
            className="btn-login-sso-telkom-single"
          >
            {isConnecting ? (
              <>
                <Loader2 size={19} className="login-spinner" />
                <span>Menghubungkan...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={20} color="var(--primary-red)" />
                <span>{buttonLabel}</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div style={{
          marginTop: '1.75rem',
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
