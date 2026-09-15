import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { JENIS_SURAT_OPTIONS, KODE_PERIHAL_OPTIONS, SPESIFIKASI_SURAT_OPTIONS } from '../utils/letterHelper';

export default function RequestLetterModal({ isOpen, onClose, onSubmitRequest, editData = null }) {
  const [formData, setFormData] = useState({
    tanggal_pengajuan: new Date().toISOString().split('T')[0],
    tanggal_ttd: new Date().toISOString().split('T')[0],
    jenis_surat: JENIS_SURAT_OPTIONS[0],
    kode_perihal: KODE_PERIHAL_OPTIONS[0],
    spesifikasi_surat: SPESIFIKASI_SURAT_OPTIONS[0].value,
    kepada: '',
    perihal: '',
    pic: '',
    no_pic: '',
    keterangan: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        tanggal_pengajuan: editData.tanggal_pengajuan || new Date().toISOString().split('T')[0],
        tanggal_ttd: editData.tanggal_ttd || new Date().toISOString().split('T')[0],
        jenis_surat: editData.jenis_surat || JENIS_SURAT_OPTIONS[0],
        kode_perihal: editData.kode_perihal || KODE_PERIHAL_OPTIONS[0],
        spesifikasi_surat: editData.spesifikasi_surat || SPESIFIKASI_SURAT_OPTIONS[0].value,
        kepada: editData.kepada || '',
        perihal: editData.perihal || '',
        pic: editData.pic || '',
        no_pic: editData.no_pic || '',
        keterangan: editData.keterangan || ''
      });
    } else {
      setFormData({
        tanggal_pengajuan: new Date().toISOString().split('T')[0],
        tanggal_ttd: new Date().toISOString().split('T')[0],
        jenis_surat: JENIS_SURAT_OPTIONS[0],
        kode_perihal: KODE_PERIHAL_OPTIONS[0],
        spesifikasi_surat: SPESIFIKASI_SURAT_OPTIONS[0].value,
        kepada: '',
        perihal: '',
        pic: '',
        no_pic: '',
        keterangan: ''
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Otomatis ubah field 'kepada' menjadi CAPSLOCK (Uppercase)
    const finalValue = name === 'kepada' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.tanggal_pengajuan) newErrors.tanggal_pengajuan = 'Tanggal Pengajuan wajib diisi';
    if (!formData.tanggal_ttd) newErrors.tanggal_ttd = 'Tanggal TTD wajib diisi';
    if (!formData.jenis_surat) newErrors.jenis_surat = 'Jenis Surat wajib dipilih';
    if (!formData.kode_perihal) newErrors.kode_perihal = 'Kode Perihal wajib dipilih';
    if (!formData.spesifikasi_surat) newErrors.spesifikasi_surat = 'Spesifikasi Surat wajib dipilih';
    if (!formData.kepada.trim()) newErrors.kepada = 'Tujuan (Kepada) wajib diisi';
    if (!formData.perihal.trim()) newErrors.perihal = 'Perihal wajib diisi';
    if (!formData.pic.trim()) newErrors.pic = 'Nama PIC wajib diisi';
    if (!formData.no_pic.trim()) newErrors.no_pic = 'No. PIC / Username Telegram wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmitRequest({
      ...formData,
      id: editData ? editData.id : `REQ-${Date.now()}`
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid var(--card-border)' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)', margin: 0 }}>
              {editData ? 'Edit Pengajuan Surat' : 'Form Pengajuan Nomor Surat'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Sekretariat Divisi Telkom Regional 3
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tanggal Pengajuan <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="date" 
                name="tanggal_pengajuan" 
                value={formData.tanggal_pengajuan} 
                onChange={handleChange} 
                className="form-input"
              />
              {errors.tanggal_pengajuan && <span style={{ fontSize: '0.75rem', color: 'red' }}>{errors.tanggal_pengajuan}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal TTD (EVP) <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="date" 
                name="tanggal_ttd" 
                value={formData.tanggal_ttd} 
                onChange={handleChange} 
                className="form-input"
              />
              {errors.tanggal_ttd && <span style={{ fontSize: '0.75rem', color: 'red' }}>{errors.tanggal_ttd}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Jenis Surat <span style={{ color: 'red' }}>*</span></label>
              <select 
                name="jenis_surat" 
                value={formData.jenis_surat} 
                onChange={handleChange} 
                className="form-select"
              >
                {JENIS_SURAT_OPTIONS.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
              {errors.jenis_surat && <span style={{ fontSize: '0.75rem', color: 'red' }}>{errors.jenis_surat}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Kode Perihal <span style={{ color: 'red' }}>*</span></label>
              <select 
                name="kode_perihal" 
                value={formData.kode_perihal} 
                onChange={handleChange} 
                className="form-select"
              >
                {KODE_PERIHAL_OPTIONS.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
              {errors.kode_perihal && <span style={{ fontSize: '0.75rem', color: 'red' }}>{errors.kode_perihal}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Spesifikasi Surat <span style={{ color: 'red' }}>*</span></label>
            <select 
              name="spesifikasi_surat" 
              value={formData.spesifikasi_surat} 
              onChange={handleChange} 
              className="form-select"
            >
              {SPESIFIKASI_SURAT_OPTIONS.map((item, idx) => (
                <option key={idx} value={item.value}>{item.label}</option>
              ))}
            </select>
            {errors.spesifikasi_surat && <span style={{ fontSize: '0.75rem', color: 'red' }}>{errors.spesifikasi_surat}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Kepada (Tujuan Surat) <span style={{ color: 'red' }}>*</span></label>
            <input 
              type="text" 
              name="kepada" 
              placeholder="Contoh: PT Telekomunikasi Selular / GM Network Operation" 
              value={formData.kepada} 
              onChange={handleChange} 
              className="form-input"
            />
            {errors.kepada && <span style={{ fontSize: '0.75rem', color: 'red' }}>{errors.kepada}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Perihal <span style={{ color: 'red' }}>*</span></label>
            <textarea 
              name="perihal" 
              rows="3" 
              placeholder="Jelaskan isi perihal surat secara singkat dan jelas..." 
              value={formData.perihal} 
              onChange={handleChange} 
              className="form-textarea"
            />
            {errors.perihal && <span style={{ fontSize: '0.75rem', color: 'red' }}>{errors.perihal}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">PIC (Pemohon) <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                name="pic" 
                placeholder="Nama Lengkap Pemohon" 
                value={formData.pic} 
                onChange={handleChange} 
                className="form-input"
              />
              {errors.pic && <span style={{ fontSize: '0.75rem', color: 'red' }}>{errors.pic}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">No. PIC / Telegram <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                name="no_pic" 
                placeholder="Contoh: 081234567890 / @username" 
                value={formData.no_pic} 
                onChange={handleChange} 
                className="form-input"
              />
              {errors.no_pic && <span style={{ fontSize: '0.75rem', color: 'red' }}>{errors.no_pic}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Keterangan (Opsional)</label>
            <input 
              type="text" 
              name="keterangan" 
              placeholder="Catatan tambahan untuk Sekretariat..." 
              value={formData.keterangan} 
              onChange={handleChange} 
              className="form-input"
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              <Send size={16} />
              {editData ? 'Simpan Perubahan' : 'Kirim Pengajuan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
