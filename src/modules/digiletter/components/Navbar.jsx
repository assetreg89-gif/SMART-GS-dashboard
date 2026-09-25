import React from 'react';
import { ArrowLeft, ShieldCheck, LogOut, Sun, Moon, FilePlus2, User } from 'lucide-react';

export default function Navbar({
  isAdmin,
  isUserLoggedIn,
  currentUser,
  theme,
  onToggleTheme,
  onOpenAdminLogin,
  onAdminLogout,
  onUserLogout,
  onOpenRequestModal,
  onBackHome
}) {
  return (
    <header className="app-header">
      <div className="navbar-container">

        {/* Brand Header */}
        <div className="navbar-left">
          {onBackHome && (
            <button
              onClick={onBackHome}
              className="btn btn-secondary nav-home-btn"
              title="Kembali ke Beranda SMART GS"
            >
              <ArrowLeft size={16} />
              <span className="nav-btn-text">Home</span>
            </button>
          )}
          <div className="navbar-logo-box">
            <img
              src="/telkom-icon.png"
              alt="Telkom Indonesia"
              className="navbar-logo-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span style="color:#e00000;font-weight:900;font-size:1.1rem;">T</span>';
              }}
            />
          </div>
          <div className="navbar-brand-info">
            <div className="navbar-brand-header">
              <h1 className="navbar-brand-title">
                DigiLetter Reg 3
              </h1>
              <span className="navbar-tag-badge">
                SEKRETARIAT DIVISI
              </span>
            </div>
            <p className="navbar-brand-subtitle">Portal Pengajuan & Monitoring Nomor Surat Telkom Regional 3</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="navbar-right">
          {isAdmin ? (
            <div className="admin-badge-box">
              <ShieldCheck size={16} />
              <span className="admin-badge-text">Mode Admin Sekdiv</span>
              <button
                onClick={onAdminLogout}
                title="Keluar Admin"
                className="admin-logout-btn"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onOpenAdminLogin}
                className="btn btn-secondary nav-admin-btn"
              >
                <ShieldCheck size={16} />
                <span className="nav-btn-text">Login Admin</span>
              </button>

              {isUserLoggedIn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--input-bg)', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-main)', fontWeight: 700 }}>
                    <User size={15} style={{ color: 'var(--primary-red)' }} />
                    <span className="nav-btn-text">{currentUser || 'User'}</span>
                  </div>
                  <button
                    onClick={onUserLogout}
                    title="Logout User"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.15rem' }}
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              )}
            </>
          )}

          <button
            onClick={onToggleTheme}
            className="btn btn-secondary btn-icon nav-theme-btn"
            title={theme === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang'}
          >
            {theme === 'light' ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} color="#facc15" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
