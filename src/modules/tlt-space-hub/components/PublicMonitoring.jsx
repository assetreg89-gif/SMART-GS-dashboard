import React, { useState } from 'react';
import { Search, Calendar, Clock, CheckCircle2, Clock3, RotateCcw, XCircle, UserCheck, Edit3, Trash2, CheckSquare, FileText, Eye, UploadCloud, Loader2, X, Copy, Check, ClipboardList, Building2, BarChart2 } from 'lucide-react';
import { uploadNotaDinasToSupabase } from '../lib/supabase';
import MonitoringCalendar from './MonitoringCalendar';

export default function PublicMonitoring({ 
  bookings, 
  rooms = [], 
  isAdmin, 
  activeTab = 'monitoring',
  setActiveTab,
  onOpenBookingModal, 
  onOpenBookingModalWithDate, 
  onUpdateBookingStatus, 
  onSaveApproval, 
  onRequestDeleteBooking 
}) {
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [uploadingBookingId, setUploadingBookingId] = useState(null);
  const [previewImageModal, setPreviewImageModal] = useState({ isOpen: false, url: '', name: '' });

  // State Modal Rekap Data Peminjaman
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false);
  const [recapStartDate, setRecapStartDate] = useState('');
  const [recapEndDate, setRecapEndDate] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleOpenRecapModal = () => {
    const today = getTodayStr();
    setRecapStartDate(today);
    setRecapEndDate(today);
    setIsCopied(false);
    setIsRecapModalOpen(true);
  };

  const setRecapPreset = (preset) => {
    const d = new Date();
    const today = getTodayStr();

    if (preset === 'today') {
      setRecapStartDate(today);
      setRecapEndDate(today);
    } else if (preset === 'week') {
      const currentDay = d.getDay();
      const diffToMon = d.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
      const mon = new Date(d.setDate(diffToMon));
      const monStr = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;

      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      const sunStr = `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`;

      setRecapStartDate(monStr);
      setRecapEndDate(sunStr);
    } else if (preset === 'month') {
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const firstStr = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-01`;
      const lastStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

      setRecapStartDate(firstStr);
      setRecapEndDate(lastStr);
    } else if (preset === 'all') {
      setRecapStartDate('');
      setRecapEndDate('');
    }
  };

  const getFilteredRecapBookings = () => {
    return bookings.filter(b => {
      const normStatus = getNormalizedStatus(b.status);
      if (normStatus === 'Dibatalkan') return false;
      if (recapStartDate && b.tanggal_pelaksanaan < recapStartDate) return false;
      if (recapEndDate && b.tanggal_pelaksanaan > recapEndDate) return false;
      return true;
    }).sort((a, b) => (a.tanggal_pelaksanaan + (a.pukul_mulai || '')).localeCompare(b.tanggal_pelaksanaan + (b.pukul_mulai || '')));
  };

  const getRecapText = () => {
    const list = getFilteredRecapBookings();

    const rangeLabel = (recapStartDate || recapEndDate)
      ? `${recapStartDate || 'Awal'} s/d ${recapEndDate || 'Akhir'}`
      : 'Semua Periode';

    if (list.length === 0) {
      return `📌 REKAP PEMINJAMAN RUANG RAPAT TELKOM LANDMARK TOWER\n📅 Periode: ${rangeLabel}\n\n⚠️ Tidak ada data peminjaman ruangan pada rentang tanggal tersebut.`;
    }

    let text = `📌 REKAP PEMINJAMAN RUANG RAPAT TELKOM LANDMARK TOWER\n`;
    text += `📅 Periode: ${rangeLabel}\n`;
    text += `📊 Total Agenda: ${list.length} Peminjaman\n`;
    text += `----------------------------------------\n\n`;

    list.forEach((item, index) => {
      const statusText = getNormalizedStatus(item.status);
      const jamStr = item.pukul_mulai ? `${item.pukul_mulai} - ${item.pukul_selesai}` : (item.pukul || '-');

      text += `${index + 1}. [${item.tanggal_pelaksanaan}] (Jam: ${jamStr})\n`;
      text += `   • Ruangan    : ${item.ruangan}\n`;
      text += `   • Unit/Divisi: ${item.unit_divisi}\n`;
      text += `   • Agenda     : ${item.agenda}\n`;
      text += `   • Status     : ${statusText}\n\n`;
    });

    text += `----------------------------------------\n`;
    text += `Di-generate secara otomatis via TLT Space Hub Dashboard`;
    return text;
  };

  const handleCopyRecap = () => {
    const text = getRecapText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const isImageFile = (url, name) => {
    if (!url) return false;
    const str = ((name || '') + ' ' + (url || '')).toLowerCase();
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.png') || cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.webp') || cleanUrl.endsWith('.gif') || str.includes('.png') || str.includes('.jpg') || str.includes('.jpeg') || str.includes('.webp') || str.includes('.gif') || str.startsWith('data:image/');
  };

  const handleDownloadFile = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'Nota_Dinas';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download via fetch failed, fallback to window.open', err);
      window.open(url, '_blank');
    }
  };

  const handleViewNotaDinas = (url, name, e) => {
    if (!url) return;
    e.preventDefault();
    setPreviewImageModal({ isOpen: true, url, name: name || 'Nota Dinas' });
  };

  // Helper normalisasi status agar data lama tetap terpeta secara tepat
  const getNormalizedStatus = (rawStatus) => {
    if (!rawStatus) return 'Menunggu Persetujuan';
    const s = rawStatus.trim();
    if (s === 'Booking / TU' || s === 'Pending' || s === 'Menunggu Persetujuan') return 'Menunggu Persetujuan';
    if (s === 'Disetujui - Unggah Nota Dinas' || s === 'Unggah Nota Dinas') return 'Unggah Nota Dinas';
    if (s === 'Approved' || s === 'Disetujui') return 'Disetujui';
    if (s === 'Done' || s === 'Selesai') return 'Selesai';
    if (s === 'Reschedule' || s === 'Jadwal Ulang') return 'Jadwal Ulang';
    if (s === 'Tidak Jadi' || s === 'Dibatalkan') return 'Dibatalkan';
    return s;
  };

  const filteredBookings = bookings.filter(b => {
    const normStatus = getNormalizedStatus(b.status);
    const matchFloor = selectedFloor === 'ALL' || b.floor === selectedFloor;
    const matchStatus = selectedStatus === 'ALL' || normStatus === selectedStatus;
    const matchSearch = searchTerm === '' || 
      b.agenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.unit_divisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ruangan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = selectedDate === '' || b.tanggal_pelaksanaan === selectedDate;
    return matchFloor && matchStatus && matchSearch && matchDate;
  });

  const handleDirectFileUpload = async (item, file) => {
    if (!file) return;
    setUploadingBookingId(item.id);

    try {
      let publicUrl = await uploadNotaDinasToSupabase(file);
      if (!publicUrl) {
        publicUrl = URL.createObjectURL(file);
      }

      const updatedBooking = {
        ...item,
        status: 'Unggah Nota Dinas',
        nota_dinas_url: publicUrl,
        nota_dinas_name: file.name
      };

      if (onSaveApproval) {
        await onSaveApproval(updatedBooking);
      } else if (onUpdateBookingStatus) {
        onUpdateBookingStatus(updatedBooking);
      }
    } catch (err) {
      console.error('Gagal mengunggah Nota Dinas:', err);
    } finally {
      setUploadingBookingId(null);
    }
  };

  const renderStatusBadgeWithAction = (item) => {
    const status = getNormalizedStatus(item.status);
    const isUploadingThis = uploadingBookingId === item.id;

    switch (status) {
      case 'Unggah Nota Dinas':
        const hasUploadedNota = Boolean(item.nota_dinas_url);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            {hasUploadedNota ? (
              <>
                <span className="badge-status disetujui" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)', gap: '0.3rem' }}>
                  <CheckCircle2 size={13} /> Nota Dinas Terunggah
                </span>
                <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                  Menunggu Persetujuan Admin
                </span>

                <label 
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: 600,
                    color: '#0284c7',
                    cursor: isUploadingThis ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    marginTop: '0.1rem',
                    textDecoration: 'underline'
                  }}
                  title="Klik jika ingin mengganti berkas Nota Dinas yang sudah terunggah"
                >
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" 
                    disabled={isUploadingThis}
                    onChange={(e) => handleDirectFileUpload(item, e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  {isUploadingThis ? 'Mengunggah...' : 'Ganti Berkas'}
                </label>
              </>
            ) : (
              <>
                <span className="badge-status unggah-nota">
                  <FileText size={13} /> Unggah Nota Dinas
                </span>

                {/* Tombol Aksi Langsung Buka Pemilih File */}
                <label 
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    background: 'var(--input-bg)',
                    border: '1px dotted #0284c7',
                    padding: '0.22rem 0.65rem',
                    borderRadius: '6px',
                    cursor: isUploadingThis ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s ease'
                  }}
                  title="Klik untuk Membuka Folder & Pilih Berkas Nota Dinas (PDF, PNG, JPG, Word)"
                >
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" 
                    disabled={isUploadingThis}
                    onChange={(e) => handleDirectFileUpload(item, e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  {isUploadingThis ? (
                    <>
                      <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={13} color="#0284c7" />
                      <span>Klik untuk unggah</span>
                    </>
                  )}
                </label>
              </>
            )}
          </div>
        );
      case 'Disetujui':
        return <span className="badge-status disetujui"><CheckSquare size={13} /> Disetujui</span>;
      case 'Selesai':
        return <span className="badge-status selesai"><CheckCircle2 size={13} /> Selesai</span>;
      case 'Menunggu Persetujuan':
        return <span className="badge-status menunggu-persetujuan"><Clock3 size={13} /> Menunggu Persetujuan</span>;
      case 'Jadwal Ulang':
        return <span className="badge-status jadwal-ulang"><RotateCcw size={13} /> Jadwal Ulang</span>;
      case 'Dibatalkan':
        return <span className="badge-status dibatalkan"><XCircle size={13} /> Dibatalkan</span>;
      default:
        return <span className="badge-status menunggu-persetujuan">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
              Monitoring Ketersediaan Ruang Rapat
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
              Pantau status ketersediaan dan pengajuan peminjaman ruangan Telkom Landmark Tower secara real-time.
            </p>
          </div>

          {onOpenBookingModal && (
            <button 
              onClick={onOpenBookingModal}
              className="btn btn-primary"
              style={{ 
                fontSize: '0.9375rem', 
                padding: '0.65rem 1.35rem',
                fontWeight: 800,
                borderRadius: '12px',
                background: 'var(--primary-red)',
                boxShadow: '0 4px 14px rgba(224, 0, 0, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              + Input Pengajuan Ruangan
            </button>
          )}
        </div>

        {/* Tab Navigation Controls */}
        {setActiveTab && (
          <div className="tab-nav-container" style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--input-bg)',
            padding: '0.4rem',
            borderRadius: '14px',
            border: '1.5px solid var(--card-border)',
            gap: '0.4rem',
            width: 'fit-content',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveTab('monitoring')}
              className="tab-nav-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'monitoring' ? 'var(--primary-red)' : 'transparent',
                color: activeTab === 'monitoring' ? '#ffffff' : 'var(--text-title)',
                fontSize: '0.875rem',
                fontWeight: activeTab === 'monitoring' ? 800 : 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'monitoring' ? '0 2px 10px rgba(224, 0, 0, 0.35)' : 'none'
              }}
            >
              <Calendar size={16} />
              <span>Monitoring Ruangan</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className="tab-nav-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'catalog' ? 'var(--primary-red)' : 'transparent',
                color: activeTab === 'catalog' ? '#ffffff' : 'var(--text-title)',
                fontSize: '0.875rem',
                fontWeight: activeTab === 'catalog' ? 800 : 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'catalog' ? '0 2px 10px rgba(224, 0, 0, 0.35)' : 'none'
              }}
            >
              <Building2 size={16} />
              <span>Katalog Ruang Lt. 9, 11, 12</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className="tab-nav-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'analytics' ? 'var(--primary-red)' : 'transparent',
                color: activeTab === 'analytics' ? '#ffffff' : 'var(--text-title)',
                fontSize: '0.875rem',
                fontWeight: activeTab === 'analytics' ? 800 : 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'analytics' ? '0 2px 10px rgba(224, 0, 0, 0.35)' : 'none'
              }}
            >
              <BarChart2 size={16} />
              <span>Statistik & Analitik</span>
            </button>
          </div>
        )}

        <div className="stat-grid-bar" style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
          <div className="stat-card-box" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'center', minWidth: '120px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Peminjaman</span>
            <span className="stat-card-number" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-title)' }}>{bookings.length}</span>
          </div>

          <div className="stat-card-box" style={{ background: 'var(--status-pending-bg)', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'center', minWidth: '140px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--status-pending-text)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Menunggu Persetujuan</span>
            <span className="stat-card-number" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-pending-text)' }}>
              {bookings.filter(b => getNormalizedStatus(b.status) === 'Menunggu Persetujuan').length}
            </span>
          </div>

          <div className="stat-card-box" style={{ background: 'var(--status-nota-bg)', border: '1px solid rgba(14, 165, 233, 0.45)', padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'center', minWidth: '130px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--status-nota-text)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Unggah Nota Dinas</span>
            <span className="stat-card-number" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-nota-text)' }}>
              {bookings.filter(b => getNormalizedStatus(b.status) === 'Unggah Nota Dinas').length}
            </span>
          </div>

          <div className="stat-card-box" style={{ background: 'var(--status-approved-bg)', border: '1px solid rgba(34, 197, 94, 0.45)', padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'center', minWidth: '130px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--status-approved-text)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Disetujui (Resmi)</span>
            <span className="stat-card-number" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-approved-text)' }}>
              {bookings.filter(b => getNormalizedStatus(b.status) === 'Disetujui').length}
            </span>
          </div>

          <div className="stat-card-box" style={{ background: 'var(--status-done-bg)', border: '1px solid rgba(22, 163, 74, 0.4)', padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'center', minWidth: '120px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--status-done-text)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Agenda Selesai</span>
            <span className="stat-card-number" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-done-text)' }}>
              {bookings.filter(b => getNormalizedStatus(b.status) === 'Selesai').length}
            </span>
          </div>
        </div>
      </div>

      {/* Seksi Kalender Bulanan Ketersediaan Ruangan */}
      <MonitoringCalendar
        bookings={bookings}
        rooms={rooms}
        isAdmin={isAdmin}
        onOpenBookingModalWithDate={onOpenBookingModalWithDate || onOpenBookingModal}
      />

      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Cari Agenda, PIC, Ruangan, Divisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.25rem',
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'var(--input-bg)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--input-border)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>Lantai:</span>
          {['ALL', '9', '11', '12'].map(fl => (
            <button 
              key={fl}
              onClick={() => setSelectedFloor(fl)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: selectedFloor === fl ? 'var(--primary-red)' : 'transparent',
                color: selectedFloor === fl ? '#ffffff' : 'var(--text-main)',
                fontSize: '0.8125rem',
                fontWeight: selectedFloor === fl ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {fl === 'ALL' ? 'Semua' : `Lt. ${fl}`}
            </button>
          ))}
        </div>

        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            color: 'var(--text-main)',
            fontSize: '0.8125rem',
            outline: 'none'
          }}
        >
          <option value="ALL">Semua Status</option>
          <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
          <option value="Unggah Nota Dinas">Unggah Nota Dinas</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Selesai">Selesai</option>
          <option value="Jadwal Ulang">Jadwal Ulang</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>

        <input 
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '0.45rem 0.75rem',
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            color: 'var(--text-main)',
            fontSize: '0.8125rem',
            outline: 'none'
          }}
        />

        {(selectedFloor !== 'ALL' || selectedStatus !== 'ALL' || searchTerm !== '' || selectedDate !== '') && (
          <button 
            onClick={() => { setSelectedFloor('ALL'); setSelectedStatus('ALL'); setSearchTerm(''); setSelectedDate(''); }}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
          >
            Reset Filter
          </button>
        )}

        {isAdmin && (
          <button 
            onClick={handleOpenRecapModal}
            className="btn"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              marginLeft: 'auto'
            }}
            title="Khusus Admin: Rekap & Salin Data Peminjaman Ruangan Berdasarkan Rentang Tanggal"
          >
            <ClipboardList size={15} /> Rekap & Salin Data
          </button>
        )}
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 280px)', minHeight: '380px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem', minWidth: '1150px' }}>
            <thead>
              <tr style={{ background: 'var(--table-head-bg)', borderBottom: '2px solid var(--card-border)', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)', width: '40px' }}>No</th>
                <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)', whiteSpace: 'nowrap' }}>Konfirmasi</th>
                <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)', whiteSpace: 'nowrap' }}>Hari / Tanggal</th>
                <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)', whiteSpace: 'nowrap' }}>Pukul</th>
                <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)' }}>Ruangan</th>
                <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)' }}>Unit / Divisi</th>
                <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)' }}>PIC Pemohon</th>
                <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)' }}>Agenda & Nota Dinas</th>
                <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)' }}>Pemberi Izin</th>
                <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)', textAlign: 'center' }}>Status</th>
                {isAdmin ? (
                  <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)', textAlign: 'center' }}>Aksi Admin</th>
                ) : (
                  <th style={{ padding: '0.75rem 0.65rem', fontWeight: 700, color: 'var(--text-title)', textAlign: 'center' }}>Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Tidak ada data peminjaman ruangan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((item, index) => (
                  <tr 
                    key={item.id}
                    style={{ 
                      borderBottom: '1px solid var(--card-border)',
                      background: index % 2 === 0 ? 'transparent' : 'var(--table-hover)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '0.75rem 0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{index + 1}</td>
                    <td style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      {item.tanggal_konfirmasi}
                    </td>
                    <td style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Calendar size={13} color="var(--primary-red)" />
                        {item.tanggal_pelaksanaan}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-main)', fontSize: '0.775rem' }}>
                        <Clock size={13} color="#0284c7" />
                        {item.pukul_mulai} - {item.pukul_selesai}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.65rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-title)', display: 'block' }}>{item.ruangan}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.65rem', color: 'var(--text-main)' }}>{item.unit_divisi}</td>
                    <td style={{ padding: '0.75rem 0.65rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.pic}</div>
                      {isAdmin && item.pic_phone && <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{item.pic_phone}</div>}
                    </td>
                    <td style={{ padding: '0.75rem 0.65rem', maxWidth: '260px' }}>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{item.agenda}</div>
                      {item.keterangan && <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>Catatan: {item.keterangan}</div>}
                      
                      {isAdmin && item.nota_dinas_url && (
                        <div style={{ marginTop: '0.4rem' }}>
                          <a 
                            href={item.nota_dinas_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => handleViewNotaDinas(item.nota_dinas_url, item.nota_dinas_name, e)}
                            style={{ fontSize: '0.7rem', color: '#0284c7', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--input-bg)', padding: '0.2rem 0.55rem', borderRadius: '4px', border: '1px solid var(--input-border)', cursor: 'pointer' }}
                            title="Lihat Pratinjau / Unduh Berkas Nota Dinas"
                          >
                            <Eye size={12} /> Lihat Nota Dinas
                          </a>
                        </div>
                      )}

                      {!isAdmin && item.nota_dinas_url && (
                        <div style={{ marginTop: '0.4rem' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            color: '#059669', 
                            fontWeight: 600, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.25rem', 
                            background: 'rgba(16, 185, 129, 0.1)', 
                            padding: '0.2rem 0.55rem', 
                            borderRadius: '4px', 
                            border: '1px solid rgba(16, 185, 129, 0.25)' 
                          }}>
                            <CheckCircle2 size={12} /> Berkas Nota Dinas Terunggah
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.775rem', color: item.pemberi_izin !== '-' ? 'var(--status-approved-text)' : 'var(--text-muted)' }}>
                        <UserCheck size={13} />
                        {item.pemberi_izin}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>
                      {renderStatusBadgeWithAction(item)}
                    </td>
                    {isAdmin ? (
                      <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem' }}>
                          <button 
                            onClick={() => onUpdateBookingStatus(item)}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', gap: '0.2rem' }}
                            title="Edit Data / Status & Nota Dinas"
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button 
                            onClick={() => onRequestDeleteBooking(item)}
                            className="btn btn-danger"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            title="Hapus Pengajuan"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    ) : (
                      <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>
                        {(() => {
                          const normStatus = getNormalizedStatus(item.status);
                          const isLockedForPublic = normStatus === 'Disetujui' || normStatus === 'Selesai';

                          if (isLockedForPublic) {
                            return (
                              <span 
                                style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontStyle: 'italic' }}
                                title="Pengajuan telah disetujui. Pembatalan hanya dapat dilakukan oleh Admin."
                              >
                                Terkunci (Admin)
                              </span>
                            );
                          }

                          return (
                            <button 
                              onClick={() => onRequestDeleteBooking(item)}
                              className="btn btn-danger"
                              style={{ padding: '0.3rem 0.65rem', fontSize: '0.725rem', gap: '0.25rem' }}
                              title="Batalkan / Hapus Pengajuan Peminjaman Ini"
                            >
                              <Trash2 size={12} /> Batalkan
                            </button>
                          );
                        })()}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pop-up Pratinjau Dokumen / Gambar Nota Dinas */}
      {previewImageModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1300 }} onClick={() => setPreviewImageModal({ isOpen: false, url: '', name: '' })}>
          <div 
            className="modal-container glass-card" 
            style={{ maxWidth: '850px', width: '94%', padding: '1.25rem', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-title)', margin: 0 }}>
                  Pratinjau Nota Dinas
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  {previewImageModal.name || 'Berkas Dokumen Nota Dinas'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewImageModal.url, previewImageModal.name)}
                  className="btn btn-primary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem', gap: '0.35rem' }}
                >
                  <UploadCloud size={14} style={{ transform: 'rotate(180deg)' }} /> Unduh Berkas
                </button>
                <button 
                  onClick={() => setPreviewImageModal({ isOpen: false, url: '', name: '' })}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', background: 'rgba(0, 0, 0, 0.05)', padding: '0.75rem', borderRadius: '12px', maxHeight: '78vh', minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              {isImageFile(previewImageModal.url, previewImageModal.name) ? (
                <img 
                  src={previewImageModal.url} 
                  alt="Pratinjau Nota Dinas" 
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div style="padding: 2rem; color: var(--text-muted);">
                          <p style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">Gambar tidak dapat ditampilkan secara langsung.</p>
                          <a href="${previewImageModal.url}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: underline; font-weight: 700;">Buka / Unduh Berkas Nota Dinas di Tab Baru</a>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <iframe 
                  src={previewImageModal.url} 
                  title="Pratinjau Dokumen Nota Dinas"
                  style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '8px' }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Pop-up Rekap Data Peminjaman */}
      {isRecapModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1300 }} onClick={() => setIsRecapModalOpen(false)}>
          <div 
            className="modal-container glass-card" 
            style={{ maxWidth: '650px', width: '94%', padding: '1.5rem', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={20} color="#0284c7" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-title)', margin: 0 }}>
                    Rekap & Salin Data Peminjaman
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Pilih rentang tanggal untuk merekap agenda peminjaman ruangan.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsRecapModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Quick Presets Periode */}
            <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.25rem' }}>Preset:</span>
                <button
                  type="button"
                  onClick={() => setRecapPreset('today')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem' }}
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setRecapPreset('week')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem' }}
                >
                  Minggu Ini
                </button>
                <button
                  type="button"
                  onClick={() => setRecapPreset('month')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem' }}
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => setRecapPreset('all')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem' }}
                >
                  Semua Data
                </button>
              </div>

              {/* Input Rentang Tanggal */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--input-border)' }}>
                <div style={{ flex: 1, minWidth: '130px' }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Tanggal Mulai:
                  </label>
                  <input 
                    type="date"
                    value={recapStartDate}
                    onChange={(e) => setRecapStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      fontSize: '0.8125rem'
                    }}
                  />
                </div>

                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1.2rem' }}>s/d</span>

                <div style={{ flex: 1, minWidth: '130px' }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Tanggal Selesai:
                  </label>
                  <input 
                    type="date"
                    value={recapEndDate}
                    onChange={(e) => setRecapEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      fontSize: '0.8125rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Live Text Preview Container */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-title)' }}>
                  Pratinjau Hasil Rekap Teks:
                </span>
                <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  {getFilteredRecapBookings().length} Agenda Ditemukan
                </span>
              </div>

              <textarea 
                readOnly
                value={getRecapText()}
                style={{
                  width: '100%',
                  height: '210px',
                  padding: '0.75rem',
                  fontFamily: 'monospace, monospace',
                  fontSize: '0.775rem',
                  lineHeight: '1.45',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  resize: 'none',
                  outline: 'none',
                  whiteSpace: 'pre-wrap'
                }}
              />
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsRecapModalOpen(false)}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleCopyRecap}
                className="btn btn-primary"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.45rem 1.25rem',
                  background: isCopied ? '#16a34a' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isCopied ? '0 3px 10px rgba(22, 163, 74, 0.3)' : '0 3px 10px rgba(2, 132, 199, 0.3)'
                }}
              >
                {isCopied ? (
                  <>
                    <Check size={16} /> Berhasil Disalin!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Salin Rekap Teks
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
