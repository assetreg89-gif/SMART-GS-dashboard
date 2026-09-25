-- ===================================================================
-- SKEMA DATABASE DIGILETTER REGIONAL 3 - SUPABASE POSTGRESQL
-- ===================================================================

-- 1. Buat Tabel letters
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

-- 2. Index untuk performa pencarian dan sorting
CREATE INDEX IF NOT EXISTS idx_letters_ttd ON public.letters(tanggal_ttd);
CREATE INDEX IF NOT EXISTS idx_letters_status ON public.letters(status);
CREATE INDEX IF NOT EXISTS idx_letters_agenda ON public.letters(no_agenda);

-- 3. Kebijakan Row Level Security (RLS) untuk Akses Anon / Public
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all letters') THEN
    CREATE POLICY "Allow public all letters" ON public.letters FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. Data Awal (Seed Data)
INSERT INTO public.letters (id, tanggal_pengajuan, tanggal_ttd, jenis_surat, kode_perihal, spesifikasi_surat, kepada, nomor_surat, no_agenda, perihal, takah, pic, no_pic, keterangan, status)
VALUES 
('REQ-2026-000', '2026-07-29', '2026-08-04', 'PO', 'LG.200', 'C.TEL', 'PT INDO', 'C.TEL 711/LG.200/T3R-00000000/2026', '711', 'Pengadaan Layanan Hardware Managed Service', 'T3R-00000000', 'Galih', '08123000000', 'Telah disetujui', 'Disetujui'),
('REQ-2026-001', '2026-08-18', '2026-08-19', 'KONTRAK', 'HK.810', 'K.TEL', 'PT TELEKOMUNIKASI SELULAR (TELKOMSEL)', 'K.TEL 761/HK.810/T3R-00000000/2026', '761', 'Perjanjian Kerjasama Penyediaan Layanan Connectivity Regional 3', 'T3R-00000000', 'Budi Santoso', '@budisantoso_t3', 'Telah ditandatangani EVP', 'Disetujui'),
('REQ-2026-002', '2026-08-19', '2026-08-20', 'MoU / Nota Kesepahaman', 'UM.100', 'TEL', 'DINAS KOMINFO PROVINSI JAWA BARAT', 'TEL 766/UM.100/T3R-0A000000/2026', '766', 'Nota Kesepahaman Sinergi Digitalisasi Desa Smart Province', 'T3R-0A000000', 'Siti Rahmawati', '081234567890', 'Nomor terbit, dokumen fisik di sekretariat', 'Disetujui'),
('REQ-2026-003', '2026-08-20', '2026-08-20', 'BA NGTMA', 'LG.200', 'C.TEL', 'GM NETWORK OPERATION TELKOM REGIONAL 3', '-', null, 'Berita Acara Negosiasi dan Kesepakatan Tarif Modernisasi Infrastruktur', '-', 'Ahmad Fauzi', '@ahmadfauzi_rg3', 'Menunggu review paraf SVP', 'Menunggu Persetujuan'),
('REQ-2026-004', '2026-08-20', '2026-08-21', 'SURAT TAGIHAN', 'KU.370', 'TEL', 'PT Infrastruktur Utama', '-', null, 'Surat Penagihan Termin I Pekerjaan Managed Service Q3', '-', 'Dewi Lestari', '081987654321', 'Verifikasi kelengkapan berkas tagihan', 'Menunggu Persetujuan')
ON CONFLICT (id) DO NOTHING;
