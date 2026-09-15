import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (toast.isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Otomatis menutup setelah 4 detik
      return () => clearTimeout(timer);
    }
  }, [toast.isOpen, onClose]);

  if (!toast.isOpen) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 2000,
      minWidth: '300px',
      maxWidth: '420px',
      background: 'var(--card-bg)',
      border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
      boxShadow: 'var(--card-shadow)',
      borderRadius: '12px',
      padding: '0.875rem 1rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ color: isSuccess ? '#16a34a' : '#ef4444', flexShrink: 0, marginTop: '2px' }}>
        {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-title)', margin: 0 }}>
          {toast.title}
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
          {toast.message}
        </p>
      </div>
      <button 
        onClick={onClose}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.15rem' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
