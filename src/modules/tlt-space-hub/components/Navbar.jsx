import React from 'react';
import { ArrowLeft, ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar({ isAdmin, theme, onToggleTheme, onOpenAdminLogin, onAdminLogout, onBackHome }) {
  return (
    <header className="app-header">
      <div className="navbar-container">
        
        {/* Left: Back Button, Brand & Logo */}
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
                TLT Space Hub
              </h1>
              <span className="navbar-tag-badge">
                TELKOM REGIONAL 3
              </span>
            </div>
            <p className="navbar-brand-subtitle">
              Portal Monitoring & Peminjaman Ruangan Telkom Landmark Tower
            </p>
          </div>
        </div>

        {/* Right: Admin Login & Theme Toggle */}
        <div className="navbar-right">
          {isAdmin ? (
            <div className="admin-badge-box">
              <ShieldCheck size={16} />
              <span className="admin-badge-text">Mode Admin GS</span>
              <button 
                onClick={onAdminLogout} 
                title="Keluar Admin" 
                className="admin-logout-btn"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAdminLogin}
              className="btn btn-secondary nav-admin-btn"
            >
              <ShieldCheck size={16} />
              <span className="nav-btn-text">Login Admin</span>
            </button>
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
