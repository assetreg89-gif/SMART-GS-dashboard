import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, RotateCcw, XCircle, Clock, Trash2, Edit3, CheckSquare, FileText, UploadCloud, Eye, Loader2, FileCheck } from 'lucide-react';
import { uploadNotaDinasToSupabase } from '../lib/supabase';

export default function AdminApprovalModal({ isOpen, onClose, booking, onSaveApproval, onRequestDeleteBooking }) {
  const [formData, setFormData] = useState({
    status: 'Unggah Nota Dinas',
    pemberi_izin: 'Bertha (Admin GS)',
    keterangan: '',
    ruangan: '',
    tanggal_pelaksanaan: '',
    pukul_mulai: '',
    pukul_selesai: '',
    unit_divisi: '',
    pic: '',
    agenda: '',
    nota_dinas_url: '',
    nota_dinas_name: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState({ isOpen: false, url: '', name: '' });

  const isImageFile = (url, name) => {
    const str = ((name || '') + ' ' + (url || '')).toLowerCase();
    return str.includes('.png') || str.includes('.jpg') || str.includes('.jpeg') || str.includes('.webp') || str.includes('.gif') || str.startsWith('data:image/');
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

  useEffect(() => {
    if (booking) {
      // Normalisasi status ke Bahasa Indonesia jika data lama masih menggunakan bahasa Inggris
      let currentStatus = booking.status || 'Unggah Nota Dinas';
      if (currentStatus === 'Disetujui - Unggah Nota Dinas') currentStatus = 'Unggah Nota Dinas';
      if (currentStatus === 'Approved') currentStatus = 'Disetujui';
      if (currentStatus === 'Booking / TU') currentStatus = 'Menunggu Persetujuan';
      if (currentStatus === 'Done') currentStatus = 'Selesai';
      if (currentStatus === 'Reschedule') currentStatus = 'Jadwal Ulang';
      if (currentStatus === 'Tidak Jadi') currentStatus = 'Dibatalkan';

      setFormData({
        status: currentStatus,
        pemberi_izin: booking.pemberi_izin && booking.pemberi_izin !== '-' ? booking.pemberi_izin : 'Bertha (Admin GS)',
        keterangan: booking.keterangan || '',
        ruangan: booking.ruangan || '',
        tanggal_pelaksanaan: booking.tanggal_pelaksanaan || '',
        pukul_mulai: booking.pukul_mulai || '',
        pukul_selesai: booking.pukul_selesai || '',
        unit_divisi: booking.unit_divisi || '',
        pic: booking.pic || '',
        agenda: booking.agenda || '',
        nota_dinas_url: booking.nota_dinas_url || '',
        nota_dinas_name: booking.nota_dinas_name || (booking.nota_dinas_url ? 'Nota_Dinas_Peminjaman.pdf' : '')
      });
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadNotaDinasToSupabase(file);
      if (publicUrl) {
        setFormData(prev => ({
          ...prev,
          nota_dinas_url: publicUrl,
          nota_dinas_name: file.name
        }));
      } else {
        const objectUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          nota_dinas_url: objectUrl,
          nota_dinas_name: file.name
        }));
      }
    } catch (err) {
      console.warn('Fallback Nota Dinas URL:', err);
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        nota_dinas_url: objectUrl,
        nota_dinas_name: file.name
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveNota = () => {
    setFormData(prev => ({
      ...prev,
      nota_dinas_url: '',
      nota_dinas_name: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveApproval({
      id: booking.id,
      ...formData
    });
    onClose();
  };

  const handleDelete = () => {
    if (onRequestDeleteBooking && booking) {
      onRequestDeleteBooking(booking);
      onClose();
    }
  };

  const STATUS_OPTIONS = [
    { key: 'Unggah Nota Dinas', label: 'Unggah Nota Dinas', color: '#0369a1', bg: 'var(--status-nota-bg)', icon: FileText },
    { key: 'Disetujui', label: 'Disetujui (Resmi)', color: '#15803d', bg: 'var(--status-approved-bg)', icon: CheckSquare },
    { key: 'Menunggu Persetujuan', label: 'Menunggu Persetujuan', color: '#ca8a04', bg: 'var(--status-pending-bg)', icon: Clock },
    { key: 'Selesai', label: 'Selesai', color: '#166534', bg: 'var(--status-done-bg)', icon: CheckCircle2 },
    { key: 'Jadwal Ulang', label: 'Jadwal Ulang', color: '#1e40af', bg: 'var(--status-reschedule-bg)', icon: RotateCcw },
    { key: 'Dibatalkan', label: 'Dibatalkan', color: '#dc2626', bg: 'var(--status-cancel-bg)', icon: XCircle }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container glass-card" style={{ maxWidth: '620px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="#16a34a" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-title)' }}>Peninjauan & Status Pengajuan (Admin GS)</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Status Persetujuan Rapat *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {STATUS_OPTIONS.map(st => {
                const IconComp = st.icon;
                const isSelected = formData.status === st.key;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: st.key })}
                    style={{
                      padding: '0.625rem 0.75rem',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${st.color}` : '1px solid var(--input-border)',
                      background: isSelected ? st.bg : 'var(--input-bg)',
                      color: isSelected ? st.color : 'var(--text-main)',
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <IconComp size={16} />
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bagian Pengelolaan File Nota Dinas */}
          <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '0.5rem' }}>
              <FileCheck size={16} color="#0284c7" /> Dokumen Nota Dinas (Wajib untuk Disetujui)
            </label>

            {formData.nota_dinas_url ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', background: 'var(--card-bg)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="#0284c7" />
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                      {formData.nota_dinas_name || 'Dokumen_Nota_Dinas.pdf'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
                      ✓ Berkas Nota Dinas Terunggah
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <a 
                    href={formData.nota_dinas_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => handleViewNotaDinas(formData.nota_dinas_url, formData.nota_dinas_name, e)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.25rem', cursor: 'pointer' }}
                    title="Lihat Pratinjau / Unduh Berkas Nota Dinas"
                  >
                    <Eye size={13} /> Lihat Nota Dinas
                  </a>

                  <button 
                    type="button" 
                    onClick={handleRemoveNota}
                    className="btn btn-danger"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                    title="Hapus Berkas Nota Dinas"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '0.625rem',
                padding: '0.875rem',
                border: '2px dashed var(--input-border)',
                borderRadius: '8px',
                background: 'var(--card-bg)',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                textAlign: 'center'
              }}>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" 
                  onChange={handleFileUpload} 
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
                {isUploading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontSize: '0.8125rem', fontWeight: 600 }}>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Mengunggah Dokumen Nota Dinas...
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.8125rem' }}>
                    <UploadCloud size={20} color="#0284c7" />
                    <span>Unggah Berkas Nota Dinas (PDF, Gambar, Word)</span>
                  </div>
                )}
              </label>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Agenda Kegiatan *
              </label>
              <input 
                type="text"
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
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
                Nama Ruangan *
              </label>
              <input 
                type="text"
                value={formData.ruangan}
                onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Tanggal Pelaksanaan
              </label>
              <input 
                type="date"
                value={formData.tanggal_pelaksanaan}
                onChange={(e) => setFormData({ ...formData, tanggal_pelaksanaan: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Jam Mulai
              </label>
              <input 
                type="time"
                value={formData.pukul_mulai}
                onChange={(e) => setFormData({ ...formData, pukul_mulai: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Jam Selesai
              </label>
              <input 
                type="time"
                value={formData.pukul_selesai}
                onChange={(e) => setFormData({ ...formData, pukul_selesai: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                PIC Pemohon
              </label>
              <input 
                type="text"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
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
                Unit / Divisi
              </label>
              <input 
                type="text"
                value={formData.unit_divisi}
                onChange={(e) => setFormData({ ...formData, unit_divisi: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
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
              Nama Pemberi Izin (Admin GS)
            </label>
            <input 
              type="text"
              placeholder="Contoh: Bertha (Admin GS)"
              value={formData.pemberi_izin}
              onChange={(e) => setFormData({ ...formData, pemberi_izin: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
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
              Catatan / Keterangan
            </label>
            <textarea 
              rows={2}
              placeholder="Tuliskan catatan tambahan..."
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <button 
              type="button" 
              onClick={handleDelete} 
              className="btn btn-danger"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
            >
              <Trash2 size={15} /> Hapus Pengajuan
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Batal
              </button>
              <button type="submit" disabled={isUploading} className="btn btn-primary">
                <Edit3 size={15} /> Simpan Perubahan
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Modal Pop-up Pratinjau Dokumen / Gambar Nota Dinas */}
      {previewImageModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1400 }} onClick={() => setPreviewImageModal({ isOpen: false, url: '', name: '' })}>
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
    </div>
  );
}
