/**
 * Service untuk mengelola integrasi database Google Sheets.
 * Spreadsheet ID: 1Z8CyLkvYwnpt2IoyszhKFAubGlUeaP7R_Vxl9agvEjo
 */

// KODE GOOGLE APPS SCRIPT LENGKAP YANG HARUS DITEMPEL DI SPREADSHEET (Extensions > Apps Script)
export const GOOGLE_APPS_SCRIPT_CODE = `
// GOOGLE APPS SCRIPT - DIGILETTER REG 3 DATABASE SYNC

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", data: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = data[0];
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: "success", data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    
    // Pastikan Header terpasang di baris 1 jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "id", "tanggal_pengajuan", "tanggal_ttd", "jenis_surat", "kode_perihal",
        "spesifikasi_surat", "kepada", "nomor_surat", "no_agenda", "perihal",
        "takah", "pic", "no_pic", "keterangan", "status"
      ]);
    }
    
    if (action === "SYNC_ALL") {
      // Re-populate data dari frontend
      var letters = contents.letters || [];
      sheet.clearContents();
      sheet.appendRow([
        "id", "tanggal_pengajuan", "tanggal_ttd", "jenis_surat", "kode_perihal",
        "spesifikasi_surat", "kepada", "nomor_surat", "no_agenda", "perihal",
        "takah", "pic", "no_pic", "keterangan", "status"
      ]);
      
      letters.forEach(function(item) {
        sheet.appendRow([
          item.id || '',
          item.tanggal_pengajuan || '',
          item.tanggal_ttd || '',
          item.jenis_surat || '',
          item.kode_perihal || '',
          item.spesifikasi_surat || '',
          item.kepada || '',
          item.nomor_surat || '',
          item.no_agenda !== undefined && item.no_agenda !== null ? item.no_agenda : '',
          item.perihal || '',
          item.takah || '',
          item.pic || '',
          item.no_pic || '',
          item.keterangan || '',
          item.status || ''
        ]);
      });
      
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", message: "Database Google Sheets berhasil diperbarui seluruhnya." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "SAVE_OR_UPDATE") {
      var item = contents.data;
      var data = sheet.getDataRange().getValues();
      var foundRow = -1;
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === item.id) {
          foundRow = i + 1;
          break;
        }
      }
      
      var rowValues = [
        item.id || '',
        item.tanggal_pengajuan || '',
        item.tanggal_ttd || '',
        item.jenis_surat || '',
        item.kode_perihal || '',
        item.spesifikasi_surat || '',
        item.kepada || '',
        item.nomor_surat || '',
        item.no_agenda !== undefined && item.no_agenda !== null ? item.no_agenda : '',
        item.perihal || '',
        item.takah || '',
        item.pic || '',
        item.no_pic || '',
        item.keterangan || '',
        item.status || ''
      ];
      
      if (foundRow > 0) {
        sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
      
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", message: "Data pengajuan berhasil disimpan ke Google Sheets." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "DELETE") {
      var targetId = contents.id;
      var data = sheet.getDataRange().getValues();
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === targetId) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", message: "Data berhasil dihapus dari Google Sheets." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: "Aksi tidak dikenali." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

// Key localStorage dan Default Web App URL
const SHEETS_URL_KEY = 'digiletter_sheets_webapp_url';
export const DEFAULT_SHEETS_WEBAPP_URL = (import.meta.env && import.meta.env.VITE_SHEETS_WEBAPP_URL)
  ? import.meta.env.VITE_SHEETS_WEBAPP_URL
  : 'https://script.google.com/macros/s/AKfycbw8EukjtEm_H6RCXqaf_frAquRlBOXHXNzgjo5XRS1aFHsZefMvlquN0PLH1SwGTk2-/exec';

export function getStoredSheetsUrl() {
  return localStorage.getItem(SHEETS_URL_KEY) || DEFAULT_SHEETS_WEBAPP_URL;
}

export function setStoredSheetsUrl(url) {
  localStorage.setItem(SHEETS_URL_KEY, url.trim());
}

/**
 * Mengambil seluruh data surat dari Google Sheets Web App
 */
export async function fetchLettersFromSheets(webAppUrl = getStoredSheetsUrl()) {
  if (!webAppUrl) return null;

  try {
    const response = await fetch(webAppUrl);
    const result = await response.json();
    if (result && result.status === 'success' && Array.isArray(result.data)) {
      return result.data.map((item, idx) => {
        const hasNomor = item.nomor_surat && item.nomor_surat !== '-' && item.nomor_surat.trim() !== '';
        const isApproved = hasNomor || (item.keterangan && item.keterangan.toLowerCase().includes('disetujui'));

        return {
          ...item,
          id: item.id || `REQ-GS-${idx}-${Date.now()}`,
          status: item.status || (isApproved ? 'Disetujui' : 'Menunggu Persetujuan'),
          tanggal_ttd: cleanDateStr(item.tanggal_ttd),
          tanggal_pengajuan: cleanDateStr(item.tanggal_pengajuan || item.tanggal_ttd),
          kode_perihal: item.kode_perihal || 'HK.810',
          spesifikasi_surat: item.spesifikasi_surat || (item.jenis_surat === 'KONTRAK' ? 'K.TEL' : 'TEL'),
          no_agenda: item.no_agenda !== '' && item.no_agenda !== null && !isNaN(Number(item.no_agenda))
            ? Number(item.no_agenda)
            : (item.no_agenda || null)
        };
      });
    }
    return null;
  } catch (err) {
    console.warn('Gagal mengambil data dari Google Sheets Web App:', err);
    return null;
  }
}

/**
 * Menyinkronkan seluruh daftar surat ke Google Sheets
 */
export async function syncAllToSheets(letters, webAppUrl = getStoredSheetsUrl()) {
  if (!webAppUrl) return false;

  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script Web App redirect handling
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SYNC_ALL', letters })
    });
    return true;
  } catch (err) {
    console.error('Gagal sync ke Google Sheets:', err);
    return false;
  }
}

/**
 * Menyimpan / memperbarui 1 data pengajuan ke Google Sheets
 */
export async function saveLetterToSheets(letter, webAppUrl = getStoredSheetsUrl()) {
  if (!webAppUrl) return false;

  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_OR_UPDATE', data: letter })
    });
    return true;
  } catch (err) {
    console.error('Gagal save letter ke Google Sheets:', err);
    return false;
  }
}

/**
 * Menghapus 1 data pengajuan dari Google Sheets
 */
export async function deleteLetterFromSheets(letterId, webAppUrl = getStoredSheetsUrl()) {
  if (!webAppUrl) return false;

  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE', id: letterId })
    });
    return true;
  } catch (err) {
    console.error('Gagal delete letter dari Google Sheets:', err);
    return false;
  }
}
