import XLSX from 'xlsx-js-style';

/**
 * Membersihkan dan mengonversi format tanggal menjadi DD/MM/YYYY
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
 * @param {Array} letters - List data pengajuan surat
 * @param {string} fileName - Nama file yang diunduh (default: DigiLetter_Reg_3_Agenda_Surat.xlsx)
 */
export function exportToExcel(letters, fileName = 'DigiLetter_Reg_3_Agenda_Surat.xlsx') {
  if (!letters || letters.length === 0) {
    alert('Tidak ada data pengajuan surat untuk diekspor.');
    return;
  }

  // 0. Urutkan Data Secara Kronologis Ascending (Dari tanggal terlama YYYY-MM-DD ke terbaru)
  const sortedLetters = [...letters].sort((a, b) => {
    const dateA = getCleanIsoDate(a.tanggal_ttd || a.tanggal_pengajuan);
    const dateB = getCleanIsoDate(b.tanggal_ttd || b.tanggal_pengajuan);
    
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB); // Ascending tanggal (Terlama -> Terbaru)
    }
    
    const numA = typeof a.no_agenda === 'number' ? a.no_agenda : 999999;
    const numB = typeof b.no_agenda === 'number' ? b.no_agenda : 999999;
    return numA - numB; // Ascending no agenda
  });

  // 1. Inisialisasi Sheet Baru
  const ws = {};
  
  // Style Definitions
  const titleStyle = {
    font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  const noteStyle = {
    font: { name: 'Calibri', sz: 11, bold: true, italic: true, color: { rgb: 'C00000' } }, // Warna merah resmi
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
    'PIC',
    'KETERANGAN'
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

  // Baris 3: Header 9 Kolom (Orange Peach)
  headers.forEach((h, colIdx) => {
    setCell(2, colIdx, h, headerStyle);
  });

  // Baris 4: Tepat 1 Baris Band Abu-abu Persis Gambar
  for (let c = 0; c < 9; c++) {
    setCell(3, c, '', greyBandStyle);
  }

  // Baris 5 Seterusnya: Data Pengajuan Surat (Mulai index 4)
  sortedLetters.forEach((item, idx) => {
    const rowIdx = 4 + idx;
    const rawTgl = item.tanggal_ttd || item.tanggal_pengajuan;
    const displayTgl = formatFullDateStr(rawTgl);

    setCell(rowIdx, 0, item.no_agenda ?? '-', dataCenterStyle);
    setCell(rowIdx, 1, displayTgl, dataCenterStyle);
    setCell(rowIdx, 2, item.jenis_surat || '-', dataLeftStyle);
    setCell(rowIdx, 3, item.kepada || '-', dataLeftStyle);
    setCell(rowIdx, 4, item.nomor_surat || '-', dataLeftStyle);
    setCell(rowIdx, 5, item.perihal || '-', dataLeftStyle);
    setCell(rowIdx, 6, item.takah || '-', dataLeftStyle);
    setCell(rowIdx, 7, item.pic || '-', dataLeftStyle);
    setCell(rowIdx, 8, item.keterangan || item.status || '-', dataLeftStyle);
  });

  // Range Sheet
  const totalRows = 4 + sortedLetters.length;
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRows - 1, c: 8 } });

  // Merge Cell A1 & A2 across 9 columns
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }
  ];

  // Lebar Kolom Otomatis
  ws['!cols'] = [
    { wch: 14 }, // NO AGENDA
    { wch: 16 }, // TANGGAL (DD/MM/YYYY)
    { wch: 28 }, // JENIS SURAT
    { wch: 32 }, // KEPADA
    { wch: 35 }, // NOMOR SURAT
    { wch: 45 }, // PERIHAL
    { wch: 16 }, // TAKAH
    { wch: 20 }, // PIC
    { wch: 22 }  // KETERANGAN
  ];

  // Buat workbook & ekspor berkas
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Agenda Surat Sekdiv');

  XLSX.writeFile(wb, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}
