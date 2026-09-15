import React, { useState } from 'react';
import { X, Database, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE, getStoredSheetsUrl, setStoredSheetsUrl, syncAllToSheets } from '../services/googleSheetsService';

export default function GoogleSheetsModal({ isOpen, onClose, letters, onSyncSuccess, showToast }) {
  const [webAppUrl, setWebAppUrl] = useState(getStoredSheetsUrl());
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveUrl = () => {
    setStoredSheetsUrl(webAppUrl);
    showToast('Konfigurasi Disimpan', 'URL Google Apps Script Web App berhasil disimpan.', 'success');
  };

  const handleSyncAll = async () => {
    if (!webAppUrl) {
      showToast('URL Belum Diisi', 'Silakan masukkan URL Web App Google Apps Script terlebih dahulu.', 'error');
      return;
    }

    setIsSyncing(true);
    const success = await syncAllToSheets(letters, webAppUrl);
    setIsSyncing(false);

    if (success) {
      showToast('Sinkronisasi Berhasil', 'Seluruh data pengajuan telah disinkronkan ke Google Sheets.', 'success');
      if (onSyncSuccess) onSyncSuccess();
    } else {
      showToast('Sinkronisasi Gagal', 'Gagal menghubungi Google Apps Script Web App. Periksa URL dan izin deploy.', 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ maxWidth: '680px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={22} style={{ color: '#0284c7' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-title)', margin: 0 }}>
              Integrasi Google Sheets Database
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
          
          {/* Target Spreadsheet Link */}
          <div style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', padding: '0.875rem 1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.25rem' }}>
              Target Google Spreadsheet Database:
            </div>
            <a 
              href="https://docs.google.com/spreadsheets/d/1Z8CyLkvYwnpt2IoyszhKFAubGlUeaP7R_Vxl9agvEjo/edit?gid=0#gid=0"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.8125rem', color: '#0284c7', textDecoration: 'underline', wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              https://docs.google.com/spreadsheets/d/1Z8CyLkvYwnpt2IoyszhKFAubGlUeaP7R_Vxl9agvEjo/edit
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Step 1: Apps Script Code */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-title)' }}>
                Langkah 1: Salin Kode Apps Script (Extensions &gt; Apps Script)
              </span>
              <button 
                onClick={handleCopyCode}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                {copied ? 'Tersalin!' : 'Salin Kode Script'}
              </button>
            </div>
            <textarea
              readOnly
              rows={5}
              value={GOOGLE_APPS_SCRIPT_CODE}
              className="form-input"
              style={{ fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.4, background: 'var(--input-bg)' }}
            />
          </div>

          {/* Step 2: Input Web App URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '0.4rem' }}>
              Langkah 2: Masukkan Web App URL Hasil Deploy (Access: Anyone)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button onClick={handleSaveUrl} className="btn btn-primary" style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                Simpan URL
              </button>
            </div>
          </div>

          {/* Sync All Action */}
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Klik tombol di kanan untuk mengirim seluruh ({letters.length}) data ke Google Sheets saat ini.
            </span>
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', borderColor: 'rgba(37, 99, 235, 0.3)' }}
            >
              <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
              {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
