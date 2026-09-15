import React, { useEffect } from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (toast && toast.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast || !toast.show) return null;

  const getIcon = () => {
    if (toast.icon === 'admin') {
      return <ShieldCheck size={24} style={{ color: '#16a34a', flexShrink: 0 }} />;
    }
    return <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0 }} />;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 2000,
        minWidth: '340px',
        maxWidth: '440px',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--card-border)',
        borderLeft: '4px solid #16a34a',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      {getIcon()}
      
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-title)', margin: '0 0 0.25rem 0' }}>
          {toast.title || 'Pemberitahuan'}
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
          {toast.message}
        </p>
      </div>

      <button 
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '0.15rem',
          display: 'flex',
          alignItems: 'center'
        }}
        title="Tutup Notifikasi"
      >
        <X size={16} />
      </button>

      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: '#16a34a',
          borderRadius: '0 0 0 12px',
          width: '100%',
          animation: 'shrinkWidth 4s linear forwards'
        }}
      />

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
