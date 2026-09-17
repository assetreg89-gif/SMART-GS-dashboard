import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { LogOut, ChevronDown } from 'lucide-react';

export default function UserProfileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="user-profile-menu-container" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Trigger Button (Clean Avatar + Name) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="user-profile-trigger-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.3rem 0.65rem 0.3rem 0.3rem',
          borderRadius: '99px',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}
      >
        {/* Avatar Image */}
        <img
          src={user.avatar}
          alt={user.name}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
          }}
        />

        {/* User Name Only */}
        <span
          className="nav-user-text"
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-title)'
          }}
        >
          {user.name}
        </span>

        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </button>

      {/* Clean Dropdown Popup Menu */}
      {isOpen && (
        <div
          className="user-profile-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '230px',
            borderRadius: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            padding: '0.85rem',
            zIndex: 1000,
            backdropFilter: 'blur(16px)',
            animation: 'fadeInSlide 0.18s ease'
          }}
        >
          {/* Header Profile: Name & Email only */}
          <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
          </div>

          {/* Logout Button */}
          <div style={{ paddingTop: '0.65rem' }}>
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="btn-dropdown-logout"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(224, 0, 0, 0.08)',
                color: 'var(--primary-red)',
                border: '1px solid rgba(224, 0, 0, 0.15)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={15} />
              <span>Keluar / Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
