import fs from 'fs';
import path from 'path';

const backupFilePath = path.resolve('src/data/supabase_history_backup.json');
const rawData = fs.readFileSync(backupFilePath, 'utf-8');
const backup = JSON.parse(rawData);

const { rooms, bookings } = backup;

console.log(`Processing ${rooms.length} rooms and ${bookings.length} bookings...`);

// 1. Generate updated mockData.js
const mockDataContent = `// Data Fasilitas Ruangan & Riwayat Booking Resmi Telkom Landmark Tower (Disinkronkan 100% dari Supabase)
export const MOCK_ROOMS = ${JSON.stringify(rooms, null, 2)};

export const INITIAL_BOOKINGS = ${JSON.stringify(bookings, null, 2)};
`;

fs.writeFileSync(path.resolve('src/modules/tlt-space-hub/data/mockData.js'), mockDataContent, 'utf-8');
console.log('✅ src/modules/tlt-space-hub/data/mockData.js updated with 43 real bookings!');

// 2. Generate SQL Seed statements for database_schema.sql
let sqlContent = `-- ===================================================================
-- SKEMA & DATA AWAL SMART GS PORTAL - PT TELKOM REGIONAL 3
-- ===================================================================

-- 1. TABEL USERS (Sinkronisasi Profil Keycloak / Google)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    nik VARCHAR(50),
    unit_kerja VARCHAR(100) DEFAULT 'General Support Telkom',
    phone_number VARCHAR(50),
    role VARCHAR(50) DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_keycloak_id ON public.users(keycloak_id);

-- 2. TABEL ROOMS (Fasilitas & Ruangan TLT Space Hub)
CREATE TABLE IF NOT EXISTS public.rooms (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    floor VARCHAR(50),
    capacity INTEGER DEFAULT 0,
    facilities TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    image TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL BOOKINGS (Riwayat Peminjaman Ruangan TLT Space Hub)
CREATE TABLE IF NOT EXISTS public.bookings (
    id VARCHAR(100) PRIMARY KEY,
    room_id VARCHAR(100),
    ruangan VARCHAR(255) NOT NULL,
    floor VARCHAR(50),
    tanggal_konfirmasi DATE,
    tanggal_pelaksanaan DATE NOT NULL,
    lama_hari INTEGER DEFAULT 1,
    pukul_mulai TIME NOT NULL,
    pukul_selesai TIME NOT NULL,
    unit_divisi VARCHAR(100),
    pic VARCHAR(255) NOT NULL,
    pic_phone VARCHAR(50),
    agenda TEXT NOT NULL,
    pemberi_izin VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending',
    keterangan TEXT,
    nota_dinas_url TEXT,
    nota_dinas_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(tanggal_pelaksanaan);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- ===================================================================
-- DATA SEED (MIGRASI 100% RUANGAN & 43 RIWAYAT PEMINJAMAN)
-- ===================================================================

`;

// Insert Rooms
rooms.forEach(r => {
  const escFacilities = (r.facilities || []).map(f => `"${f.replace(/"/g, '\\"')}"`).join(',');
  const escDesc = (r.description || '').replace(/'/g, "''");
  const escName = (r.name || '').replace(/'/g, "''");
  const escImg = (r.image || '').replace(/'/g, "''");
  sqlContent += `INSERT INTO public.rooms (id, name, floor, capacity, facilities, is_active, image, description)
VALUES ('${r.id}', '${escName}', '${r.floor}', ${r.capacity || 0}, '{${escFacilities}}', true, '${escImg}', '${escDesc}')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, capacity = EXCLUDED.capacity, image = EXCLUDED.image;\n`;
});

sqlContent += '\n-- RIWAYAT BOOKINGS LAMA\n';

// Insert Bookings
bookings.forEach(b => {
  const escId = (b.id || `BK-${Math.floor(Math.random()*900000+100000)}`).replace(/'/g, "''");
  const escRuangan = (b.ruangan || '').replace(/'/g, "''");
  const escFloor = (b.floor || '9').replace(/'/g, "''");
  const escTglKonfirmasi = b.tanggal_konfirmasi ? `'${b.tanggal_konfirmasi}'` : 'NULL';
  const escTglPelaksanaan = b.tanggal_pelaksanaan ? `'${b.tanggal_pelaksanaan}'` : `'${new Date().toISOString().split('T')[0]}'`;
  const escLamaHari = b.lama_hari || 1;
  const escMulai = (b.pukul_mulai || '08:00').replace(/'/g, "''");
  const escSelesai = (b.pukul_selesai || '17:00').replace(/'/g, "''");
  const escUnit = (b.unit_divisi || '').replace(/'/g, "''");
  const escPic = (b.pic || '').replace(/'/g, "''");
  const escPicPhone = (b.pic_phone || '').replace(/'/g, "''");
  const escAgenda = (b.agenda || '').replace(/'/g, "''");
  const escIzin = (b.pemberi_izin || '').replace(/'/g, "''");
  const escStatus = (b.status || 'Disetujui').replace(/'/g, "''");
  const escKet = (b.keterangan || '').replace(/'/g, "''");
  const escNotaUrl = (b.nota_dinas_url || '').replace(/'/g, "''");
  const escNotaName = (b.nota_dinas_name || '').replace(/'/g, "''");

  sqlContent += `INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('${escId}', '${escRuangan}', '${escFloor}', ${escTglKonfirmasi}, ${escTglPelaksanaan}, ${escLamaHari}, '${escMulai}', '${escSelesai}', '${escUnit}', '${escPic}', '${escPicPhone}', '${escAgenda}', '${escIzin}', '${escStatus}', '${escKet}', '${escNotaUrl}', '${escNotaName}')
ON CONFLICT (id) DO NOTHING;\n`;
});

fs.writeFileSync(path.resolve('scripts/database_schema.sql'), sqlContent, 'utf-8');
console.log('✅ scripts/database_schema.sql generated with full migration seeds!');
