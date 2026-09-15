import React, { useState } from 'react';
import { X, FileSpreadsheet, Calendar, Filter, Download } from 'lucide-react';
import { exportToExcel } from '../utils/excelExporter';

export default function ExportExcelModal({ isOpen, onClose, letters }) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  // Helper untuk mendapatkan tanggal ISO YYYY-MM-DD
  const getCleanIsoDate = (dateVal) => {
    if (!dateVal) return '';
    let str = String(dateVal).trim();
    if (str.includes('T')) str = str.split('T')[0];
    return str;
  };

  const handleExport = (e) => {
    e.preventDefault();

    let filtered = [...letters];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (filterType === 'THIS_WEEK') {
      // 7 hari terakhir / minggu ini
      const curr = new Date();
      const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1); // Senin
      const monday = new Date(curr.setDate(first)).toISOString().split('T')[0];
      const sunday = new Date(curr.setDate(first + 6)).toISOString().split('T')[0];

      filtered = letters.filter(item => {
        const d = getCleanIsoDate(item.tanggal_ttd || item.tanggal_pengajuan);
        return d >= monday && d <= sunday;
      });
    } else if (filterType === 'THIS_MONTH') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `${year}-${month}`;

      filtered = letters.filter(item => {
        const d = getCleanIsoDate(item.tanggal_ttd || item.tanggal_pengajuan);
        return d.startsWith(prefix);
      });
    } else if (filterType === 'THIS_YEAR') {
      const year = String(now.getFullYear());

      filtered = letters.filter(item => {
        const d = getCleanIsoDate(item.tanggal_ttd || item.tanggal_pengajuan);
        return d.startsWith(year);
      });
    } else if (filterType === 'CUSTOM') {
      if (!startDate || !endDate) {
        alert('Mohon isi rentang tanggal awal dan tanggal akhir.');
        return;
      }
      filtered = letters.filter(item => {
        const d = getCleanIsoDate(item.tanggal_ttd || item.tanggal_pengajuan);
        return d >= startDate && d <= endDate;
      });
    }

    if (filtered.length === 0 && filterType !== 'ALL') {
      alert('Tidak ada data pengajuan surat pada rentang filter yang dipilih.');
      return;
    }

    const exportFileName = `DigiLetter_Export_${filterType}_${todayStr}.xlsx`;
    exportToExcel(filtered, exportFileName, { filterType, startDate, endDate });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', borderRadius: '10px' }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-title)', margin: 0 }}>
                Export Data Agenda Surat (Excel)
              </h3>
              <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', margin: 0 }}>
                Pilih rentang tanggal agenda surat yang ingin di-export
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Selection */}
        <form onSubmit={handleExport} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                Opsi Filter Rentang Waktu:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <button
                  type="button"
                  className={`btn ${filterType === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', fontSize: '0.8125rem', padding: '0.6rem 0.5rem' }}
                  onClick={() => setFilterType('ALL')}
                >
                  <Filter size={15} /> Semua (All)
                </button>

                <button
                  type="button"
                  className={`btn ${filterType === 'THIS_WEEK' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', fontSize: '0.8125rem', padding: '0.6rem 0.5rem' }}
                  onClick={() => setFilterType('THIS_WEEK')}
                >
                  <Calendar size={15} /> Minggu Ini
                </button>

                <button
                  type="button"
                  className={`btn ${filterType === 'THIS_MONTH' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', fontSize: '0.8125rem', padding: '0.6rem 0.5rem' }}
                  onClick={() => setFilterType('THIS_MONTH')}
                >
                  <Calendar size={15} /> Bulan Ini
                </button>
              </div>

              <button
                type="button"
                className={`btn ${filterType === 'CUSTOM' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'flex-start', fontSize: '0.8125rem' }}
                onClick={() => setFilterType('CUSTOM')}
              >
                <Calendar size={15} /> Custom Rentang Tanggal (Date Range)
              </button>
            </div>

          {/* Custom Date Range Inputs */}
          {filterType === 'CUSTOM' && (
            <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--card-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Dari Tanggal:</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required={filterType === 'CUSTOM'}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Sampai Tanggal:</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required={filterType === 'CUSTOM'}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn" style={{ background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800 }}>
              <Download size={16} /> Unduh Excel (.xlsx)
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
