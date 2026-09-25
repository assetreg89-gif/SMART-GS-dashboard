-- ===================================================================
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

-- 4. TABEL LETTERS (Manajemen Nomor Surat Digital - DigiLetter Reg 3)
CREATE TABLE IF NOT EXISTS public.letters (
    id VARCHAR(100) PRIMARY KEY,
    tanggal_pengajuan DATE NOT NULL,
    tanggal_ttd DATE NOT NULL,
    jenis_surat VARCHAR(100) NOT NULL,
    kode_perihal VARCHAR(50) DEFAULT 'HK.810',
    spesifikasi_surat VARCHAR(50) DEFAULT 'TEL',
    kepada TEXT NOT NULL,
    nomor_surat VARCHAR(255) DEFAULT '-',
    no_agenda VARCHAR(50),
    perihal TEXT NOT NULL,
    takah VARCHAR(100) DEFAULT '-',
    pic VARCHAR(255) NOT NULL,
    no_pic VARCHAR(100) DEFAULT '-',
    keterangan TEXT,
    status VARCHAR(50) DEFAULT 'Menunggu Persetujuan',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_letters_ttd ON public.letters(tanggal_ttd);
CREATE INDEX IF NOT EXISTS idx_letters_status ON public.letters(status);
CREATE INDEX IF NOT EXISTS idx_letters_agenda ON public.letters(no_agenda);

-- ===================================================================
-- DATA SEED (MIGRASI 100% RUANGAN & 43 RIWAYAT PEMINJAMAN)
-- ===================================================================

INSERT INTO public.rooms (id, name, floor, capacity, facilities, is_active, image, description)
VALUES ('room-lt9-solid4', 'Ruang Rapat Solid 4 Lantai 9', '9', 25, '{"Mobile Smart TV / Display on Rolling Cart","Large Conference Table with In-Table Power Outlets","Executive Ergonomic Mesh Chairs","Breakout Round Tables & Perimeter Seating","Panoramic Floor-to-Ceiling Windows with Roller Blinds","Acoustic Wall & Carpeted Floor","Central Climate Control (AC)","High-Speed WiFi & Network"}', true, '/solid-4-room.png', 'Ruang rapat utama Lantai 9 berkapasitas 25 orang dilengkapi dengan Smart Display LED 75" untuk presentasi interaktif dan pendingin ruangan central.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, capacity = EXCLUDED.capacity, image = EXCLUDED.image;
INSERT INTO public.rooms (id, name, floor, capacity, facilities, is_active, image, description)
VALUES ('room-lt11-warroom', 'Ruang Rapat War Room Lantai 11', '11', 6, '{"Wall-Mounted Smart TV / LED Display","Video Conference Camera","Executive Ergonomic Seating","Integrated In-Table Power Outlets","Central Climate Control (AC)","Acoustic Wall & Carpeted Floor","Frosted Glass Privacy Door","High-Speed WiFi & Network"}', true, '/war-room.png', 'Ruang War Room khusus Lantai 11 untuk komando insiden, diskusi strategi intensif, dan rapat terbatas 6 orang.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, capacity = EXCLUDED.capacity, image = EXCLUDED.image;
INSERT INTO public.rooms (id, name, floor, capacity, facilities, is_active, image, description)
VALUES ('room-lt11-atb', 'Ruang Rapat ATB Lantai 11', '11', 40, '{"Large Wall-Mounted Smart TV / Display","Active PA Sound System with Speaker Stands","Flipchart / Whiteboard Stand","Modular Folding Conference Tables","Ergonomic Mesh Swivel Chairs","Acoustic Wall Partition & Carpeted Floor","Central Climate Control (AC)","High-Speed WiFi & Network"}', true, '/atb-room.png', 'Ruang rapat kapasitas medium Lantai 11 berkapasitas 40 orang yang ideal untuk koordinasi lintas divisi dan rapat pleno.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, capacity = EXCLUDED.capacity, image = EXCLUDED.image;
INSERT INTO public.rooms (id, name, floor, capacity, facilities, is_active, image, description)
VALUES ('room-lt11-smart', 'Ruang Rapat Smart Room Lantai 11', '11', 15, '{"Large Mobile Smart TV / Display on Rolling Cart","Wide Wall-Mounted Magnetic Glass Board / Whiteboard","Executive Ergonomic Mesh Chairs (10+ Pax Capacity)","Large Boardroom Conference Table with Cable Grommets","Side Discussion Round Tables & Extra Seating","Acoustic Wall Panels & Carpeted Floor","Central Climate Control (AC)","High-Speed WiFi & Network"}', true, '/smart-room.png', 'Ruang rapat Smart Room Lantai 11 berkapasitas 15 orang dengan interior modern dan fasilitas konferensi digital.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, capacity = EXCLUDED.capacity, image = EXCLUDED.image;
INSERT INTO public.rooms (id, name, floor, capacity, facilities, is_active, image, description)
VALUES ('room-lt11-vip', 'Ruang Rapat VIP Lantai 11', '11', 10, '{"Wall-Mounted Smart TV / Display","Premium VIP Leather Sofas & Swivel Armchairs (High Capacity Lounge)","Multi-Tier Round Coffee Tables","Wide Wall-Mounted Magnetic Glass Board / Whiteboard","Indoor Planter Greenery Display","Acoustic Wall Panels & Full Carpeted Floor","Central Climate Control (AC)","High-Speed WiFi & Network"}', true, '/vip-room.png', 'Ruang Executive VIP Lantai 11 eksklusif berkapasitas 10 orang khusus untuk penerimaan tamu eksekutif dan rapat jajaran direksi.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, capacity = EXCLUDED.capacity, image = EXCLUDED.image;
INSERT INTO public.rooms (id, name, floor, capacity, facilities, is_active, image, description)
VALUES ('room-lt12-ballroom', 'Grand Ballroom & Hall Lantai 12', '12', 100, '{"Raised Stage / Podium Area","Professional Sound System with Stand Speakers","Banquet / Round Table Setups with Dining Chairs","High-Capacity Multi-Purpose Hall","Aesthetic Warm Pendant Lighting & Wooden Ceiling Panels","Panoramic High-Floor City View Windows","Full Carpeted Floor & Central Climate Control (AC)","High-Speed WiFi & Network"}', true, '/aula-lt-12.png', 'Grand Ballroom & Hall utama Lantai 12 berkapasitas 80 - 100 orang untuk penyelenggaraan acara besar, gathering, workshop, dan Townhall.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, capacity = EXCLUDED.capacity, image = EXCLUDED.image;

-- RIWAYAT BOOKINGS LAMA
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-518831', 'Grand Ballroom & Hall Lantai 12', '12', '2026-09-15', '2026-09-19', 1, '09:00', '15:00', 'RSMES', 'Rahma Yulia Prastiwi', '082234305882', 'Kelas Pendampingan Bisnis ', 'Galih (Admin GS)', 'Unggah Nota Dinas', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-924821', 'Ruang Rapat Solid 4 Lantai 9', '9', '2026-09-15', '2026-09-17', 1, '09:00', '17:00', 'Regional Large Enterprise & Government Service ', 'Dyta amellia pby', '085234003390', 'Boothcamp bank jatim', 'Galih (Admin GS)', 'Disetujui', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1789544041928_lc5e3.pdf', 'Undangan_Menghadiri_Bootcamp_Collection_Monthly_Lanjutan_Telkom (2).pdf')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-451393', 'Grand Ballroom & Hall Lantai 12', '11', '2026-09-14', '2026-09-18', 1, '09:00', '17:00', 'TIF', 'sonia', '081242935540', 'ROAD TO A GREATER TIF: Employee as Great Asset', 'Bertha (Admin GS)', 'Disetujui', 'ROAD TO A GREATER TIF: Employee as Great Asset (Reschedule)', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1789380032185_a8ww7.jpeg', 'TIF.jpeg')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-412938', 'Grand Ballroom & Hall Lantai 12', '12', '2026-09-11', '2026-09-15', 1, '16:00', '17:00', 'SSGS (HC)', 'Intan', '081331319137', 'Kegiatan IBO Zumba', 'Galih (Admin GS)', 'Selesai', 'sound system (bluetooth) : gunakan yang sudah ada d ruangan', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-116401', 'Grand Ballroom & Hall Lantai 12', '12', '2026-09-10', '2026-09-14', 1, '09:00', '12:00', 'GSD Regional III', 'Rozi', '081259504430', 'Pelatihan security dan housekeeping', 'Galih (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1789094437199_ksxj1.jpeg', 'WhatsApp Image 2026-09-11 at 09.34.31.jpeg')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-587201', 'Ruang Rapat Smart Room Lantai 11', '11', '2026-09-10', '2026-09-10', 1, '15:00', '18:00', 'RSMES', 'Dyah Shinta', '0811373037', 'Koordinasi Sobiz', 'Bertha (Admin GS)', 'Selesai', '-', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-826762', 'Ruang Rapat Solid 4 Lantai 9', '9', '2026-09-10', '2026-09-11', 1, '09:00', '17:00', 'Engineering Deployment TIF 3', 'Ike Dwi Susanti', '085102697926', 'Rekon PSB JBN', 'Galih (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1789034432348_ncbrw.pdf', 'Permohonan Peminjaman Ruang Rapat Solid 4 Lantai 9.pdf')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-745481', 'Ruang Rapat Solid 4 Lantai 9', '9', '2026-09-10', '2026-09-10', 1, '09:00', '19:00', 'Engineering Deployment TIF 3', 'Ike Dwi Susanti', '085102697926', 'Rekon PSB JBN ', 'Bertha (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1789034397289_xh1tf.pdf', 'Permohonan Peminjaman Ruang Rapat Solid 4 Lantai 9.pdf')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-161907', 'Ruang Rapat ATB Lantai 11', '11', '2026-09-10', '2026-09-16', 1, '08:00', '17:00', 'DEEP DIVE GOV SEGMENT TREG 3 ', 'hima', '081234705129', 'DEEP DIVE GOV SEGMENT TREG 3 ', 'Bertha (Admin GS)', 'Selesai', 'internal tanpa NDE', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-754841', 'Grand Ballroom & Hall Lantai 12', '12', '2026-09-10', '2026-09-17', 1, '09:00', '17:00', 'SSGS', 'Nugroho Adi', '081242935540', 'Forum Re-Connect TR3 2026', 'Galih (Admin GS)', 'Disetujui', 'internal', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-104300', 'Ruang Rapat Smart Room Lantai 11', '11', '2026-09-10', '2026-09-11', 1, '14:00', '17:00', 'Regional Large Enterprise & Government Service ', 'Dyta A P', '085234003390', 'Diskusi Government ', 'Bertha (Admin GS)', 'Selesai', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-847955', 'Grand Ballroom & Hall Lantai 12', '12', '2026-09-07', '2026-09-10', 1, '09:00', '16:00', 'RSMES', 'Rahma yulia prastiwi', '082234305882', 'Forum Sobiz Community Gathering', 'Galih (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1788774844097_1prbb.jpg', 'photo_2026-09-07_16-53-40.jpg')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-789474', 'Ruang Rapat ATB Lantai 11', '11', '2026-09-04', '2026-09-11', 1, '08:00', '17:00', 'RSMES', 'Rahma Yulia Prastiwi', '082234305882', 'forum sobiz channel', 'Galih (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1789033888708_wr3fz.pdf', 'Permohonan Dukungan Operasional dan Perizinan Penyelenggaraan Evalusasi Internal DMO Telkom Regional III dan Mini Gathering dengan Komunitas.pdf')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-738821', 'Ruang Rapat ATB Lantai 11', '11', '2026-09-04', '2026-09-10', 1, '08:00', '17:00', 'RSMES', 'Rahma yulia prastiwi', '082234305882', 'forum sobiz evaluation', 'Galih (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1789033899573_l1t7u.pdf', 'Permohonan Dukungan Operasional dan Perizinan Penyelenggaraan Evalusasi Internal DMO Telkom Regional III dan Mini Gathering dengan Komunitas.pdf')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-690834', 'Ruang Rapat ATB Lantai 11', '11', '2026-09-04', '2026-09-11', 1, '08:00', '17:00', 'RSMES', 'Rahma yulia prastiwi', '082234305882', 'forum sobiz channel', 'Bertha (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1789033872465_exio3.pdf', 'Permohonan Dukungan Operasional dan Perizinan Penyelenggaraan Evalusasi Internal DMO Telkom Regional III dan Mini Gathering dengan Komunitas.pdf')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-650921', 'Ruang Rapat War Room Lantai 11', '11', '2026-09-04', '2026-09-10', 1, '08:00', '17:00', 'RSMES', 'Rahma yulia prastiwi', '082234305882', 'forum sobiz catch up', 'Bertha (Admin GS)', 'Selesai', 'perlu 4 mic : sesuai kelengkapan keterangan ruangan tsb', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-821056', 'Ruang Rapat Solid 4 Lantai 9', '9', '2026-09-01', '2026-09-03', 1, '09:00', '17:00', 'Regional Large Enterprise & Government Service ', 'Dyta Amellia Purbayani ', '085234003390', 'Agenda Boothcamp Bank Jatim dan Tim Enterprise Suramadu ', 'Bertha (Admin GS)', 'Selesai', 'mohon dilengkapi nde, karena ada pihak External.', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1788336986606_xdt9q.pdf', 'Revisi_Undangan_Internal_Menghadiri_Bootcamp_Collection_Monthly.pdf')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-822209', 'Ruang Rapat Smart Room Lantai 11', '11', '2026-09-01', '2026-09-08', 1, '08:00', '11:00', 'SSGS', 'Galih', '-', 'Safety Induction', 'Galih (Admin GS)', 'Selesai', 'Internal saja tanpa pihak eksternal', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-145616', 'Ruang Rapat ATB Lantai 11', '11', '2026-08-31', '2026-09-01', 1, '13:00', '17:00', 'SSGS', 'Galih', '-', 'KPK Visit', 'Bertha (Admin GS)', 'Selesai', 'agenda Legal BPPLP', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-690835', 'Ruang Rapat ATB Lantai 11', '11', '2026-08-27', '2026-09-02', 1, '08:00', '17:00', 'SSGS', 'Galih', '-', '-', 'Bertha (Admin GS)', 'Dibatalkan', 'agenda diluar kantor', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-669816', 'Ruang Rapat ATB Lantai 11', '11', '2026-08-27', '2026-09-01', 1, '08:00', '10:00', 'SSGS', 'Galih', '-', 'Penyerahan SK', 'Bertha (Admin GS)', 'Selesai', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-640577', 'Ruang Rapat ATB Lantai 11', '11', '2026-08-27', '2026-08-31', 1, '08:00', '17:00', 'SSGS', 'Galih', '-', '-', 'Bertha (Admin GS)', 'Jadwal Ulang', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-616609', 'Grand Ballroom & Hall Lantai 12', '12', '2026-08-27', '2026-09-02', 1, '08:00', '17:00', 'SSGS', 'Galih', '-', '-', 'Bertha (Admin GS)', 'Dibatalkan', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-575575', 'Grand Ballroom & Hall Lantai 12', '12', '2026-08-27', '2026-09-01', 1, '08:00', '17:00', 'SSGS', 'Galih', '-', '-', 'Bertha (Admin GS)', 'Dibatalkan', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-550259', 'Grand Ballroom & Hall Lantai 12', '12', '2026-08-27', '2026-08-31', 1, '08:00', '17:00', 'SSGS', 'Galih', '-', 'Town Hall', 'Bertha (Admin GS)', 'Selesai', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-355078', 'Ruang Rapat ATB Lantai 11', '11', '2026-08-19', '2026-08-27', 1, '08:00', '17:00', 'RSMES', 'Rahma Yulia Prastiwi', '082234305882', 'Evaluasi internal DMO dan mini gathering', 'Galih (Admin GS)', 'Dibatalkan', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1787118722369_ry5ix.pdf', 'Permohonan_Dukungan_Operasional_dan_Perizinan_Penyelenggaraan_Evalusasi.pdf')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-504772', 'Ruang Rapat ATB Lantai 11', '11', '2026-08-19', '2026-08-28', 1, '08:00', '11:00', 'RSMES', 'Rahma Yulia Prastiwi', '082234305882', 'Meeting dengan unit Brand and Comm dan mini gathering dengan komunitas', 'Galih (Admin GS)', 'Dibatalkan', 'tambahan microphones dan set up ruangan', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1787118549288_yixcp.pdf', 'Permohonan_Dukungan_Operasional_dan_Perizinan_Penyelenggaraan_Evalusasi.pdf')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-145545', 'Grand Ballroom & Hall Lantai 12', '12', '2026-08-19', '2026-08-21', 1, '08:00', '17:00', 'Sekar', 'Aufal', '-', 'Musyawarah Wilayah', 'Galih (Admin GS)', 'Selesai', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-111864', 'Grand Ballroom & Hall Lantai 12', '12', '2026-08-19', '2026-08-20', 1, '08:00', '17:00', 'Sekar', 'Aufal', '-', 'Musyawarah Wilayah', 'Galih (Admin GS)', 'Selesai', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-908421', 'Ruang Rapat Solid 4 Lantai 9', '9', '2026-08-18', '2026-08-20', 1, '09:00', '11:00', 'REGIONAL LARGE ENTERPRISE & GOVERNMENT SERVICE ', 'Dyta amellia purbayani', '085234003390', 'AGENDA BOOTHCAMP BANK JATIM ', 'Galih (Admin GS)', 'Selesai', 'TIDAK ', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1787106802137_d610d.pdf', 'Undangan_Menghadiri_Bootcamp_Collection_Monthly_Telkom_dan_Bank.pdf')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-892109', 'Ruang Rapat ATB Lantai 11', '11', '2026-08-15', '2026-08-20', 1, '09:00', '15:00', 'RSO 2', 'I Putu Agus Picastaa', '+6281321697442', 'Sales & Tech Enablement with Ruijie.
Dihadiri oleh 20 AM dan Sales Engineer', 'Galih (Admin GS)', 'Selesai', 'Video Conferance Setup dan Microphone', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1787023667351_zrsz9.jpeg', 'WhatsApp Image 2026-08-18 at 10.25.03.jpeg')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-133032', 'Ruang Rapat Solid 4 lt 9', '11', '2026-08-12', '2026-08-13', 1, '08:00', '17:00', 'Probis Jakarta', 'Lovi', '', 'Probis', 'Bertha (Admin GS)', 'Selesai', 'support konsumsi dkk', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-767778', 'Ruang Rapat Solid 4 Lantai 9', '9', '2026-08-11', '2026-08-13', 1, '08:00', '17:00', 'SSGS', 'Aufal', '', 'Workshop', 'Bertha (Admin GS)', 'Selesai', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-165631', 'Ruang Rapat ATB Lantai 11', '11', '2026-08-08', '2026-08-10', 1, '08:00', '11:00', 'HC', 'Jodi', '', 'Penyerahan SK', 'Bertha (Admin GS)', 'Selesai', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-337121', 'Ruang Rapat Smart Room Lantai 11', '11', '2026-08-07', '2026-08-10', 1, '08:00', '12:00', 'HC', 'Jodi', '-', 'Onboarding Magang Kemnaker Batch 1 2026', 'Galih (Admin GS)', 'Selesai', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-641259', 'Grand Ballroom & Hall Lantai 12', '12', '2026-08-07', '2026-08-18', 1, '08:00', '17:00', '-', 'Sonia', '-', 'Agenda', 'Bertha (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1786592270427_wrtl8.jpeg', 'WhatsApp Image 2026-08-13 at 08.22.16.jpeg')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-713597', 'Ruang Rapat Solid 4 Lantai 9', '9', '2026-08-05', '2026-08-06', 1, '09:00', '17:00', 'RLEGS', 'Mbak Dyta', '', 'Agenda bootcamp billing
', 'Bertha (Admin GS)', 'Selesai', 'sesuai kapasitas', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-982200', 'Ruang Rapat ATB Lantai 11', '11', '2026-08-05', '2026-08-14', 1, '09:00', '17:00', 'TIF', 'Mbak UUT', '', 'Agenda TIF', 'Bertha (Admin GS)', 'Selesai', 'sesuai kapasitas', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-669329', 'Ruang Rapat ATB Lantai 11', '11', '2026-08-05', '2026-08-13', 1, '09:00', '17:00', 'TIF', 'mbak Uut', '', 'Agenda TIF', 'Bertha (Admin GS)', 'Selesai', 'sesuai kapasitas', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-380295', 'Grand Ballroom & Hall Lantai 12', '12', '2026-08-05', '2026-09-05', 1, '09:00', '12:30', 'RSMES', 'Aufal', '', 'Kolaborasi Indibiz x Asia Coach "Business Talk and Networking"', 'Galih (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1786691907645_40dgh.jpeg', 'WhatsApp Image 2026-08-14 at 11.05.47.jpeg')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-364125', 'Grand Ballroom & Hall Lantai 12', '12', '2026-08-05', '2026-08-27', 1, '09:00', '12:30', 'RSMES', 'Aufal', '', 'Kolaborasi Indibiz x Asia Coach "Business Talk and Networking"', 'Galih (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1786691864440_ju65k.jpeg', 'WhatsApp Image 2026-08-14 at 11.05.47.jpeg')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-348312', 'Grand Ballroom & Hall Lantai 12', '12', '2026-08-05', '2026-08-26', 1, '09:00', '12:30', 'RSMES', 'Aufal', '', 'Kolaborasi Indibiz x Asia Coach "Business Talk and Networking"', 'Galih (Admin GS)', 'Selesai', '', 'https://iuneyrwdcnlxtdtaukbu.supabase.co/storage/v1/object/public/room-photos/nota-dinas/nota_1786691433783_6fbqh.jpeg', 'WhatsApp Image 2026-08-14 at 11.05.47.jpeg')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (id, ruangan, floor, tanggal_konfirmasi, tanggal_pelaksanaan, lama_hari, pukul_mulai, pukul_selesai, unit_divisi, pic, pic_phone, agenda, pemberi_izin, status, keterangan, nota_dinas_url, nota_dinas_name)
VALUES ('BK-310573', 'Grand Ballroom & Hall Lantai 12', '12', '2026-08-05', '2026-08-09', 1, '08:00', '17:00', 'DMO', 'Aufal', '', '-', 'Galih (Admin GS)', 'Selesai', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- DATA SEED LETTERS (DIGILETTER REG 3)
INSERT INTO public.letters (id, tanggal_pengajuan, tanggal_ttd, jenis_surat, kode_perihal, spesifikasi_surat, kepada, nomor_surat, no_agenda, perihal, takah, pic, no_pic, keterangan, status)
VALUES ('REQ-2026-000', '2026-07-29', '2026-08-04', 'PO', 'LG.200', 'C.TEL', 'PT INDO', 'C.TEL 711/LG.200/T3R-00000000/2026', '711', 'Pengadaan Layanan Hardware Managed Service', 'T3R-00000000', 'Galih', '08123000000', 'Telah disetujui', 'Disetujui')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.letters (id, tanggal_pengajuan, tanggal_ttd, jenis_surat, kode_perihal, spesifikasi_surat, kepada, nomor_surat, no_agenda, perihal, takah, pic, no_pic, keterangan, status)
VALUES ('REQ-2026-001', '2026-08-18', '2026-08-19', 'KONTRAK', 'HK.810', 'K.TEL', 'PT TELEKOMUNIKASI SELULAR (TELKOMSEL)', 'K.TEL 761/HK.810/T3R-00000000/2026', '761', 'Perjanjian Kerjasama Penyediaan Layanan Connectivity Regional 3', 'T3R-00000000', 'Budi Santoso', '@budisantoso_t3', 'Telah ditandatangani EVP', 'Disetujui')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.letters (id, tanggal_pengajuan, tanggal_ttd, jenis_surat, kode_perihal, spesifikasi_surat, kepada, nomor_surat, no_agenda, perihal, takah, pic, no_pic, keterangan, status)
VALUES ('REQ-2026-002', '2026-08-19', '2026-08-20', 'MoU / Nota Kesepahaman', 'UM.100', 'TEL', 'DINAS KOMINFO PROVINSI JAWA BARAT', 'TEL 766/UM.100/T3R-0A000000/2026', '766', 'Nota Kesepahaman Sinergi Digitalisasi Desa Smart Province', 'T3R-0A000000', 'Siti Rahmawati', '081234567890', 'Nomor terbit, dokumen fisik di sekretariat', 'Disetujui')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.letters (id, tanggal_pengajuan, tanggal_ttd, jenis_surat, kode_perihal, spesifikasi_surat, kepada, nomor_surat, no_agenda, perihal, takah, pic, no_pic, keterangan, status)
VALUES ('REQ-2026-003', '2026-08-20', '2026-08-20', 'BA NGTMA', 'LG.200', 'C.TEL', 'GM NETWORK OPERATION TELKOM REGIONAL 3', '-', null, 'Berita Acara Negosiasi dan Kesepakatan Tarif Modernisasi Infrastruktur', '-', 'Ahmad Fauzi', '@ahmadfauzi_rg3', 'Menunggu review paraf SVP', 'Menunggu Persetujuan')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.letters (id, tanggal_pengajuan, tanggal_ttd, jenis_surat, kode_perihal, spesifikasi_surat, kepada, nomor_surat, no_agenda, perihal, takah, pic, no_pic, keterangan, status)
VALUES ('REQ-2026-004', '2026-08-20', '2026-08-21', 'SURAT TAGIHAN', 'KU.370', 'TEL', 'PT Infrastruktur Utama', '-', null, 'Surat Penagihan Termin I Pekerjaan Managed Service Q3', '-', 'Dewi Lestari', '081987654321', 'Verifikasi kelengkapan berkas tagihan', 'Menunggu Persetujuan')
ON CONFLICT (id) DO NOTHING;

-- RLS POLICIES FOR PUBLIC ACCESS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all rooms') THEN
    CREATE POLICY "Allow public all rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all bookings') THEN
    CREATE POLICY "Allow public all bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all letters') THEN
    CREATE POLICY "Allow public all letters" ON public.letters FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

