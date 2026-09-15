import React, { useState } from 'react';
import { Search, Filter, Edit3, Trash2, CheckCircle2, Clock, XCircle, Lock, Calendar, User, FileText, FileCheck, AlertCircle, FileSpreadsheet, FilePlus2 } from 'lucide-react';
import { JENIS_SURAT_OPTIONS } from '../utils/letterHelper';
import { exportToExcel } from '../utils/excelExporter';

export default function PublicMonitoring({ letters, onEditRequest, onDeleteRequest, onOpenRequestModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenis, setSelectedJenis] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const totalPengajuan = letters.length;
  const totalMenunggu = letters.filter(l => l.status === 'Menunggu Persetujuan').length;
  const totalDisetujui = letters.filter(l => l.status === 'Disetujui').length;
  const totalDibatalkan = letters.filter(l => l.status === 'Dibatalkan').length;

  const filteredLetters = letters
    .filter(item => {
      const matchJenis = selectedJenis === 'ALL' || item.jenis_surat === selectedJenis;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = searchTerm === '' ||
        (item.perihal && item.perihal.toLowerCase().includes(searchLower)) ||
        (item.pic && item.pic.toLowerCase().includes(searchLower)) ||
        (item.kepada && item.kepada.toLowerCase().includes(searchLower)) ||
        (item.nomor_surat && item.nomor_surat.toLowerCase().includes(searchLower)) ||
        (item.takah && item.takah.toLowerCase().includes(searchLower));

      return matchJenis && matchStatus && matchSearch;
    })
    .sort((a, b) => {
      const dateA = String(a.tanggal_ttd || a.tanggal_pengajuan || '');
      const dateB = String(b.tanggal_ttd || b.tanggal_pengajuan || '');
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB); // Ascending tanggal (Terlama -> Terbaru)
      }
      const numA = typeof a.no_agenda === 'number' ? a.no_agenda : 999999;
      const numB = typeof b.no_agenda === 'number' ? b.no_agenda : 999999;
      return numA - numB; // Ascending no agenda
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header Info & Stat Cards (TLT Space Hub Style) */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '0.25rem' }}>
              Monitoring Pengajuan Nomor Surat
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Pantau status pengajuan dan penerbitan nomor surat Sekretariat Divisi Telkom Regional 3 secara real-time.
            </p>
          </div>

          {/* Cards Bar */}
          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', padding: '0.65rem 1.25rem', borderRadius: '12px', textAlign: 'center', minWidth: '130px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Total Pengajuan</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-title)' }}>{totalPengajuan}</span>
            </div>

            <div style={{ background: 'var(--status-pending-bg)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '0.65rem 1.25rem', borderRadius: '12px', textAlign: 'center', minWidth: '150px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--status-pending-text)', display: 'block', fontWeight: 600 }}>Menunggu Persetujuan</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-pending-text)' }}>{totalMenunggu}</span>
            </div>

            <div style={{ background: 'var(--status-approved-bg)', border: '1px solid rgba(34, 197, 94, 0.35)', padding: '0.65rem 1.25rem', borderRadius: '12px', textAlign: 'center', minWidth: '140px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--status-approved-text)', display: 'block', fontWeight: 600 }}>Disetujui (Resmi)</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-approved-text)' }}>{totalDisetujui}</span>
            </div>

            <div style={{ background: 'var(--status-cancel-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.65rem 1.25rem', borderRadius: '12px', textAlign: 'center', minWidth: '130px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--status-cancel-text)', display: 'block', fontWeight: 600 }}>Dibatalkan</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-cancel-text)' }}>{totalDibatalkan}</span>
            </div>
          </div>

        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--card-border)' }}>


          {/* Input Search */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari perihal, PIC, kepada, atau nomor surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Filter Jenis Surat */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="form-select"
            >
              <option value="ALL">Semua Jenis Surat</option>
              {JENIS_SURAT_OPTIONS.map((j, idx) => (
                <option key={idx} value={j}>{j}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div style={{ minWidth: '160px' }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
            >
              <option value="ALL">Semua Status</option>
              <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

        </div>
      </div>

      {/* Tabel Monitoring Publik */}
      <div className="glass-card" style={{ padding: '1rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--primary-red)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-title)', margin: 0 }}>
              Daftar Pengajuan Surat ({filteredLetters.length})
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={onOpenRequestModal}
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.55rem 1.15rem' }}
            >
              <FilePlus2 size={16} />
              + Input Pengajuan Surat
            </button>

            <button
              onClick={() => exportToExcel(filteredLetters, 'DigiLetter_Reg3_Pengajuan_Surat.xlsx')}
              className="btn"
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              title="Unduh seluruh data tabel ke format Excel (.xlsx)"
            >
              <FileSpreadsheet size={16} />
              Export ke Excel (.xlsx)
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center', width: '50px' }}>No</th>
                <th>Tgl Pengajuan</th>
                <th>Tgl TTD (EVP)</th>
                <th style={{ width: '130px', whiteSpace: 'nowrap' }}>Jenis Surat</th>
                <th style={{ minWidth: '280px', width: '320px' }}>Kepada</th>
                <th style={{ minWidth: '220px' }}>Nomor Surat</th>
                <th style={{ minWidth: '240px' }}>Perihal</th>
                <th>Takah</th>
                <th>PIC / Telegram</th>
                <th>Keterangan</th>
                <th style={{ textAlign: 'center', minWidth: '110px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    Tidak ada data pengajuan surat yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLetters.map((item, index) => {
                  const isApproved = item.status === 'Disetujui';
                  const isPending = item.status === 'Menunggu Persetujuan';

                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {index + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          {item.tanggal_pengajuan}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', fontWeight: 600, color: '#0369a1' }}>
                          {item.tanggal_ttd}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                          {item.jenis_surat}
                        </span>
                      </td>
                      <td style={{ minWidth: '280px', maxWidth: '340px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-title)', wordBreak: 'break-word', textTransform: 'uppercase' }}>
                          {item.kepada}
                        </div>
                      </td>
                      <td>
                        {isApproved ? (
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--primary-red)', background: 'rgba(224, 0, 0, 0.08)', padding: '0.35rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(224, 0, 0, 0.2)', display: 'inline-block' }}>
                            {item.nomor_surat}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                            (Otomatis setelah Approved)
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ color: 'var(--text-main)', lineHeight: 1.4 }}>
                          {item.perihal}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: item.takah !== '-' ? 'var(--text-title)' : 'var(--text-muted)' }}>
                          {item.takah}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-title)' }}>{item.pic}</div>
                          <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>{item.no_pic}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignment: 'flex-start' }}>
                          <span className={`badge-status ${isApproved ? 'disetujui' : item.status === 'Dibatalkan' ? 'dibatalkan' : 'menunggu'}`}>
                            {isApproved ? <CheckCircle2 size={12} /> : item.status === 'Dibatalkan' ? <XCircle size={12} /> : <Clock size={12} />}
                            {item.status}
                          </span>
                          {item.keterangan && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {item.keterangan}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                              onClick={() => onDeleteRequest(item)}
                              className="btn btn-danger btn-icon"
                              title="Batalkan / Hapus Pengajuan"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <div title="Pengajuan telah disetujui, tidak dapat diubah/dibatalkan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                            <Lock size={12} /> Terkunci
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
