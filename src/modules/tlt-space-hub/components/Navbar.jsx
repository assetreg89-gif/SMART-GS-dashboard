import React from 'react';
import { Building2, ShieldCheck, LogOut, LayoutDashboard, Monitor, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isAdmin, theme, onToggleTheme, onOpenAdminLogin, onAdminLogout, onOpenBookingModal }) {
  const isCatalogTab = activeTab === 'catalog' || activeTab === 'rooms';

  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.875rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
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
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-title)', margin: 0 }}>
                  TLT Space Hub
                </h1>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(224, 0, 0, 0.12)', color: 'var(--primary-red)', border: '1px solid rgba(224, 0, 0, 0.25)' }}>
                  TELKOM REGIONAL 3
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Portal Monitoring & Peminjaman Ruangan Telkom Landmark Tower</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAdmin ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', padding: '0.375rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#16a34a', fontWeight: 600 }}>
                  <ShieldCheck size={16} />
                  Mode Admin GS
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
              <button 
                onClick={onOpenAdminLogin}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
              >
                <ShieldCheck size={16} />
                Login Admin GS
              </button>
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.625rem', borderTop: '1px solid var(--card-border)' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.375rem', borderRadius: '12px', border: '1px solid var(--input-border)', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('monitoring')}
              className={`btn ${activeTab === 'monitoring' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1.125rem', fontSize: '0.8125rem' }}
            >
              <Monitor size={16} />
              Monitoring Ruangan
            </button>
            
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`btn ${isCatalogTab ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1.125rem', fontSize: '0.8125rem' }}
            >
              <Building2 size={16} />
              Katalog Ruang Lt. 9, 11, 12
            </button>

            <button 
              onClick={() => setActiveTab('analytics')}
              className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1.125rem', fontSize: '0.8125rem' }}
            >
              <LayoutDashboard size={16} />
              Statistik & Analitik
            </button>
          </nav>

          <button 
            onClick={onOpenBookingModal}
            className="btn btn-primary"
            style={{ 
              fontSize: '0.875rem', 
              padding: '0.5rem 1.25rem',
              background: 'linear-gradient(135deg, var(--primary-red) 0%, #b30000 100%)',
              boxShadow: '0 4px 14px rgba(224, 0, 0, 0.35)'
            }}
          >
            Input Pengajuan Ruangan
          </button>
        </div>

      </div>
    </header>
  );
}
