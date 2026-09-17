import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Calendar, MapPin, FileText } from 'lucide-react';
import { MOCK_ROOMS } from '../data/mockData';
import { useAuth } from '../../../auth/AuthContext';

export default function BookingRequestModal({ isOpen, onClose, onSubmitBooking, rooms = MOCK_ROOMS, existingBookings = [], initialDate = null, initialRoom = null }) {
  const { user } = useAuth();
  const roomList = rooms && rooms.length > 0 ? rooms : MOCK_ROOMS;

  const [formData, setFormData] = useState({
    ruangan: initialRoom || (roomList && roomList.length > 0 ? roomList[0].name : ''),
    floor: roomList && roomList.length > 0 ? (roomList.find(r => r.name === initialRoom)?.floor || roomList[0].floor) : '9',
    tanggal_pelaksanaan: initialDate || new Date().toISOString().split('T')[0],
    pukul_mulai: '09:00',
    pukul_selesai: '11:00',
    unit_divisi: user?.unit_kerja || '',
    pic: user?.name || '',
    pic_phone: user?.phone_number || '',
    agenda: '',
    keterangan: ''
  });

  const [conflictError, setConflictError] = useState(null);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Reset form menjadi bersih setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      const selectedRoomName = initialRoom || (roomList && roomList.length > 0 ? roomList[0].name : '');
      const selectedRoomObj = roomList.find(r => r.name === selectedRoomName);

      setFormData({
        ruangan: selectedRoomName,
        floor: selectedRoomObj ? selectedRoomObj.floor : '9',
        tanggal_pelaksanaan: initialDate || new Date().toISOString().split('T')[0],
        pukul_mulai: '09:00',
        pukul_selesai: '11:00',
        unit_divisi: user?.unit_kerja || '',
        pic: user?.name || '',
        pic_phone: user?.phone_number || '',
        agenda: '',
        keterangan: ''
      });
      setConflictError(null);
      setShowCancelConfirm(false);
    }
  }, [isOpen]);

  // Reset pesan error bentrok jika user mengubah parameter ruangan atau jam
  useEffect(() => {
    setConflictError(null);
  }, [formData.ruangan, formData.tanggal_pelaksanaan, formData.pukul_mulai, formData.pukul_selesai]);

  if (!isOpen) return null;

  const handleAttemptClose = () => {
    const isFormFilled = formData.unit_divisi.trim() !== '' || formData.pic.trim() !== '' || formData.pic_phone.trim() !== '' || formData.agenda.trim() !== '' || formData.keterangan.trim() !== '';
    if (isFormFilled) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  const handleRoomChange = (e) => {
    const selectedRoomName = e.target.value;
    const roomObj = roomList.find(r => r.name === selectedRoomName);
    setFormData(prev => ({
      ...prev,
      ruangan: selectedRoomName,
      floor: roomObj ? roomObj.floor : '9'
    }));
  };

  // Penanganan waktu agar pop-up dropdown jam di Chrome otomatis tertutup setelah dipilih
  const handleTimeChange = (field, e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, [field]: val }));
    
    if (val && val.length === 5) {
      const targetInput = e.target;
      setTimeout(() => {
        if (targetInput && typeof targetInput.blur === 'function') {
          targetInput.blur();
        }
      }, 150);
    }
  };

  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
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

  const isTimeOverlapping = (startA, endA, startB, endB) => {
    const aStart = toMinutes(startA);
    const aEnd = toMinutes(endA);
    const bStart = toMinutes(startB);
    const bEnd = toMinutes(endB);
    return aStart < bEnd && bStart < aEnd;
  };

  // Cek apakah ada booking (Disetujui, Selesai, atau Pending/Menunggu Persetujuan) yang bentrok jam dengan jam terpilih
  const getConflictingBooking = (roomName) => {
    return existingBookings.find(b => {
      const normStatus = getNormalizedStatus(b.status);
      const isOccupiedOrPending = normStatus === 'Disetujui' || normStatus === 'Selesai' || normStatus === 'Menunggu Persetujuan' || normStatus === 'Unggah Nota Dinas';
      const isSameRoom = b.ruangan.trim().toLowerCase() === roomName.trim().toLowerCase();
      const isSameDate = b.tanggal_pelaksanaan === formData.tanggal_pelaksanaan;
      
      const { start: bStart, end: bEnd } = extractTimeRange(b);
      const isOverlap = isTimeOverlapping(formData.pukul_mulai, formData.pukul_selesai, bStart, bEnd);
      return isOccupiedOrPending && isSameRoom && isSameDate && isOverlap;
    });
  };

  // Ambil semua booking yang sudah Di-ACC untuk ruangan & tanggal terpilih
  const getApprovedBookingsForRoom = (roomName) => {
    return existingBookings.filter(b => {
      const normStatus = getNormalizedStatus(b.status);
      const isApprovedOrDone = normStatus === 'Disetujui' || normStatus === 'Selesai';
      const isSameRoom = b.ruangan.trim().toLowerCase() === roomName.trim().toLowerCase();
      const isSameDate = b.tanggal_pelaksanaan === formData.tanggal_pelaksanaan;
      return isApprovedOrDone && isSameRoom && isSameDate;
    });
  };

  // Ambil semua booking yang masih Menunggu Persetujuan untuk ruangan & tanggal terpilih
  const getPendingBookingsForRoom = (roomName) => {
    return existingBookings.filter(b => {
      const normStatus = getNormalizedStatus(b.status);
      const isPending = normStatus === 'Menunggu Persetujuan' || normStatus === 'Unggah Nota Dinas';
      const isSameRoom = b.ruangan.trim().toLowerCase() === roomName.trim().toLowerCase();
      const isSameDate = b.tanggal_pelaksanaan === formData.tanggal_pelaksanaan;
      return isPending && isSameRoom && isSameDate;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.ruangan) {
      alert('Mohon masukkan atau pilih Ruangan Rapat.');
      return;
    }
    if (!formData.unit_divisi || !formData.pic || !formData.pic_phone || !formData.agenda) {
      alert('Mohon lengkapi data Unit/Divisi, Nama PIC, No. Telepon / Username Telegram PIC, dan Agenda Kegiatan.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.tanggal_pelaksanaan < todayStr) {
      setConflictError({ message: 'Tanggal pelaksanaan tidak boleh pada tanggal yang sudah lewat.' });
      return;
    }

    if (toMinutes(formData.pukul_mulai) >= toMinutes(formData.pukul_selesai)) {
      setConflictError({ message: 'Jam Selesai harus lebih besar dari Jam Mulai.' });
      return;
    }

    // Pengecekan Bentrok Jadwal Peminjaman (Disetujui mau pun Pending / Menunggu Persetujuan)
    const conflictingBooking = getConflictingBooking(formData.ruangan);

    if (conflictingBooking) {
      setConflictError({
        ruangan: conflictingBooking.ruangan,
        tanggal: conflictingBooking.tanggal_pelaksanaan,
        jam: `Pukul ${conflictingBooking.pukul || conflictingBooking.pukul_mulai + ' - ' + conflictingBooking.pukul_selesai}`,
        agenda: conflictingBooking.agenda,
        divisi: conflictingBooking.unit_divisi,
        status: conflictingBooking.status
      });
      return;
    }

    const newBooking = {
      id: `BK-${Date.now().toString().slice(-6)}`,
      tanggal_konfirmasi: todayStr,
      ...formData,
      lama_hari: 1,
      pemberi_izin: '-',
      status: 'Menunggu Persetujuan'
    };

    onSubmitBooking(newBooking);

    // Reset form ke kondisi kosong bersih untuk pengajuan selanjutnya
    setFormData({
      ruangan: roomList && roomList.length > 0 ? roomList[0].name : '',
      floor: roomList && roomList.length > 0 ? roomList[0].floor : '9',
      tanggal_pelaksanaan: new Date().toISOString().split('T')[0],
      pukul_mulai: '09:00',
      pukul_selesai: '11:00',
      unit_divisi: '',
      pic: '',
      pic_phone: '',
      agenda: '',
      keterangan: ''
    });
    setConflictError(null);

    onClose();
  };

  const selectedRoomApprovedBookings = getApprovedBookingsForRoom(formData.ruangan);
  const selectedRoomPendingBookings = getPendingBookingsForRoom(formData.ruangan);

  return (
    <div className="modal-overlay">
      <div className="modal-container glass-card">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-title)' }}>Form Pengajuan Peminjaman Ruangan</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Telkom Landmark Tower (TLT) Lt. 9, 11, 12</p>
          </div>
          <button 
            onClick={handleAttemptClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Pilih Ruangan Rapat *
            </label>
            {roomList && roomList.length > 0 ? (
              <select
                value={formData.ruangan}
                onChange={handleRoomChange}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              >
                {roomList.map(room => {
                  const conflictBooking = getConflictingBooking(room.name);
                  const isConflict = Boolean(conflictBooking);
                  return (
                    <option key={room.id} value={room.name} disabled={isConflict}>
                      {room.name} (Kapasitas: {room.capacity} Orang)
                    </option>
                  );
                })}
              </select>
            ) : (
              <input 
                type="text"
                placeholder="Contoh: Ruang Rapat Solid 4 Lantai 9"
                value={formData.ruangan}
                onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            )}

            {/* Live Infobox Ketersediaan Jam Ruangan */}
            {selectedRoomApprovedBookings.length > 0 && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#b91c1c', background: 'rgba(224, 0, 0, 0.08)', border: '1px solid rgba(224, 0, 0, 0.25)', padding: '0.4rem 0.625rem', borderRadius: '6px' }}>
                🔒 <strong>Jadwal yang telah disetujui pada tanggal ini:</strong> {selectedRoomApprovedBookings.map(b => b.pukul || `${b.pukul_mulai} - ${b.pukul_selesai}`).join(', ')}. Jam di luar jam tersebut <strong>TETAP BISA diajukan</strong>.
              </div>
            )}

            {selectedRoomPendingBookings.length > 0 && selectedRoomApprovedBookings.length === 0 && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#854d0e', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', padding: '0.4rem 0.625rem', borderRadius: '6px' }}>
                ⏳ <strong>Pengajuan Menunggu Persetujuan:</strong> {selectedRoomPendingBookings.map(b => b.pukul || `${b.pukul_mulai} - ${b.pukul_selesai}`).join(', ')}. Anda <strong>tetap bisa mengajukan</strong> peminjaman.
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Tanggal Pelaksanaan *
              </label>
              <input 
                type="date"
                value={formData.tanggal_pelaksanaan}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, tanggal_pelaksanaan: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Jam Mulai *
              </label>
              <input 
                type="time"
                value={formData.pukul_mulai}
                onChange={(e) => handleTimeChange('pukul_mulai', e)}
                onBlur={(e) => {
                  if (e.target.value && e.target.value.length === 5) {
                    e.target.blur();
                  }
                }}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Jam Selesai *
              </label>
              <input 
                type="time"
                value={formData.pukul_selesai}
                onChange={(e) => handleTimeChange('pukul_selesai', e)}
                onBlur={(e) => {
                  if (e.target.value && e.target.value.length === 5) {
                    e.target.blur();
                  }
                }}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Unit / Divisi Pemohon *
              </label>
              <input 
                type="text"
                placeholder="Contoh: Shared Service & General Support"
                value={formData.unit_divisi}
                onChange={(e) => setFormData({ ...formData, unit_divisi: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Nama PIC Pemohon *
              </label>
              <input 
                type="text"
                placeholder="Nama Penanggung Jawab"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
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
              No. Telepon / Username Telegram PIC *
            </label>
            <input 
              type="text"
              placeholder="Contoh: 08123456789 atau @username_telegram"
              value={formData.pic_phone}
              onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Agenda / Topik Rapat *
            </label>
            <textarea 
              rows={2}
              placeholder="Jelaskan secara ringkas agenda kegiatan rapat..."
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Keterangan / Kebutuhan Tambahan
            </label>
            <input 
              type="text"
              placeholder="Contoh: Perlu tambahan microphones, video conference setup..."
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Banner Notifikasi Peringatan Bentrok Dipindah ke Bawah (Sebelum Tombol Kirim) */}
          {conflictError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              padding: '0.875rem 1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <AlertTriangle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem', flexWrap: 'wrap', gap: '0.375rem' }}>
                  <strong style={{ color: '#dc2626', fontSize: '0.875rem' }}>
                    Peminjaman Ditolak Sistem - Jadwal Bentrok
                  </strong>
                  {conflictError.status && (
                    <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#fef9c3', color: '#854d0e', fontWeight: 700, border: '1px solid rgba(234, 179, 8, 0.4)' }}>
                      STATUS: {conflictError.status.toUpperCase()}
                    </span>
                  )}
                </div>

                {conflictError.ruangan ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem', background: 'var(--input-bg)', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={13} color="var(--primary-red)" /> 
                      <span><strong>Ruangan:</strong> {conflictError.ruangan}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={13} color="#0284c7" /> 
                      <span><strong>Tanggal & Jam:</strong> {conflictError.tanggal} ({conflictError.jam})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={13} color="#16a34a" /> 
                      <span><strong>Agenda Terdaftar:</strong> "{conflictError.agenda}" ({conflictError.divisi})</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#dc2626', fontWeight: 600 }}>{conflictError.message || conflictError}</p>
                )}

                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.5rem 0 0 0' }}>
                  💡 Silakan ubah Jam Pelaksanaan atau pilih Ruangan Rapat lain yang masih kosong.
                </p>
              </div>
            </div>
          )}

          {/* Alert Peringatan Jadwal EVP */}
          <div style={{
            background: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.28)',
            borderRadius: '10px',
            padding: '0.625rem 0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            fontSize: '0.78125rem',
            color: 'var(--text-main)',
            marginTop: '0.25rem'
          }}>
            <AlertTriangle size={18} style={{ color: '#ca8a04', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#ca8a04' }}>Catatan Penting:</strong> Permohonan peminjaman ruangan ini bersifat sementara dan dapat disesuaikan atau diubah sewaktu-waktu mengikuti agenda kegiatan <strong>Executive Vice President</strong>.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <button type="button" onClick={handleAttemptClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Kirim Pengajuan
            </button>
          </div>

        </form>

        {showCancelConfirm && (
          <div className="modal-overlay" style={{ zIndex: 1200 }}>
            <div className="modal-container glass-card" style={{ maxWidth: '380px', width: '90%', padding: '1.25rem', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem auto' }}>
                <AlertTriangle size={24} color="#dc2626" />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '0.5rem' }}>
                Apakah Anda yakin ingin membatalkan?
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                Data pengajuan peminjaman ruangan yang telah diisi akan hilang dan tidak disimpan.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.8125rem', padding: '0.45rem' }}
                >
                  Lanjutkan Pengajuan
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '0.8125rem', padding: '0.45rem', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
                >
                  Ya, Batalkan
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
