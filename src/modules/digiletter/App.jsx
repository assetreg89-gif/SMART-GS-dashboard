import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PublicMonitoring from './components/PublicMonitoring';
import AdminMonitoring from './components/AdminMonitoring';
import RequestLetterModal from './components/RequestLetterModal';
import AdminApprovalModal from './components/AdminApprovalModal';
import AdminLoginModal from './components/AdminLoginModal';
import UserLoginScreen from './components/UserLoginScreen';
import ToastNotification from './components/ToastNotification';

import { MOCK_LETTTERS } from './data/mockData';
import { NATIONAL_HOLIDAYS } from './utils/letterHelper';
import { 
  fetchLettersFromSheets, 
  saveLetterToSheets, 
  deleteLetterFromSheets 
} from './services/googleSheetsService';

import ExportExcelModal from './components/ExportExcelModal';

export default function App({ onBackHome }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('digiletter_theme') || 'light');
  
  // Persist status User & Admin di sessionStorage
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => {
    return sessionStorage.getItem('digiletter_user_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return sessionStorage.getItem('digiletter_current_user') || 'user';
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('digiletter_is_admin') === 'true';
  });

  const [letters, setLetters] = useState(MOCK_LETTTERS);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState(null);
  
  const [selectedLetterForApproval, setSelectedLetterForApproval] = useState(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showToast = (title, message, type = 'success') => {
    setToast({ isOpen: true, title, message, type });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }));
  };

  // Muat data dari Google Sheets saat aplikasi pertama dibuka (jika URL sudah diset)
  useEffect(() => {
    async function loadSheetsData() {
      const sheetsData = await fetchLettersFromSheets();
      if (sheetsData && sheetsData.length > 0) {
        setLetters(sheetsData);
      }
    }
    loadSheetsData();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('digiletter_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleUserLoginSuccess = (username) => {
    setIsUserLoggedIn(true);
    setCurrentUser(username);
    sessionStorage.setItem('digiletter_user_logged_in', 'true');
    sessionStorage.setItem('digiletter_current_user', username);
    showToast('Login Berhasil', `Selamat datang di DigiLetter Reg 3, ${username}!`, 'success');
  };

  const handleUserLogout = () => {
    setIsUserLoggedIn(false);
    setCurrentUser('');
    sessionStorage.removeItem('digiletter_user_logged_in');
    sessionStorage.removeItem('digiletter_current_user');
    showToast('Logout User', 'Anda telah keluar dari aplikasi.', 'success');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    sessionStorage.setItem('digiletter_is_admin', 'true');
    setIsAdminLoginOpen(false);
    showToast('Login Admin Berhasil', 'Selamat datang di Mode Sekretariat Divisi Telkom Reg 3.', 'success');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('digiletter_is_admin');
    showToast('Logout Admin', 'Anda telah keluar dari Mode Admin.', 'success');
  };

  // Submit Pengajuan Baru / Edit Publik
  const handleSubmitRequest = (requestData) => {
    let updatedItem;
    if (editingLetter) {
      // Update data pengajuan lama
      updatedItem = { ...editingLetter, ...requestData };
      setLetters(prev => prev.map(item => item.id === requestData.id ? updatedItem : item));
      showToast('Pengajuan Diperbarui', `Detail pengajuan perihal "${requestData.perihal}" telah diperbarui.`, 'success');
    } else {
      // Tambah pengajuan baru
      updatedItem = {
        ...requestData,
        nomor_surat: '-',
        no_agenda: null,
        takah: '-',
        status: 'Menunggu Persetujuan'
      };
      setLetters(prev => [updatedItem, ...prev]);
      showToast('Pengajuan Terkirim', `Pengajuan nomor surat perihal "${requestData.perihal}" berhasil terkirim.`, 'success');
    }
    setEditingLetter(null);

    // Sync item ke Google Sheets jika URL terkonfigurasi
    saveLetterToSheets(updatedItem);
  };

  // Membatalkan Pengajuan (CRUD Publik)
  const handleDeleteRequest = (letterItem) => {
    if (letterItem.status === 'Disetujui') {
      showToast('Gagal Membatalkan', 'Pengajuan yang sudah disetujui tidak dapat dibatalkan.', 'error');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin membatalkan pengajuan perihal "${letterItem.perihal}" oleh ${letterItem.pic}?`)) {
      setLetters(prev => prev.filter(item => item.id !== letterItem.id));
      showToast('Pengajuan Dibatalkan', 'Pengajuan nomor surat telah berhasil dihapus.', 'success');
      
      // Sync delete ke Google Sheets
      deleteLetterFromSheets(letterItem.id);
    }
  };

  // Hitung No. Agenda berdasarkan Tanggal TTD (EVP) dengan Penanganan Sisipan (105.1, 105.2, dst.)
  const getNextAgendaNo = (targetDateStr) => {
    if (!targetDateStr) {
      const existingAgendas = letters
        .map(l => l.no_agenda)
        .filter(n => Boolean(n) && n !== '-');
      return existingAgendas.length === 0 ? '58' : `${parseInt(existingAgendas[0]) + 1}`;
    }

    const d = new Date(targetDateStr);
    const targetYear = d.getFullYear();

    let workdayCount = 0;
    const targetDateObj = new Date(targetDateStr + 'T00:00:00');
    const startOfYearObj = new Date(targetYear, 0, 1);

    let curr = new Date(startOfYearObj);

    while (curr <= targetDateObj) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayOfWeek = curr.getDay(); // 0 = Sun, 6 = Sat

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        if (!NATIONAL_HOLIDAYS.includes(dateStr)) {
          workdayCount++;
        }
      }
      curr.setDate(curr.getDate() + 1);
    }

    const baseSlotEnd = Math.max(5, workdayCount * 5); // Contoh: Tanggal 15 -> slot 101 sampai 105
    const slotStart = baseSlotEnd - 4;

    const usedAgendas = new Set(letters.map(l => String(l.no_agenda)).filter(Boolean));

    // Cari slot reguler yang masih kosong antara (baseSlotEnd - 4) sampai baseSlotEnd
    let slot = slotStart;
    while (usedAgendas.has(String(slot)) && slot <= baseSlotEnd) {
      slot++;
    }

    // Jika 5 slot reguler pada tanggal TTD tersebut SUDAH PENUH:
    if (slot > baseSlotEnd) {
      const baseMaxAgenda = String(baseSlotEnd); // misal "105"
      // Cari berapa banyak sisipan .1, .2 yang sudah ada untuk 105
      let subIndex = 1;
      while (usedAgendas.has(`${baseMaxAgenda}.${subIndex}`)) {
        subIndex++;
      }
      return `${baseMaxAgenda}.${subIndex}`; // Mengembalikan 105.1, 105.2, dst.
    }

    return String(slot);
  };

  // Verifikasi / Approve oleh Admin Sekdiv
  const handleConfirmApprove = (updatedLetter) => {
    setLetters(prev => prev.map(item => {
      const isMatch = (item.id && updatedLetter.id && item.id === updatedLetter.id) ||
        (item.perihal === updatedLetter.perihal && item.pic === updatedLetter.pic);
      return isMatch ? updatedLetter : item;
    }));

    showToast(
      'Nomor Surat Diterbitkan',
      `Pengajuan perihal "${updatedLetter.perihal}" telah disetujui dengan Nomor: ${updatedLetter.nomor_surat}`,
      'success'
    );

    // Sync ke Google Sheets
    saveLetterToSheets(updatedLetter);
  };

  return (
    <div className="app-container" data-theme={theme}>
      <ToastNotification toast={toast} onClose={closeToast} />

      <Navbar
        isAdmin={isAdmin}
        isUserLoggedIn={isUserLoggedIn}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onAdminLogout={handleAdminLogout}
        onUserLogout={handleUserLogout}
        onOpenRequestModal={() => { setEditingLetter(null); setIsRequestModalOpen(true); }}
        onBackHome={onBackHome}
      />

      <main className="main-content">
        {isAdmin ? (
          <AdminMonitoring
            letters={letters}
            onOpenApprovalModal={(letter) => setSelectedLetterForApproval(letter)}
            onEditRequest={(letter) => { setEditingLetter(letter); setIsRequestModalOpen(true); }}
            onDeleteRequest={handleDeleteRequest}
            onOpenRequestModal={() => { setEditingLetter(null); setIsRequestModalOpen(true); }}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        ) : (
          <PublicMonitoring
            letters={letters}
            onEditRequest={(letter) => { setEditingLetter(letter); setIsRequestModalOpen(true); }}
            onDeleteRequest={handleDeleteRequest}
            onOpenRequestModal={() => { setEditingLetter(null); setIsRequestModalOpen(true); }}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}
      </main>

      <RequestLetterModal
        isOpen={isRequestModalOpen}
        onClose={() => { setIsRequestModalOpen(false); setEditingLetter(null); }}
        onSubmitRequest={handleSubmitRequest}
        editData={editingLetter}
      />

      <AdminApprovalModal
        isOpen={Boolean(selectedLetterForApproval)}
        onClose={() => setSelectedLetterForApproval(null)}
        letter={selectedLetterForApproval}
        nextAgendaNo={selectedLetterForApproval ? getNextAgendaNo(selectedLetterForApproval.tanggal_ttd) : 1}
        onConfirmApprove={handleConfirmApprove}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      <ExportExcelModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        letters={letters}
      />
    </div>
  );
}
