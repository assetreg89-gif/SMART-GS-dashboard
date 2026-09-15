export const JENIS_SURAT_OPTIONS = [
  'KONTRAK',
  'KONTRAK AMD.',
  'MoU / Nota Kesepahaman',
  'P0',
  'P1',
  'BA NGTMA',
  'BASO',
  'ADMINISTRASI LAIN-LAIN',
  'SURAT TAGIHAN',
  'BA ADJUSTMENT',
  'BA PENYELESAIAN UTIP',
  'BA EKSEPSI ISOLIR'
];

export const KODE_PERIHAL_OPTIONS = [
  'HK.810',
  'HK.820',
  'HK.840',
  'LG.200',
  'HK.000',
  'UM.100',
  'KU.370',
  'KU.820',
  'KU.160',
  'YN.100'
];

export const SPESIFIKASI_SURAT_OPTIONS = [
  { value: 'TEL', label: 'TEL (Untuk Surat tujuan ke External)' },
  { value: 'K.TEL', label: 'K.TEL (Untuk surat yang berjenis Kontrak)' },
  { value: 'C.TEL', label: 'C.TEL (Untuk Surat tujuan ke Internal)' }
];

export const TAKAH_OPTIONS = [
  'T3R-00000000',
  'T3R-0A000000',
  'T3R-0B000000',
  'T3R-0C000000',
  'T3R-0D000000',
  'T3R-0E000000',
  'T3R-0G000000',
  'T3W-0A000000',
  'T3W-0B000000',
  'T3W-0C000000',
  'T3W-0D000000',
  'T3W-0E000000',
  'T3W-0F000000',
  'T3W-0G000000',
  'T3W-0H000000'
];

export const NATIONAL_HOLIDAYS = [
  '2026-01-01', // Tahun Baru Masehi
  '2026-01-16', // Isra Mi'raj
  '2026-02-17', // Tahun Baru Imlek
  '2026-03-19', // Hari Raya Nyepi
  '2026-03-20', // Hari Raya Idul Fitri 1447 H (Hari 1)
  '2026-03-21', // Hari Raya Idul Fitri 1447 H (Hari 2)
  '2026-04-03', // Wafat Yesus Kristus
  '2026-05-01', // Hari Buruh Internasional
  '2026-05-14', // Kenaikan Yesus Kristus
  '2026-05-27', // Hari Raya Idul Adha 1447 H
  '2026-06-01', // Hari Lahir Pancasila
  '2026-06-16', // Tahun Baru Islam 1448 H
  '2026-08-17', // HUT Kemerdekaan RI
  '2026-08-25', // Maulid Nabi Muhammad SAW
  '2026-12-25'  // Hari Raya Natal
];

export function generateLetterNumber(spesifikasi, noAgenda, kodePerihal, takah, year = new Date().getFullYear()) {
  if (!spesifikasi || !noAgenda || !kodePerihal || !takah) return '-';
  return `${spesifikasi} ${noAgenda}/${kodePerihal}/${takah}/${year}`;
}

export function isWorkday(dateStr, customHolidays = NATIONAL_HOLIDAYS) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const day = d.getDay();

  if (day === 0 || day === 6) return false;

  if (customHolidays.includes(dateStr)) return false;

  return true;
}

