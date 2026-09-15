import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, Building2, UploadCloud, Loader2, RefreshCw, Trash2, Crop } from 'lucide-react';
import { uploadRoomPhotoToSupabase } from '../lib/supabase';
import ImageCropperModal from './ImageCropperModal';

export default function AddRoomModal({ isOpen, onClose, onAddRoom, onSaveRoom, onRequestDeleteRoom, roomToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    floor: '9',
    capacity: 20,
    facilitiesText: '',
    image: '',
    description: ''
  });

  const [rawImageSrc, setRawImageSrc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [cropperState, setCropperState] = useState({
    isOpen: false,
    imageSrc: ''
  });

  useEffect(() => {
    if (roomToEdit) {
      const initialImg = roomToEdit.image || '';
      setFormData({
        name: roomToEdit.name || '',
        floor: roomToEdit.floor || '9',
        capacity: roomToEdit.capacity || 20,
        facilitiesText: Array.isArray(roomToEdit.facilities) ? roomToEdit.facilities.join(', ') : '',
        image: initialImg,
        description: roomToEdit.description || ''
      });
      setRawImageSrc(initialImg);
    } else {
      setFormData({
        name: '',
        floor: '9',
        capacity: 20,
        facilitiesText: '',
        image: '',
        description: ''
      });
      setRawImageSrc('');
    }
    setIsUploading(false);
    setIsDragging(false);
  }, [roomToEdit, isOpen]);

  if (!isOpen) return null;

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const originalFullImage = reader.result;
      setRawImageSrc(originalFullImage);
      setCropperState({
        isOpen: true,
        imageSrc: originalFullImage
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedDataUrl) => {
    setIsUploading(true);
    try {
      const res = await fetch(croppedDataUrl);
      const blob = await res.blob();
      const croppedFile = new File([blob], `room_cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });

      const publicUrl = await uploadRoomPhotoToSupabase(croppedFile);
      if (publicUrl) {
        setFormData(prev => ({ ...prev, image: publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, image: croppedDataUrl }));
      }
    } catch (err) {
      console.warn('Fallback to cropped base64:', err);
      setFormData(prev => ({ ...prev, image: croppedDataUrl }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleResetPhoto = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setRawImageSrc('');
    setIsUploading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.capacity || !formData.description) {
      alert('Mohon lengkapi Nama Ruangan, Kapasitas, dan Deskripsi Ruangan.');
      return;
    }

    const facilitiesArray = formData.facilitiesText
      ? formData.facilitiesText.split(',').map(item => item.trim()).filter(item => item.length > 0)
      : [];

    const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800';

    const roomData = {
      id: roomToEdit ? roomToEdit.id : `room-custom-${Date.now().toString().slice(-6)}`,
      name: formData.name,
      floor: formData.floor,
      capacity: parseInt(formData.capacity, 10) || 10,
      facilities: facilitiesArray,
      image: formData.image || defaultImage,
      description: formData.description
    };

    if (roomToEdit && onSaveRoom) {
      onSaveRoom(roomData);
    } else if (onAddRoom) {
      onAddRoom(roomData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (onRequestDeleteRoom && roomToEdit) {
      onRequestDeleteRoom(roomToEdit);
      onClose();
    }
  };

  return (
    <>
      <ImageCropperModal
        isOpen={cropperState.isOpen}
        onClose={() => setCropperState({ isOpen: false, imageSrc: '' })}
        imageSrc={cropperState.imageSrc}
        onCropComplete={handleCropComplete}
      />

      <div className="modal-overlay">
        <div className="modal-container glass-card" style={{ maxWidth: '580px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {roomToEdit ? <Edit3 size={22} color="#16a34a" /> : <Building2 size={22} color="#e00000" />}
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-title)' }}>
                {roomToEdit ? 'Edit Informasi Ruangan TLT' : 'Tambah Ruangan Rapat Baru (Admin GS)'}
              </h3>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Nama Ruangan Rapat *
              </label>
              <input 
                type="text"
                placeholder="Contoh: Ruang Rapat Innovate Lt. 9"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                  Lokasi Lantai *
                </label>
                <select
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
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
                >
                  <option value="9">Lantai 9</option>
                  <option value="11">Lantai 11</option>
                  <option value="12">Lantai 12</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                  Kapasitas (Orang) *
                </label>
                <input 
                  type="number"
                  min="2"
                  max="200"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
                Foto Ruangan Rapat
              </label>
              
              {formData.image ? (
                <div style={{ position: 'relative', width: '100%', height: '190px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <img 
                    src={formData.image} 
                    alt="Foto Ruangan Rapat" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setCropperState({ isOpen: true, imageSrc: rawImageSrc || formData.image })}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '0.4rem 0.75rem', 
                        fontSize: '0.75rem', 
                        background: 'rgba(0, 0, 0, 0.75)', 
                        backdropFilter: 'blur(6px)', 
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        gap: '0.35rem'
                      }}
                    >
                      <Crop size={13} /> Crop / Atur Posisi
                    </button>
                    <button 
                      type="button" 
                      onClick={handleResetPhoto}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '0.4rem 0.75rem', 
                        fontSize: '0.75rem', 
                        background: 'rgba(239, 68, 68, 0.85)', 
                        backdropFilter: 'blur(6px)', 
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        gap: '0.35rem'
                      }}
                    >
                      <RefreshCw size={13} /> Ganti Foto
                    </button>
                  </div>
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(22, 163, 74, 0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    ✓ Foto Terpasang
                  </div>
                </div>
              ) : (
                <label 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justify: 'center',
                    padding: '1.75rem 1rem',
                    border: isDragging ? '2px dashed #16a34a' : '2px dashed var(--input-border)',
                    borderRadius: '12px',
                    background: isDragging ? 'rgba(34, 197, 94, 0.1)' : 'var(--input-bg)',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    transform: isDragging ? 'scale(1.01)' : 'scale(1)'
                  }}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />
                  
                  {isUploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7' }}>
                      <Loader2 size={22} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Memproses & Mengunggah Foto...</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <UploadCloud size={32} color={isDragging ? '#16a34a' : 'var(--primary-red)'} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Tarik & Taruh (Drag & Drop) Foto di Sini
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        atau <u style={{ color: 'var(--primary-red)' }}>klik untuk memilih file</u> dari laptop (JPG, PNG, WEBP)
                      </span>
                    </div>
                  )}
                </label>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Daftar Fasilitas (Opsional - Pisahkan dengan Koma)
              </label>
              <input 
                type="text"
                placeholder='Contoh: Smart Display LED 75", High-Speed WiFi, Executive Seating (Biarkan kosong jika tidak ada)'
                value={formData.facilitiesText}
                onChange={(e) => setFormData({ ...formData, facilitiesText: e.target.value })}
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
                Deskripsi Ruangan *
              </label>
              <textarea 
                rows={3}
                placeholder="Jelaskan peruntukan & spesifikasi ruangan ini..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
              {roomToEdit ? (
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  className="btn btn-danger"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
                >
                  <Trash2 size={15} /> Hapus Ruangan
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isUploading} className="btn btn-primary">
                  {roomToEdit ? (
                    <>
                      <Edit3 size={16} /> Simpan Perubahan
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Simpan Ruangan Baru
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </>
  );
}
