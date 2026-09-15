import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Building2, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import DigiletterApp from './modules/digiletter/App.jsx';
import TLTSpaceHubApp from './modules/tlt-space-hub/App.jsx';

// Overview Portal Component
function OverviewDashboard({ onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner / Hero Header */}
      <div className="glass-card" style={{ 
        padding: '2.5rem 2rem', 
        borderRadius: '20px', 
        background: 'linear-gradient(135deg, rgba(224, 0, 0, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)',
        border: '1px solid var(--card-border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.35rem 0.85rem', 
            borderRadius: '99px', 
            background: 'rgba(224,0,0,0.1)', 
            color: 'var(--primary-red)', 
            fontSize: '0.8125rem', 
            fontWeight: 700,
            marginBottom: '1rem' 
          }}>
            <Sparkles size={16} /> Digital Workspace Platform
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-title)', lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Selamat Datang di Portal Telkom Regional 3
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Pusat akses terpadu layanan persuratan digital <strong>(Digiletter)</strong> dan manajemen reservasi fasilitas serta ruangan <strong>(TLT Space Hub)</strong>.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('digiletter')}>
              <FileText size={18} /> Buka Digiletter
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('tlt-space-hub')}>
              <Building2 size={18} /> Buka TLT Space Hub
            </button>
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Digiletter Card */}
        <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'rgba(224, 0, 0, 0.1)', 
              color: 'var(--primary-red)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '1.25rem' 
            }}>
              <FileText size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '0.5rem' }}>
              Digiletter Regional 3
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Layanan pengajuan penomoran dan registrasi naskah dinas digital secara transparan, otomatis, dan terorganisir.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="#16a34a" /> Pengajuan Nomor Surat Resmi
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="#16a34a" /> Monitoring Real-time Status Pengajuan
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="#16a34a" /> Integrasi Export & Laporan Excel
              </li>
            </ul>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onNavigate('digiletter')}>
            Akses Digiletter <ArrowRight size={16} />
          </button>
        </div>

        {/* TLT Space Hub Card */}
        <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'rgba(37, 99, 235, 0.1)', 
              color: '#2563eb', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '1.25rem' 
            }}>
              <Building2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '0.5rem' }}>
              TLT Space Hub
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Manajemen pemesanan ruangan rapat, aula, dan fasilitas gedung Telkom Regional 3 secara efisien dan terkontrol.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="#16a34a" /> Katalog & Pemesanan Ruangan
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="#16a34a" /> Kalender Jadwal Penggunaan Ruang
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="#16a34a" /> Dashboard Analitik & Verifikasi Nota
              </li>
            </ul>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', borderColor: 'rgba(37, 99, 235, 0.3)', color: '#2563eb' }} onClick={() => onNavigate('tlt-space-hub')}>
            Akses TLT Space Hub <ArrowRight size={16} />
          </button>
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

  const navBtnStyle = (mod) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    border: 'none',
    background: activeModule === mod ? 'rgba(224, 0, 0, 0.1)' : 'transparent',
    color: activeModule === mod ? 'var(--primary-red)' : 'var(--text-main)',
    fontWeight: activeModule === mod ? 700 : 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  return (
    <div className="app-container">
      {/* Header Navigasi Portal Utama */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'var(--nav-bg)', 
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--card-border)'
      }}>
        <div style={{ 
          maxWidth: '1440px', 
          margin: '0 auto', 
          padding: '0.75rem 1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setActiveModule('overview')}>
            <img src="/telkom-logo.png" alt="Telkom Indonesia" style={{ height: '36px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-title)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                DIGITAL WORKSPACE <span style={{ color: 'var(--primary-red)' }}>PORTAL</span>
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Telkom Regional 3
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => setActiveModule('overview')} style={navBtnStyle('overview')}>
              <LayoutDashboard size={18} /> Overview
            </button>

            <button onClick={() => setActiveModule('digiletter')} style={navBtnStyle('digiletter')}>
              <FileText size={18} /> Digiletter
            </button>

            <button onClick={() => setActiveModule('tlt-space-hub')} style={navBtnStyle('tlt-space-hub')}>
              <Building2 size={18} /> TLT Space Hub
            </button>
          </nav>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary btn-icon"
            title="Toggle Theme"
            style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#facc15" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {activeModule === 'overview' && <OverviewDashboard onNavigate={setActiveModule} />}
        {activeModule === 'digiletter' && <DigiletterApp />}
        {activeModule === 'tlt-space-hub' && <TLTSpaceHubApp />}
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '1.5rem', 
        borderTop: '1px solid var(--card-border)', 
        background: 'var(--footer-bg)', 
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8125rem'
      }}>
        © 2026 PT Telkom Indonesia (Persero) Tbk - Regional 3. Digital Workspace Platform.
      </footer>
    </div>
  );
}
