import XLSX from 'xlsx-js-style';
import { NATIONAL_HOLIDAYS } from './letterHelper';

/**
 * Membersihkan dan mengonversi format tanggal menjadi format tanggal saja / DD/MM/YYYY
 */
function formatFullDateStr(dateVal) {
  if (!dateVal) return '-';
  let str = String(dateVal).trim();
  if (str.includes('T')) {
    str = str.split('T')[0];
  }
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
  }
  return str;
}

function getCleanIsoDate(dateVal) {
  if (!dateVal) return '';
  let str = String(dateVal).trim();
  if (str.includes('T')) {
    str = str.split('T')[0];
  }
  return str;
}

/**
 * Mengubah array data pengajuan surat menjadi file Excel (.xlsx) dengan WARNA DAN STYLE PERSIS TEMPLATE RESMI SEKDIV.
 * Mengalokasikan 3-5 slot agenda kosong untuk tanggal yang tidak memiliki pengajuan/surat.
 */
export function exportToExcel(letters, fileName = 'DigiLetter_Reg_3_Agenda_Surat.xlsx', options = {}) {
  if (!letters) letters = [];

  // Map data yang sudah ada berdasarkan no_agenda atau tanggal
  const existingMap = new Map();
  const datesWithLetters = new Set();

  letters.forEach(item => {
    const dateStr = getCleanIsoDate(item.tanggal_ttd || item.tanggal_pengajuan);
    if (dateStr) datesWithLetters.add(dateStr);

    if (item.no_agenda) {
      existingMap.set(String(item.no_agenda), item);
    }
  });

  // Tentukan Rentang Tanggal Ekspor (jika tidak ada data, gunakan bulan berjalan)
  let minDateObj = new Date();
  let maxDateObj = new Date();

  if (options.startDate && options.endDate) {
    minDateObj = new Date(options.startDate + 'T00:00:00');
    maxDateObj = new Date(options.endDate + 'T00:00:00');
  } else if (letters.length > 0) {
    const allDates = letters
      .map(l => getCleanIsoDate(l.tanggal_ttd || l.tanggal_pengajuan))
      .filter(Boolean)
      .sort();
    
    if (allDates.length > 0) {
      minDateObj = new Date(allDates[0] + 'T00:00:00');
      maxDateObj = new Date(allDates[allDates.length - 1] + 'T00:00:00');
    }
  } else {
    // Default 1 bulan berjalan
    const now = new Date();
    minDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
    maxDateObj = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  // Helper menghitung urutan hari kerja sejak 1 Januari tahun tersebut
  const getWorkdayIndexFromJan1 = (targetDateStr) => {
    const d = new Date(targetDateStr + 'T00:00:00');
    const targetYear = d.getFullYear();
    const startOfYearObj = new Date(targetYear, 0, 1);
    let count = 0;

    let curr = new Date(startOfYearObj);
    while (curr <= d) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const dayNum = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;
      const dayOfWeek = curr.getDay();

      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !NATIONAL_HOLIDAYS.includes(dateStr)) {
        count++;
      }
      curr.setDate(curr.getDate() + 1);
    }
    return count;
  };

  // Bangun daftar baris lengkap termasuk 5 slot kosong per hari kerja (Senin-Jumat)
  const fullRows = [];

  let curr = new Date(minDateObj);
  while (curr <= maxDateObj) {
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, '0');
    const day = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = curr.getDay(); // 0 = Sun, 6 = Sat

    // Cek Hari Kerja (Bukan Sabtu, Minggu, atau Libur Nasional)
    const isWorkingDay = dayOfWeek !== 0 && dayOfWeek !== 6 && !NATIONAL_HOLIDAYS.includes(dateStr);

    if (isWorkingDay) {
      const workdayIndex = getWorkdayIndexFromJan1(dateStr);
      const baseSlotEnd = Math.max(5, workdayIndex * 5);
      const baseSlotStart = baseSlotEnd - 4;

      // Ambil HANYA surat yang SUDAH DISETUJUI (Approved) pada tanggal ini
      const lettersOnDate = letters.filter(l => 
        l.status === 'Disetujui' && getCleanIsoDate(l.tanggal_ttd || l.tanggal_pengajuan) === dateStr
      );

      // Urutkan surat pada tanggal ini (urutkan berdasarkan no_agenda)
      lettersOnDate.sort((a, b) => 
        String(a.no_agenda || '').localeCompare(String(b.no_agenda || ''), undefined, { numeric: true })
      );

      const processedIds = new Set();

      // Hasilkan 5 slot reguler per hari kerja (misal 761, 762, 763, 764, 765)
      for (let slot = baseSlotStart; slot <= baseSlotEnd; slot++) {
        const slotStr = String(slot);
        
        // Cari surat yang secara spesifik bernilai slot ini atau belum terproses
        let letter = lettersOnDate.find(l => String(l.no_agenda) === slotStr && !processedIds.has(l.id || String(l.no_agenda)));

        if (!letter) {
          // Jika tidak ada no_agenda persis, gunakan surat antrean di tanggal yang sama jika no_agenda miliknya tidak konflik dengan slot reguler lain
          letter = lettersOnDate.find(l => !processedIds.has(l.id || String(l.no_agenda)) && (!l.no_agenda || String(l.no_agenda).includes('.') || Number(l.no_agenda) < baseSlotStart || Number(l.no_agenda) > baseSlotEnd));
        }

        if (letter) {
          processedIds.add(letter.id || String(letter.no_agenda));
          fullRows.push({
            no_agenda: slot,
            tanggal: dateStr,
            display_tanggal: curr.getDate(),
            jenis_surat: letter.jenis_surat || '',
            kepada: letter.kepada || '',
            nomor_surat: letter.nomor_surat || '',
            perihal: letter.perihal || '',
            takah: letter.takah || '',
            pic: letter.pic || '',
            keterangan: letter.keterangan || letter.status || ''
          });
        } else {
          fullRows.push({
            no_agenda: slot,
            tanggal: dateStr,
            display_tanggal: curr.getDate(),
            jenis_surat: '',
            kepada: '',
            nomor_surat: '',
            perihal: '',
            takah: '',
            pic: '',
            keterangan: ''
          });
        }
      }

      // Jika masih ada sisa surat di tanggal ini (misal 760.1, 760.2), keluarkan secara urut di bawah slot 5
      const remainingLetters = lettersOnDate.filter(l => !processedIds.has(l.id || String(l.no_agenda)));
      if (remainingLetters.length > 0) {
        remainingLetters.forEach(item => {
          fullRows.push({
            no_agenda: item.no_agenda,
            tanggal: dateStr,
            display_tanggal: curr.getDate(),
            jenis_surat: item.jenis_surat || '',
            kepada: item.kepada || '',
            nomor_surat: item.nomor_surat || '',
            perihal: item.perihal || '',
            takah: item.takah || '',
            pic: item.pic || '',
            keterangan: item.keterangan || item.status || ''
          });
        });
      }
    }

    curr.setDate(curr.getDate() + 1);
  }

  // Inisialisasi Sheet Baru
  const ws = {};
  
  // Style Definitions
  const titleStyle = {
    font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  const noteStyle = {
    font: { name: 'Calibri', sz: 11, bold: true, italic: true, color: { rgb: 'C00000' } }, // Merah resmi
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  const headerStyle = {
    fill: { fgColor: { rgb: 'F4B084' } }, // Peach Orange persis gambar
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  const greyBandStyle = {
    fill: { fgColor: { rgb: 'D9D9D9' } }, // Warna abu-abu baris 4 persis gambar
    border: {
      top: { style: 'thin', color: { rgb: 'BFBFBF' } },
      bottom: { style: 'thin', color: { rgb: 'BFBFBF' } },
      left: { style: 'thin', color: { rgb: 'BFBFBF' } },
      right: { style: 'thin', color: { rgb: 'BFBFBF' } }
    }
  };

  const cellBorder = {
    top: { style: 'thin', color: { rgb: 'D9D9D9' } },
    bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
    left: { style: 'thin', color: { rgb: 'D9D9D9' } },
    right: { style: 'thin', color: { rgb: 'D9D9D9' } }
  };

  const dataCenterStyle = {
    font: { name: 'Calibri', sz: 10, color: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: cellBorder
  };

  const dataLeftStyle = {
    font: { name: 'Calibri', sz: 10, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    border: cellBorder
  };

  const headers = [
    'NO AGENDA',
    'TANGGAL',
    'JENIS SURAT',
    'KEPADA',
    'NOMOR SURAT',
    'PERIHAL',
    'TAKAH',
    'PIC'
  ];

  // Helper memasukkan sel berpola
  const setCell = (r, c, v, style) => {
    const cellRef = XLSX.utils.encode_cell({ r, c });
    ws[cellRef] = { v, t: typeof v === 'number' ? 'n' : 's', s: style };
  };

  // Baris 1: Judul Banner
  setCell(0, 0, 'AGENDA SURAT KELUAR SEKDIV REGIONAL 3 JATIM BALINUS', titleStyle);

  // Baris 2: Catatan Merah
  setCell(1, 0, '*No Agenda diberi jarak 5 untuk setiap tanggal', noteStyle);

  // Baris 3: Header Kolom (Orange Peach)
  headers.forEach((h, colIdx) => {
    setCell(2, colIdx, h, headerStyle);
  });

  // Baris 4: Tepat 1 Baris Band Abu-abu + Tahun 2026 pada kolom NOMOR SURAT (persis gambar)
  for (let c = 0; c < 8; c++) {
    setCell(3, c, c === 4 ? 2026 : '', c === 4 ? { ...greyBandStyle, font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'C00000' } }, alignment: { horizontal: 'center' } } : greyBandStyle);
  }

  // Baris 5 Seterusnya: Data Pengajuan & Baris Slot Kosong (Mulai index 4)
  fullRows.forEach((item, idx) => {
    const rowIdx = 4 + idx;

    setCell(rowIdx, 0, item.no_agenda ?? '', dataCenterStyle);
    setCell(rowIdx, 1, item.display_tanggal ?? '', dataCenterStyle);
    setCell(rowIdx, 2, item.jenis_surat || '', dataLeftStyle);
    setCell(rowIdx, 3, item.kepada || '', dataLeftStyle);
    setCell(rowIdx, 4, item.nomor_surat || '', dataLeftStyle);
    setCell(rowIdx, 5, item.perihal || '', dataLeftStyle);
    setCell(rowIdx, 6, item.takah || '', dataLeftStyle);
    setCell(rowIdx, 7, item.pic || '', dataLeftStyle);
  });

  // Range Sheet
  const totalRows = 4 + fullRows.length;
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRows - 1, c: 7 } });

  // Merge Cell A1 & A2 across 8 columns
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
  ];

  // Lebar Kolom Otomatis
  ws['!cols'] = [
    { wch: 14 }, // NO AGENDA
    { wch: 12 }, // TANGGAL (Angka Tanggal)
    { wch: 28 }, // JENIS SURAT
    { wch: 30 }, // KEPADA
    { wch: 38 }, // NOMOR SURAT
    { wch: 45 }, // PERIHAL
    { wch: 18 }, // TAKAH
    { wch: 20 }  // PIC
  ];

  // Buat Workbook dan Unduh File
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Agenda Surat Keluar DR3 2026');
  XLSX.writeFile(wb, fileName);
}
