import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Clock, XCircle, Edit3, Trash2, Hash, Calendar, PlusCircle, AlertCircle, FileSpreadsheet, Database, FilePlus2 } from 'lucide-react';
import { isWorkday } from '../utils/letterHelper';
import { exportToExcel } from '../utils/excelExporter';

export default function AdminMonitoring({ letters, onOpenApprovalModal, onEditRequest, onDeleteRequest, onOpenRequestModal }) {
  const [filterDate, setFilterDate] = useState('');

  // Kelompokkan data per tanggal TTD & urutkan dari nomor slot/agenda terbanyak/terbaru ke terlama
  const filteredLetters = letters
    .filter(item => filterDate === '' || item.tanggal_ttd === filterDate)
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

      {/* Banner Mode Admin Sekdiv */}
      <div className="glass-card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(224, 0, 0, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid rgba(224, 0, 0, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary-red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-title)', margin: 0 }}>
                Kelola & Verifikasi Sekretariat Divisi (Admin Mode)
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Halaman internal penomoran surat, alokasi spare 5 nomor urut per hari kerja, dan penetapan Takah.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--card-bg)', padding: '0.5rem 0.875rem', borderRadius: '10px', border: '1px solid var(--card-border)', fontSize: '0.8125rem', fontWeight: 600 }}>
              <Calendar size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle', color: 'var(--primary-red)' }} />
              Filter Tanggal TTD:
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ marginLeft: '0.5rem', padding: '0.2rem 0.4rem', border: '1px solid var(--input-border)', borderRadius: '6px', background: 'var(--input-bg)', color: 'var(--input-text)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Aturan Spare 5 Nomor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.8125rem', color: '#1e40af' }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Sistem Spare Slot & Libur Nasional:</strong> Setiap tanggal kerja (Senin–Jumat) dialokasikan spare 5 nomor urut. Hari libur akhir pekan (Sabtu & Minggu) serta <strong>Tanggal Merah / Libur Nasional Weekday</strong> secara otomatis di-skip oleh sistem.
        </span>
      </div>

      {/* Tabel Monitoring Admin */}
      <div className="glass-card" style={{ padding: '1rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--primary-red)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-title)', margin: 0 }}>
              Daftar Kelola Pengajuan Surat Admin ({filteredLetters.length})
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenRequestModal}
              className="btn btn-primary"
              style={{ fontSize: '0.875rem', padding: '0.55rem 1.25rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <FilePlus2 size={16} />
              + Input Pengajuan Surat
            </button>

            <button
              onClick={() => exportToExcel(filteredLetters, 'DigiLetter_Reg3_Admin_Export.xlsx')}
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
              title="Unduh seluruh data tabel admin ke format Excel (.xlsx)"
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
                <th style={{ textAlign: 'center', background: 'rgba(224, 0, 0, 0.1)', color: 'var(--primary-red)', width: '100px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <Hash size={14} /> No. Slot / Agenda
                  </div>
                </th>
                <th>Tgl Pengajuan</th>
                <th>Tgl TTD (EVP)</th>
                <th style={{ width: '130px', whiteSpace: 'nowrap' }}>Jenis Surat</th>
                <th style={{ minWidth: '280px', width: '320px' }}>Kepada</th>
                <th style={{ minWidth: '220px' }}>Nomor Surat (Generated)</th>
                <th style={{ minWidth: '220px' }}>Perihal</th>
                <th>Takah</th>
                <th>PIC</th>
                <th>Status</th>
                <th style={{ textAlign: 'center', minWidth: '130px' }}>Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    Tidak ada pengajuan surat untuk diverifikasi.
                  </td>
                </tr>
              ) : (
                filteredLetters.map((item, index) => {
                  const isApproved = item.status === 'Disetujui';
                  const isWork = isWorkday(item.tanggal_ttd);

                  return (
                    <tr key={item.id} style={{ background: !isWork ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>

                      {/* Kolom Pertama Spesial Admin: Nomor Slot / Agenda */}
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary-red)', background: 'rgba(224, 0, 0, 0.03)' }}>
                        {item.no_agenda ? (
                          <span style={{ fontSize: '0.875rem', background: 'var(--card-bg)', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(224, 0, 0, 0.3)', display: 'inline-block' }}>
                            #{String(item.no_agenda).padStart(6, '0')}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            [Belum]
                          </span>
                        )}
                      </td>

                      <td>{item.tanggal_pengajuan}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#0369a1' }}>{item.tanggal_ttd}</span>
                          {!isWork && (
                            <span style={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 700 }}>
                              (Hari Libur)
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                          {item.jenis_surat}
                        </span>
                      </td>
                      <td style={{ minWidth: '280px', maxWidth: '340px', fontWeight: 700, textTransform: 'uppercase' }}>{item.kepada}</td>
                      <td>
                        {isApproved ? (
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--primary-red)', background: 'rgba(224, 0, 0, 0.08)', padding: '0.35rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(224, 0, 0, 0.2)', display: 'inline-block' }}>
                            {item.nomor_surat}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                            Menunggu Verifikasi Admin
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: '240px' }}>{item.perihal}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: item.takah !== '-' ? 'var(--text-title)' : 'var(--text-muted)' }}>
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
                        <span className={`badge-status ${isApproved ? 'disetujui' : item.status === 'Dibatalkan' ? 'dibatalkan' : 'menunggu'}`}>
                          {isApproved ? <CheckCircle2 size={12} /> : item.status === 'Dibatalkan' ? <XCircle size={12} /> : <Clock size={12} />}
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                          <button
                            onClick={() => onOpenApprovalModal(item)}
                            className="btn btn-primary btn-icon"
                            title="Proses / Approve / Edit Takah"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <ShieldCheck size={14} />
                            {isApproved ? 'Edit Takah' : 'Approve'}
                          </button>
                          <button
                            onClick={() => onDeleteRequest(item)}
                            className="btn btn-danger btn-icon"
                            title="Hapus / Reject"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
