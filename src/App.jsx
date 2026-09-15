import React, { useState, useEffect } from 'react';
import {
  FileText,
  Building2,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  FileSignature,
  Activity,
  FileSpreadsheet,
  DoorOpen,
  CalendarDays,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import DigiletterApp from './modules/digiletter/App.jsx';
import TLTSpaceHubApp from './modules/tlt-space-hub/App.jsx';

// Overview Portal Component
function OverviewDashboard({ onNavigate }) {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      {/* Main Unified Portal Container */}
      <div className="glass-card hero-container" style={{
        padding: '2.5rem 2rem',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(224, 0, 0, 0.06) 0%, rgba(30, 41, 59, 0.03) 100%)',
        border: '1px solid var(--card-border)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Intro Header */}
        <div style={{ maxWidth: '840px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.9rem',
            borderRadius: '99px',
            background: 'rgba(224, 0, 0, 0.12)',
            color: 'var(--primary-red)',
            fontSize: '0.8125rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            marginBottom: '1rem'
          }}>
            <Sparkles size={16} /> SMART GS REGIONAL 3
          </div>
          <h1 className="hero-title" style={{ fontSize: '2.35rem', fontWeight: 800, color: 'var(--text-title)', lineHeight: 1.25, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Selamat Datang di SMART GS Telkom Regional 3
          </h1>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-red)', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
            Secretariat Management & Administration Resource Tool for General Support
          </p>
          <p className="hero-subtitle" style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            Pusat akses terpadu manajemen reservasi fasilitas serta ruangan <strong>(TLT Space Hub)</strong> dan layanan persuratan digital <strong>(Digiletter)</strong>.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="portal-cards-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          width: '100%'
        }}>
          {/* Card 1 (Left): TLT Space Hub */}
          <div className="portal-module-card">
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="portal-icon-container">
                    <Building2 size={28} style={{ color: 'var(--primary-red)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.02em', margin: 0 }}>
                      TLT Space Hub
                    </h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-red)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      General Support
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem', fontWeight: 500 }}>
                Manajemen pemesanan ruangan rapat, aula, dan fasilitas gedung Telkom Regional 3 secara efisien dan terkontrol.
              </p>

              {/* Clean Bullet Points */}
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle2 size={19} color="#16a34a" /> Katalog & Pemesanan Ruangan
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle2 size={19} color="#16a34a" /> Kalender Jadwal Penggunaan Ruang
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle2 size={19} color="#16a34a" /> Dashboard Analitik & Verifikasi Nota
                </li>
              </ul>
            </div>

            {/* Solid Red CTA Button */}
            <button className="portal-cta-btn" onClick={() => onNavigate('tlt-space-hub')} style={{ fontSize: '1rem', fontWeight: 800 }}>
              <span>Akses TLT Space Hub</span>
              <ArrowRight size={18} className="cta-arrow" />
            </button>
          </div>

          {/* Card 2 (Right): Digiletter Regional 3 */}
          <div className="portal-module-card">
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="portal-icon-container">
                    <FileSignature size={28} style={{ color: 'var(--primary-red)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.02em', margin: 0 }}>
                      Digiletter Regional 3
                    </h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-red)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Sekretariat Divisi
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem', fontWeight: 500 }}>
                Layanan pengajuan penomoran dan registrasi naskah dinas digital secara transparan, otomatis, dan terorganisir.
              </p>

              {/* Clean Bullet Points */}
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle2 size={19} color="#16a34a" /> Pengajuan Nomor Surat Resmi
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle2 size={19} color="#16a34a" /> Monitoring Real-time Status Pengajuan
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle2 size={19} color="#16a34a" /> Integrasi Export & Laporan Excel
                </li>
              </ul>
            </div>

            {/* Solid Red CTA Button */}
            <button className="portal-cta-btn" onClick={() => onNavigate('digiletter')} style={{ fontSize: '1rem', fontWeight: 800 }}>
              <span>Akses Digiletter</span>
              <ArrowRight size={18} className="cta-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState('overview'); // 'overview' | 'digiletter' | 'tlt-space-hub'
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-container">
      {/* Header Utama SMART GS Portal - Hanya tampil saat di Overview/Home */}
      {activeModule === 'overview' && (
        <header className="app-header">
          <div className="navbar-container">
            {/* Logo & Brand */}
            <div className="navbar-left" style={{ cursor: 'pointer' }} onClick={() => setActiveModule('overview')}>
              <img src="/telkom-logo.png" alt="Telkom Indonesia" style={{ height: '36px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="navbar-brand-info">
                <span className="navbar-brand-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  SMART GS <span style={{ color: 'var(--primary-red)' }}>PORTAL</span>
                </span>
                <span className="navbar-brand-subtitle" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Secretariat Management & Administration Resource Tool for General Support — Telkom Regional 3
                </span>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="navbar-right">
              <button
                onClick={toggleTheme}
                className="btn btn-secondary btn-icon nav-theme-btn"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#facc15" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Module Views */}
      {activeModule === 'overview' && (
        <main className="main-content">
          <OverviewDashboard onNavigate={setActiveModule} />
        </main>
      )}

      {activeModule === 'digiletter' && (
        <DigiletterApp onBackHome={() => setActiveModule('overview')} />
      )}

      {activeModule === 'tlt-space-hub' && (
        <TLTSpaceHubApp onBackHome={() => setActiveModule('overview')} />
      )}

      {/* Footer */}
      {activeModule === 'overview' && (
        <footer style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--card-border)',
          background: 'var(--footer-bg)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem'
        }}>
          © 2026 PT Telkom Indonesia (Persero) Tbk - Regional 3. SMART GS.
        </footer>
      )}
    </div>
  );
}
