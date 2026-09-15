import React, { useState } from 'react';
import { Users, CheckCircle, Calendar, PlusCircle, Edit3, Building2, Trash2 } from 'lucide-react';

export default function RoomCatalog({ rooms, isAdmin, onOpenAddRoomModal, onSelectRoomForEdit, onRequestDeleteRoom, onSelectRoomForBooking }) {
  const [selectedFloor, setSelectedFloor] = useState('ALL');

  const filteredRooms = selectedFloor === 'ALL'
    ? rooms
    : rooms.filter(r => r.floor === selectedFloor);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-title)' }}>
              Katalog Fasilitas Ruang Rapat TLT
            </h2>
            {isAdmin && (
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', fontWeight: 600, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                Mode Pengelolaan Admin GS
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Daftar ruangan rapat yang tersedia di Telkom Landmark Tower Lantai 9, Lantai 11, dan Lantai 12.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isAdmin && (
            <button
              onClick={onOpenAddRoomModal}
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)' }}
            >
              <PlusCircle size={16} /> Tambah Ruangan Baru
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.375rem', borderRadius: '10px', border: '1px solid var(--input-border)' }}>
            {['ALL', '9', '11', '12'].map(fl => (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                style={{
                  padding: '0.45rem 0.875rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedFloor === fl ? 'var(--primary-red)' : 'transparent',
                  color: selectedFloor === fl ? '#ffffff' : 'var(--text-main)',
                  fontSize: '0.8125rem',
                  fontWeight: selectedFloor === fl ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {fl === 'ALL' ? 'Semua Lantai' : `Lantai ${fl}`}
              </button>
            ))}
          </div>
        </div>

      </div>

      {filteredRooms.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Building2 size={42} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '0.375rem' }}>
              Belum Ada Katalog Ruangan Rapat
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '480px' }}>
              {isAdmin
                ? 'Klik tombol "Tambah Ruangan Baru" di bagian atas untuk mulai menambahkan fasilitas ruangan ke dalam katalog.'
                : 'Belum ada fasilitas ruangan yang ditambahkan ke dalam katalog. Silakan hubungi Admin GS TLT.'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={onOpenAddRoomModal}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
            >
              <PlusCircle size={16} /> Tambah Ruangan Baru
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filteredRooms.map(room => (
            <div key={room.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

              <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={room.image}
                  alt={room.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  Lantai {room.floor}
                </div>
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(224, 0, 0, 0.85)', backdropFilter: 'blur(4px)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Users size={14} /> Kapasitas: {room.capacity} Orang
                </div>
              </div>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-title)' }}>
                      {room.name}
                    </h3>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                        <button
                          onClick={() => onSelectRoomForEdit(room)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', gap: '0.2rem' }}
                          title="Edit Detail Ruangan"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => onRequestDeleteRoom(room)}
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                          title="Hapus Ruangan dari Katalog"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
                    {room.description}
                  </p>

                  {Array.isArray(room.facilities) && room.facilities.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                        Fasilitas Ruangan:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {room.facilities.map((fac, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '6px',
                              background: 'var(--input-bg)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--input-border)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <CheckCircle size={12} color="#16a34a" /> {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelectRoomForBooking(room.name)}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.875rem', background: 'linear-gradient(135deg, var(--primary-red) 0%, #b30000 100%)' }}
                >
                  <Calendar size={16} /> Ajukan Peminjaman Ruangan Ini
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
