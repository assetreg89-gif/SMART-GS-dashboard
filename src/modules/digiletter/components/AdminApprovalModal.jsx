import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { TAKAH_OPTIONS, KODE_PERIHAL_OPTIONS, SPESIFIKASI_SURAT_OPTIONS, generateLetterNumber } from '../utils/letterHelper';

export default function AdminApprovalModal({ isOpen, onClose, letter, nextAgendaNo, onConfirmApprove }) {
  const [selectedTakah, setSelectedTakah] = useState(TAKAH_OPTIONS[0]);
  const [selectedKodePerihal, setSelectedKodePerihal] = useState(KODE_PERIHAL_OPTIONS[0]);
  const [selectedSpesifikasi, setSelectedSpesifikasi] = useState(SPESIFIKASI_SURAT_OPTIONS[0].value);
  const [selectedStatus, setSelectedStatus] = useState('Disetujui');
  const [keteranganAdmin, setKeteranganAdmin] = useState('');
  const [previewNumber, setPreviewNumber] = useState('');

  useEffect(() => {
    if (letter) {
      const takahToUse = letter.takah && letter.takah !== '-' ? letter.takah : TAKAH_OPTIONS[0];
      const kodeToUse = letter.kode_perihal || KODE_PERIHAL_OPTIONS[0];
      const spesifikasiToUse = letter.spesifikasi_surat || (letter.jenis_surat === 'KONTRAK' ? 'K.TEL' : 'TEL');
      const agendaToUse = letter.no_agenda || nextAgendaNo;

      setSelectedTakah(takahToUse);
      setSelectedKodePerihal(kodeToUse);
      setSelectedSpesifikasi(spesifikasiToUse);
      setSelectedStatus(letter.status === 'Disetujui' ? 'Disetujui' : 'Disetujui'); // Default to Approve
      setKeteranganAdmin(letter.keterangan || '');

      const generated = generateLetterNumber(
        spesifikasiToUse,
        agendaToUse,
        kodeToUse,
        takahToUse
      );
      setPreviewNumber(generated);
    }
  }, [letter, nextAgendaNo, isOpen]);

  useEffect(() => {
    if (letter) {
      const agendaToUse = letter.no_agenda || nextAgendaNo;
      const generated = generateLetterNumber(
        selectedSpesifikasi,
        agendaToUse,
        selectedKodePerihal,
        selectedTakah
      );
      setPreviewNumber(generated);
    }
  }, [selectedSpesifikasi, selectedKodePerihal, selectedTakah, letter, nextAgendaNo]);

  if (!isOpen || !letter) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const agendaToAssign = letter.no_agenda || nextAgendaNo;

    // Pastikan nomor surat tidak pernah '-' jika status Disetujui
    const generatedNum = generateLetterNumber(
      selectedSpesifikasi,
      agendaToAssign,
      selectedKodePerihal,
      selectedTakah
    );
    const finalNomorSurat = selectedStatus === 'Disetujui' ? generatedNum : '-';

    onConfirmApprove({
      ...letter,
      id: letter.id || `REQ-${Date.now()}`,
      no_agenda: selectedStatus === 'Disetujui' ? agendaToAssign : letter.no_agenda,
      takah: selectedStatus === 'Disetujui' ? selectedTakah : '-',
      kode_perihal: selectedKodePerihal,
      spesifikasi_surat: selectedSpesifikasi,
      nomor_surat: finalNomorSurat,
      status: selectedStatus,
      keterangan: keteranganAdmin || 'Nomor surat disetujui & diterbitkan'
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', borderRadius: '10px' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)', margin: 0 }}>
                Verifikasi & Generasi Nomor Surat
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Sekretariat Divisi Telkom Regional 3
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

        {/* Ringkasan Detail Pengajuan */}
        <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid var(--input-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Pemohon / PIC:</span>
            <div style={{ fontWeight: 700, color: 'var(--text-title)' }}>{letter.pic} ({letter.no_pic})</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Jenis Surat:</span>
            <div style={{ fontWeight: 700, color: 'var(--text-title)' }}>{letter.jenis_surat}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Kepada:</span>
            <div style={{ fontWeight: 700, color: 'var(--text-title)' }}>{letter.kepada}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Tanggal TTD / Agenda:</span>
            <div style={{ fontWeight: 700, color: '#0369a1' }}>{letter.tanggal_ttd || letter.tanggal_pengajuan}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: 'var(--text-muted)' }}>Perihal:</span>
            <div style={{ fontWeight: 600, color: 'var(--text-title)' }}>{letter.perihal}</div>
          </div>
        </div>

        {/* Form Verifikasi Admin */}
        <form onSubmit={handleSave}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Status Verifikasi</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)} 
                className="form-select"
              >
                <option value="Disetujui">Approve (Setujui & Terbitkan)</option>
                <option value="Menunggu Persetujuan">Pending (Menunggu)</option>
                <option value="Dibatalkan">Reject / Batalkan</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pilih Takah (Format Sekdiv)</label>
              <select 
                value={selectedTakah} 
                onChange={(e) => setSelectedTakah(e.target.value)} 
                disabled={selectedStatus !== 'Disetujui'}
                className="form-select"
              >
                {TAKAH_OPTIONS.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Kode Perihal</label>
              <select 
                value={selectedKodePerihal} 
                onChange={(e) => setSelectedKodePerihal(e.target.value)} 
                disabled={selectedStatus !== 'Disetujui'}
                className="form-select"
              >
                {KODE_PERIHAL_OPTIONS.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Spesifikasi Surat</label>
              <select 
                value={selectedSpesifikasi} 
                onChange={(e) => setSelectedSpesifikasi(e.target.value)} 
                disabled={selectedStatus !== 'Disetujui'}
                className="form-select"
              >
                {SPESIFIKASI_SURAT_OPTIONS.map((item, idx) => (
                  <option key={idx} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Preview Box Nomor Surat */}
          {selectedStatus === 'Disetujui' && (
            <div style={{ background: 'rgba(224, 0, 0, 0.06)', border: '1px solid rgba(224, 0, 0, 0.25)', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-red)', fontWeight: 700, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Preview Nomor Surat Tergenerate Otomatis:
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-red)', wordBreak: 'break-all' }}>
                {previewNumber}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>
                  No. Slot / Agenda tersistem: <strong>#{letter.no_agenda || nextAgendaNo}</strong>
                </span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Catatan Admin Sekdiv (Keterangan)</label>
            <input 
              type="text" 
              placeholder="Misal: Nomor terbit, fisik dikirim via kurir..." 
              value={keteranganAdmin} 
              onChange={(e) => setKeteranganAdmin(e.target.value)} 
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
              <CheckCircle2 size={16} />
              Simpan & Terbitkan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
