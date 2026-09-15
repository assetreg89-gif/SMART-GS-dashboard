import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Plus, CheckCircle2, AlertCircle, Info, Building2, User, FileText, X } from 'lucide-react';

export default function MonitoringCalendar({ bookings = [], rooms = [], isAdmin, onOpenBookingModalWithDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [nonAdminNotice, setNonAdminNotice] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
  };

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

  const extractTimeRange = (b) => {
    let start = b.pukul_mulai || b.jam_mulai;
    let end = b.pukul_selesai || b.jam_selesai;

    if ((!start || !end) && b.pukul) {
      const parts = b.pukul.split('-').map(s => s.trim());
      if (parts.length === 2) {
        start = start || parts[0];
        end = end || parts[1];
      }
    }

    return {
      start: start || '08:00',
      end: end || '17:00'
    };
  };

  // Filter bookings berdasarkan lantai yang terpilih
  const filteredBookings = bookings.filter(b => {
    const normStatus = getNormalizedStatus(b.status);
    if (normStatus === 'Dibatalkan') return false;
    if (selectedFloor !== 'ALL' && b.floor !== selectedFloor) return false;
    return true;
  });

  // Filter daftar ruangan berdasarkan lantai
  const filteredRooms = rooms.filter(r => {
    if (selectedFloor !== 'ALL' && r.floor !== selectedFloor) return false;
    return true;
  });

  // Perhitungan Grid Bulanan (Senin = 0, ..., Minggu = 6)
  const firstDayOfMonthIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Pad hari bulan sebelumnya
  for (let i = firstDayOfMonthIndex - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
    const yyyy = prevDate.getFullYear();
    const mm = String(prevDate.getMonth() + 1).padStart(2, '0');
    const dd = String(prevDate.getDate()).padStart(2, '0');
    calendarDays.push({
      date: prevDate,
      dateStr: `${yyyy}-${mm}-${dd}`,
      isCurrentMonth: false
    });
  }

  // Hari di bulan berjalan
  for (let d = 1; d <= daysInMonth; d++) {
    const currDate = new Date(year, month, d);
    const yyyy = currDate.getFullYear();
    const mm = String(currDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    calendarDays.push({
      date: currDate,
      dateStr: dateStr,
      isCurrentMonth: true,
      dayNum: d
    });
  }

  // Pad sisa sel di akhir grid agar genap kelipatan 7
  const remainingCells = 35 - calendarDays.length > 0 ? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, month + 1, i);
    const yyyy = nextDate.getFullYear();
    const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dd = String(nextDate.getDate()).padStart(2, '0');
    calendarDays.push({
      date: nextDate,
      dateStr: `${yyyy}-${mm}-${dd}`,
      isCurrentMonth: false
    });
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Ambil data peminjaman untuk tanggal yang sedang terpilih
  const selectedDayBookings = filteredBookings.filter(b => b.tanggal_pelaksanaan === selectedDateStr);

  // Format label tanggal terpilih
  const formatSelectedDateTitle = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Handler Klik Kiri Tanggal -> Buka Pop-up Informasi / Riwayat
  const handleLeftClickDate = (dateStr) => {
    setSelectedDateStr(dateStr);
    setIsDetailModalOpen(true);
  };

  // Handler Klik Kanan (Context Menu) pada Tanggal -> Langsung Form Peminjaman khusus Admin GS (hanya jika bukan tanggal lampau)
  const handleContextMenuDate = (e, dateStr) => {
    e.preventDefault(); // Matikan menu klik kanan default browser
    setSelectedDateStr(dateStr);

    if (dateStr < todayStr) {
      setNonAdminNotice('Peminjaman ruangan hanya dapat dilakukan untuk hari ini dan tanggal mendatang.');
      setTimeout(() => setNonAdminNotice(null), 4000);
      return;
    }

    if (onOpenBookingModalWithDate) {
      onOpenBookingModalWithDate(dateStr);
    }
  };

  const isSelectedDatePast = selectedDateStr < todayStr;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.75rem', borderRadius: '16px' }}>
      
      {/* Header Bar Kalender */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={20} style={{ color: 'var(--primary-red)' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-title)', margin: 0 }}>
              Kalender Ketersediaan Ruangan
            </h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            💡 <strong>Klik kiri tanggal</strong> untuk melihat riwayat/ketersediaan • <strong>Klik kanan</strong> untuk buat peminjaman ruangan
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Filter Lantai */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--input-bg)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--input-border)' }}>
            <button
              onClick={() => setSelectedFloor('ALL')}
              className={`btn ${selectedFloor === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              Semua Lantai
            </button>
            <button
              onClick={() => setSelectedFloor('9')}
              className={`btn ${selectedFloor === '9' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              Lt. 9
            </button>
            <button
              onClick={() => setSelectedFloor('11')}
              className={`btn ${selectedFloor === '11' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              Lt. 11
            </button>
            <button
              onClick={() => setSelectedFloor('12')}
              className={`btn ${selectedFloor === '12' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              Lt. 12
            </button>
          </div>

          {/* Controls Navigasi Bulan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={goToToday}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
            >
              Hari Ini
            </button>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--input-border)' }}>
              <button
                onClick={prevMonth}
                title="Bulan Sebelumnya"
                style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '0.375rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '130px', textAlign: 'center', color: 'var(--text-title)' }}>
                {monthNames[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                title="Bulan Selanjutnya"
                style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '0.375rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notice jika Non-Admin atau Klik Kanan pada Tanggal Lampau */}
      {nonAdminNotice && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.625rem 1rem',
          borderRadius: '8px',
          background: 'rgba(234, 179, 8, 0.12)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          color: '#a16207',
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <Info size={16} />
          {nonAdminNotice}
        </div>
      )}

      {/* Grid Utama Kalender */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', position: 'relative' }}>
        
        {/* Header Nama Hari */}
        {dayNames.map((d, idx) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              color: idx >= 5 ? 'var(--primary-red)' : 'var(--text-muted)',
              padding: '0.5rem 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {d}
          </div>
        ))}

        {/* Sel Tanggal */}
        {calendarDays.map((item, index) => {
          const isToday = item.dateStr === todayStr;
          const isSelected = item.dateStr === selectedDateStr;
          const isPastDate = item.dateStr < todayStr;
          
          // Bookings pada tanggal ini
          const dayBookings = filteredBookings.filter(b => b.tanggal_pelaksanaan === item.dateStr);
          const hasBookings = dayBookings.length > 0;

          // Distinct status untuk dots indikator
          const statusTypes = Array.from(new Set(dayBookings.map(b => getNormalizedStatus(b.status))));

          return (
            <div
              key={index}
              onClick={() => handleLeftClickDate(item.dateStr)}
              onContextMenu={(e) => handleContextMenuDate(e, item.dateStr)}
              title={isPastDate ? "Tanggal sudah lewat (Klik kiri untuk melihat riwayat)" : isAdmin ? "Klik kiri: Pop-up info | Klik kanan: Form peminjaman" : "Klik kiri untuk pop-up info ketersediaan jam"}
              style={{
                minHeight: '84px',
                padding: '0.375rem 0.5rem',
                borderRadius: '10px',
                border: isSelected 
                  ? '2px solid var(--primary-red)' 
                  : isToday 
                    ? '2px dashed var(--primary-red)' 
                    : '1px solid var(--card-border)',
                background: isSelected
                  ? 'rgba(224, 0, 0, 0.18)'
                  : isPastDate
                    ? 'var(--input-bg)'
                    : hasBookings
                      ? 'rgba(224, 0, 0, 0.08)'
                      : item.isCurrentMonth
                        ? 'var(--card-bg)'
                        : 'rgba(0, 0, 0, 0.03)',
                opacity: item.isCurrentMonth ? (isPastDate ? 0.75 : 1) : 0.45,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {/* Top Row: Tanggal & Badge Today */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: isToday || isSelected ? 800 : 600,
                    color: isSelected 
                      ? 'var(--primary-red)' 
                      : isToday 
                        ? 'var(--primary-red)' 
                        : isPastDate
                          ? 'var(--text-muted)'
                          : 'var(--text-title)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isToday ? 'rgba(224, 0, 0, 0.15)' : 'transparent'
                  }}
                >
                  {item.date.getDate()}
                </span>

                {isToday && (
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--primary-red)', background: 'rgba(224, 0, 0, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                    Hari ini
                  </span>
                )}
              </div>

              {/* Middle / Bottom Content: Indikator Keterisian & Riwayat */}
              <div style={{ marginTop: '0.25rem' }}>
                {hasBookings ? (
                  <div>
                    <div style={{ 
                      fontSize: '0.6875rem', 
                      fontWeight: 700, 
                      color: isPastDate ? 'var(--text-muted)' : 'var(--primary-red)', 
                      background: isPastDate ? 'rgba(148, 163, 184, 0.15)' : 'rgba(224, 0, 0, 0.1)', 
                      padding: '0.15rem 0.4rem', 
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '0.2rem'
                    }}>
                      {dayBookings.length} Terpakai
                    </div>
                    {/* Status Dots */}
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                      {statusTypes.map((st, i) => {
                        let dotColor = '#ca8a04'; // yellow
                        if (st === 'Disetujui' || st === 'Selesai') dotColor = '#16a34a'; // green
                        if (st === 'Unggah Nota Dinas' || st === 'Jadwal Ulang') dotColor = '#0284c7'; // blue
                        return (
                          <span
                            key={i}
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isPastDate ? '#94a3b8' : dotColor,
                              display: 'inline-block'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Kosong
                  </div>
                )}
              </div>

            </div>
          );
        })}

      </div>

      {/* MINI POP-UP MODAL INFORMASI / RIWAYAT KETERSEDIAAN RUANGAN */}
      {isDetailModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-container glass-card" style={{ maxWidth: '410px', width: '90%', maxHeight: '82vh', padding: '1rem 1.15rem', borderRadius: '14px' }}>
            
            {/* Header Mini Modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--card-border)', marginBottom: '0.625rem' }}>
              <div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--primary-red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isSelectedDatePast ? 'Riwayat Peminjaman Ruangan' : 'Ketersediaan Ruangan'}
                </span>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-title)', margin: '0.05rem 0 0 0' }}>
                  {formatSelectedDateTitle(selectedDateStr)}
                </h4>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="btn btn-secondary"
                style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Content Scrollable Internal Area */}
            <div style={{ maxHeight: '270px', overflowY: 'auto', paddingRight: '2px', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
              {filteredRooms.map(room => {
                // Cari peminjaman ruangan ini di tanggal terpilih
                const roomBookings = selectedDayBookings.filter(b => b.ruangan === room.name);
                const hasApprovedBooking = roomBookings.some(b => {
                  const s = getNormalizedStatus(b.status);
                  return s === 'Disetujui' || s === 'Selesai';
                });

                return (
                  <div
                    key={room.id}
                    style={{
                      background: 'var(--card-bg)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.625rem',
                      border: hasApprovedBooking 
                        ? '1px solid rgba(224, 0, 0, 0.4)' 
                        : roomBookings.length > 0
                          ? '1px solid rgba(234, 179, 8, 0.4)'
                          : '1px solid var(--card-border)',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Building2 size={13} style={{ color: 'var(--primary-red)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-title)', lineHeight: 1.2 }}>
                          {room.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.5875rem', fontWeight: 600, padding: '0.05rem 0.3rem', borderRadius: '3px', background: 'var(--input-bg)', color: 'var(--text-muted)', flexShrink: 0 }}>
                        Lt. {room.floor}
                      </span>
                    </div>

                    {roomBookings.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.2rem' }}>
                        {roomBookings.map((b, idx) => {
                          const normStatus = getNormalizedStatus(b.status);
                          const isApproved = normStatus === 'Disetujui' || normStatus === 'Selesai';

                          return (
                            <div
                              key={idx}
                              style={{
                                background: isApproved ? 'rgba(224, 0, 0, 0.05)' : 'rgba(234, 179, 8, 0.06)',
                                borderLeft: isApproved ? '2.5px solid var(--primary-red)' : '2.5px solid #ca8a04',
                                padding: '0.3rem 0.45rem',
                                borderRadius: '0 5px 5px 0',
                                fontSize: '0.6875rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.2rem', marginBottom: '0.05rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: isApproved ? 'var(--primary-red)' : '#ca8a04', fontWeight: 700, fontSize: '0.65rem' }}>
                                  <Clock size={10} />
                                  {b.pukul || `${b.pukul_mulai} - ${b.pukul_selesai}`}
                                </div>
                                <span style={{
                                  fontSize: '0.575rem',
                                  fontWeight: 700,
                                  padding: '0.05rem 0.25rem',
                                  borderRadius: '3px',
                                  background: 'var(--card-bg)',
                                  color: isApproved ? 'var(--primary-red)' : '#ca8a04',
                                  border: isApproved ? '1px solid rgba(224, 0, 0, 0.25)' : '1px solid rgba(234, 179, 8, 0.3)',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {isApproved ? (isSelectedDatePast ? 'Selesai' : '⛔ Sudah Disetujui') : '⏳ Menunggu'}
                                </span>
                              </div>
                              
                              <div style={{ fontWeight: 700, color: 'var(--text-title)', margin: '0.05rem 0', fontSize: '0.6875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {b.agenda}
                              </div>
                              
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.625rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                PIC: {b.pic} ({b.unit_divisi})
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ 
                        marginTop: '0.2rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem', 
                        color: isSelectedDatePast ? 'var(--text-muted)' : '#16a34a', 
                        fontSize: '0.6875rem', 
                        fontWeight: 600,
                        background: isSelectedDatePast ? 'var(--input-bg)' : 'rgba(34, 197, 94, 0.08)',
                        padding: '0.25rem 0.4rem',
                        borderRadius: '4px'
                      }}>
                        <CheckCircle2 size={12} />
                        {isSelectedDatePast ? 'Tidak ada peminjaman pada tanggal ini' : 'Tersedia Seharian (Bisa Diajukan)'}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Footer Mini Modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)', gap: '0.375rem' }}>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              >
                Tutup
              </button>

              {isSelectedDatePast ? (
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Tanggal Sudah Lewat
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    if (onOpenBookingModalWithDate) onOpenBookingModalWithDate(selectedDateStr);
                  }}
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.75rem',
                    background: 'linear-gradient(135deg, var(--primary-red) 0%, #b30000 100%)',
                    boxShadow: '0 3px 10px rgba(224, 0, 0, 0.3)'
                  }}
                >
                  <Plus size={13} />
                  Ajukan Peminjaman
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
