import React from 'react';
import { ShieldCheck, LogOut, Sun, Moon, FilePlus2, User } from 'lucide-react';

export default function Navbar({
  isAdmin,
  isUserLoggedIn,
  currentUser,
  theme,
  onToggleTheme,
  onOpenAdminLogin,
  onAdminLogout,
  onUserLogout,
  onOpenRequestModal
}) {
  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            padding: '5px',
            border: '1px solid var(--card-border)',
            flexShrink: 0
          }}>
            <img
              src="/telkom-icon.png"
              alt="Telkom Indonesia"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span style="color:#e00000;font-weight:900;font-size:1.2rem;">T</span>';
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-title)', margin: 0 }}>
                DigiLetter Reg 3
              </h1>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(224, 0, 0, 0.12)', color: 'var(--primary-red)', border: '1px solid rgba(224, 0, 0, 0.25)' }}>
                SEKRETARIAT DIVISI
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Portal Pengajuan & Monitoring Nomor Surat Telkom Regional 3</p>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', padding: '0.375rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#16a34a', fontWeight: 600 }}>
                <ShieldCheck size={16} />
                Mode Admin Sekdiv
              </div>
              <button
                onClick={onAdminLogout}
                title="Keluar Admin"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onOpenAdminLogin}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
              >
                <ShieldCheck size={16} />
                Login Admin Sekdiv
              </button>

              {isUserLoggedIn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.375rem 0.75rem', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <User size={15} style={{ color: 'var(--primary-red)' }} />
                    {currentUser || 'User'}
                  </div>
                  <button
                    onClick={onUserLogout}
                    title="Logout User"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem', marginLeft: '0.25rem' }}
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              )}
            </>
          )}

          <button
            onClick={onToggleTheme}
            className="btn btn-secondary"
            title={theme === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang'}
            style={{
              width: '38px',
              height: '38px',
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {theme === 'light' ? (
              <Moon size={18} style={{ color: '#4f46e5' }} />
            ) : (
              <Sun size={18} style={{ color: '#f59e0b' }} />
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
