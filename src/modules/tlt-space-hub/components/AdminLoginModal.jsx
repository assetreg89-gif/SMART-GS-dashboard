import React, { useState } from 'react';
import { X, Lock, Key, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { hashPassword } from '../lib/supabase';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = '42bc481f9b3cf2867ef51df4c6fbccefb434c449339e1bf06e788c919a706596';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const cleanUser = username ? username.trim() : '';
      const cleanPass = password ? password.trim() : '';

      const inputHash = await hashPassword(cleanPass);

      const isUserMatch = cleanUser.toLowerCase() === ADMIN_USERNAME.toLowerCase();
      const isPassMatch = 
        cleanPass === 'adminGSTREG3' || 
        (inputHash && inputHash.toLowerCase() === ADMIN_PASSWORD_HASH.toLowerCase());

      if (isUserMatch && isPassMatch) {
        onLoginSuccess({ username: cleanUser });
        setErrorMsg('');
        onClose();
      } else {
        setErrorMsg('Username atau Password Admin tidak valid');
      }
    } catch (err) {
      if (username.trim().toLowerCase() === 'admin' && password.trim() === 'adminGSTREG3') {
        onLoginSuccess({ username: 'admin' });
        onClose();
      } else {
        setErrorMsg('Gagal memproses verifikasi keamanan.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container glass-card" style={{ maxWidth: '420px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={22} color="var(--primary-red)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-title)' }}>Login Admin GS TLT</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.625rem 0.875rem', borderRadius: '8px', color: '#ef4444', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Username Admin
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Masukkan username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 2.25rem 0.625rem 2.25rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                title={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.2rem'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Batal</button>
            <button type="submit" disabled={isVerifying} className="btn btn-primary">
              {isVerifying ? 'Memverifikasi...' : 'Masuk Admin'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
