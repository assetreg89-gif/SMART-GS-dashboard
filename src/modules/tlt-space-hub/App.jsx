import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PublicMonitoring from './components/PublicMonitoring';
import RoomCatalog from './components/RoomCatalog';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import BookingRequestModal from './components/BookingRequestModal';
import AdminApprovalModal from './components/AdminApprovalModal';
import AddRoomModal from './components/AddRoomModal';
import AdminLoginModal from './components/AdminLoginModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import ToastNotification from './components/ToastNotification';

import { MOCK_ROOMS, INITIAL_BOOKINGS } from './data/mockData';
import {
  fetchBookingsFromSupabase,
  insertBookingToSupabase,
  updateBookingStatusInSupabase,
  deleteBookingFromSupabase,
  fetchRoomsFromSupabase,
  upsertRoomToSupabase,
  deleteRoomFromSupabase,
  checkSupabaseStatus,
  subscribeToBookings,
  subscribeToRooms
} from './lib/supabase';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('tlt_theme') || 'light');
  const [activeTab, setActiveTab] = useState('monitoring');
  
  // Persist status admin di sessionStorage agar tidak hilang saat refresh
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('tlt_is_admin') === 'true';
  });

  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalInitialDate, setBookingModalInitialDate] = useState(null);
  const [bookingModalInitialRoom, setBookingModalInitialRoom] = useState(null);
  const [selectedBookingForApproval, setSelectedBookingForApproval] = useState(null);

  const handleOpenBookingModalWithDate = (dateStr) => {
    setBookingModalInitialDate(dateStr);
    setBookingModalInitialRoom(null);
    setIsBookingModalOpen(true);
  };

  const handleOpenBookingModalWithRoom = (roomName) => {
    setBookingModalInitialRoom(roomName);
    setBookingModalInitialDate(null);
    setIsBookingModalOpen(true);
  };

  const handleOpenBookingModalDefault = () => {
    setBookingModalInitialDate(null);
    setBookingModalInitialRoom(null);
    setIsBookingModalOpen(true);
  };
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showToastNotification = (title, message, type = 'success') => {
    setToast({ isOpen: true, title, message, type });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tlt_theme', theme);
  }, [theme]);

  // Sinkronisasi status Admin dengan URL browser (/admin vs /)
  useEffect(() => {
    if (isAdmin) {
      sessionStorage.setItem('tlt_is_admin', 'true');
      if (window.location.pathname !== '/admin' && window.location.pathname !== '/admin/') {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      sessionStorage.removeItem('tlt_is_admin');
      if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [isAdmin]);

  // Deteksi jika user membuka URL /admin secara langsung
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path === '/admin/') {
        if (!isAdmin) {
          setIsAdminLoginOpen(true);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [isAdmin]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const mapRealRoomImages = (roomList) => {
    if (!roomList) return [];
    return roomList.map(r => {
      const nameLower = (r.name || '').toLowerCase();
      let updatedImg = r.image;

      if (nameLower.includes('solid 4') || nameLower.includes('solid-4')) updatedImg = '/solid-4-room.png';
      else if (nameLower.includes('war room')) updatedImg = '/war-room.png';
      else if (nameLower.includes('vip')) updatedImg = '/vip-room.png';
      else if (nameLower.includes('smart room')) updatedImg = '/smart-room.png';
      else if (nameLower.includes('atb')) updatedImg = '/atb-room.png';
      else if (nameLower.includes('ballroom') || nameLower.includes('aula')) updatedImg = '/aula-lt-12.png';

      return { ...r, image: updatedImg || r.image };
    });
  };

  const isAnyModalOpen = isBookingModalOpen || isAddRoomModalOpen || Boolean(selectedBookingForApproval) || isAdminLoginOpen || deleteConfirm.isOpen;
  const isAnyModalOpenRef = React.useRef(isAnyModalOpen);

  useEffect(() => {
    isAnyModalOpenRef.current = isAnyModalOpen;
  }, [isAnyModalOpen]);

  useEffect(() => {
    let bookingsChannel = null;
    let roomsChannel = null;

    const loadData = async (isBackground = false) => {
      // Jangan refresh/re-fetch di latar belakang jika pengguna sedang mengisi form di modal
      if (isBackground && isAnyModalOpenRef.current) {
        return;
      }

      if (checkSupabaseStatus()) {
        const supabaseRooms = await fetchRoomsFromSupabase();
        if (supabaseRooms && supabaseRooms.length > 0) {
          setRooms(mapRealRoomImages(supabaseRooms));
        } else {
          setRooms(mapRealRoomImages(MOCK_ROOMS));
        }

        const supabaseBookings = await fetchBookingsFromSupabase();
        if (supabaseBookings && supabaseBookings.length > 0) {
          setBookings(supabaseBookings);
        }
      } else {
        setRooms(mapRealRoomImages(MOCK_ROOMS));
      }
    };

    // Initial Load
    loadData(false);

    // Setup Supabase Realtime Subscriptions
    if (checkSupabaseStatus()) {
      bookingsChannel = subscribeToBookings(() => {
        loadData(true);
      });

      roomsChannel = subscribeToRooms(() => {
        loadData(true);
      });
    }

    // Fallback Background Polling every 10 seconds
    const intervalId = setInterval(() => {
      loadData(true);
    }, 10000);

    return () => {
      clearInterval(intervalId);
      if (bookingsChannel && typeof bookingsChannel.unsubscribe === 'function') {
        bookingsChannel.unsubscribe();
      }
      if (roomsChannel && typeof roomsChannel.unsubscribe === 'function') {
        roomsChannel.unsubscribe();
      }
    };
  }, []);

  const triggerConfirmDelete = (title, message, onConfirmCallback) => {
    setDeleteConfirm({
      isOpen: true,
      title,
      message,
      onConfirm: onConfirmCallback
    });
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    sessionStorage.setItem('tlt_is_admin', 'true');
    setIsAdminLoginOpen(false);
    window.history.pushState(null, '', '/admin');
    showToastNotification('Login Sukses', 'Selamat datang Admin GS Telkom Regional 3.', 'admin');
  };

  const handleAdminLoginCancel = () => {
    setIsAdminLoginOpen(false);
    if (!isAdmin && (window.location.pathname === '/admin' || window.location.pathname === '/admin/')) {
      window.history.pushState(null, '', '/');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('tlt_is_admin');
    window.history.pushState(null, '', '/');
    showToastNotification('Logout Admin GS', 'Anda telah keluar dari Mode Admin GS.', 'admin');
  };

  const handleCreateBooking = async (newBooking) => {
    setBookings([newBooking, ...bookings]);
    showToastNotification('Pengajuan Terkirim', `Peminjaman ruangan "${newBooking.ruangan}" berhasil dibuat.`, 'success');

    const result = await insertBookingToSupabase(newBooking);
    if (result) {
      setBookings(prev => prev.map(b => b.id === newBooking.id ? result : b));
    }
  };

  const handleSaveApproval = async (updatedData) => {
    setBookings(bookings.map(b => b.id === updatedData.id ? { ...b, ...updatedData } : b));
    showToastNotification('Data Diperbarui', 'Status dan detail pengajuan telah berhasil diperbarui.', 'admin');
    await updateBookingStatusInSupabase(updatedData.id, updatedData);
  };

  const handleDeleteBooking = async (bookingId) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    setBookings(bookings.filter(b => b.id !== bookingId));
    showToastNotification('Pengajuan Dihapus', `Pengajuan agenda "${targetBooking ? targetBooking.agenda : ''}" telah dihapus.`, 'admin');
    await deleteBookingFromSupabase(bookingId);
  };

  const handleSaveRoom = async (roomData) => {
    if (roomToEdit) {
      setRooms(rooms.map(r => r.id === roomData.id ? roomData : r));
      showToastNotification('Ruangan Diperbarui', `Detail ruangan "${roomData.name}" berhasil diperbarui.`, 'admin');
    } else {
      setRooms([...rooms, roomData]);
      showToastNotification('Ruangan Ditambahkan', `Ruangan baru "${roomData.name}" berhasil ditambahkan ke katalog.`, 'admin');
    }
    await upsertRoomToSupabase(roomData);
  };

  const handleDeleteRoom = async (roomId) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    setRooms(rooms.filter(r => r.id !== roomId));
    showToastNotification('Ruangan Dihapus', `Ruangan "${targetRoom ? targetRoom.name : ''}" telah dihapus dari katalog.`, 'admin');
    await deleteRoomFromSupabase(roomId);
  };

  return (
    <div className="app-container" data-theme={theme}>
      <ToastNotification toast={toast} onClose={closeToast} />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteConfirm.onConfirm}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
      />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onAdminLogout={handleAdminLogout}
        onOpenBookingModal={handleOpenBookingModalDefault}
      />

      <main className="main-content">
        {activeTab === 'monitoring' && (
          <PublicMonitoring
            bookings={bookings}
            rooms={rooms}
            isAdmin={isAdmin}
            onOpenBookingModal={handleOpenBookingModalDefault}
            onOpenBookingModalWithDate={handleOpenBookingModalWithDate}
            onUpdateBookingStatus={(booking) => setSelectedBookingForApproval(booking)}
            onSaveApproval={handleSaveApproval}
            onRequestDeleteBooking={(booking) => triggerConfirmDelete(
              'Hapus Pengajuan Peminjaman',
              `Apakah Anda yakin ingin menghapus peminjaman agenda "${booking.agenda}" oleh ${booking.pic}?`,
              () => handleDeleteBooking(booking.id)
            )}
          />
        )}

        {(activeTab === 'catalog' || activeTab === 'rooms') && (
          <RoomCatalog
            rooms={rooms}
            isAdmin={isAdmin}
            onOpenBookingModal={handleOpenBookingModalDefault}
            onSelectRoomForBooking={handleOpenBookingModalWithRoom}
            onOpenAddRoomModal={() => { setRoomToEdit(null); setIsAddRoomModalOpen(true); }}
            onSelectRoomForEdit={(room) => { setRoomToEdit(room); setIsAddRoomModalOpen(true); }}
            onRequestDeleteRoom={(room) => triggerConfirmDelete(
              'Hapus Ruang Rapat',
              `Apakah Anda yakin ingin menghapus "${room.name}" dari Katalog Ruangan?`,
              () => handleDeleteRoom(room.id)
            )}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard bookings={bookings} theme={theme} />
        )}
      </main>

      <BookingRequestModal
        isOpen={isBookingModalOpen}
        onClose={() => { setIsBookingModalOpen(false); setBookingModalInitialDate(null); setBookingModalInitialRoom(null); }}
        onSubmitBooking={handleCreateBooking}
        rooms={rooms}
        existingBookings={bookings}
        initialDate={bookingModalInitialDate}
        initialRoom={bookingModalInitialRoom}
      />

      <AdminApprovalModal
        isOpen={Boolean(selectedBookingForApproval)}
        onClose={() => setSelectedBookingForApproval(null)}
        booking={selectedBookingForApproval}
        onSaveApproval={handleSaveApproval}
        onRequestDeleteBooking={(booking) => triggerConfirmDelete(
          'Hapus Pengajuan Peminjaman',
          `Apakah Anda yakin ingin menghapus peminjaman agenda "${booking.agenda}" oleh ${booking.pic}?`,
          () => handleDeleteBooking(booking.id)
        )}
      />

      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={() => { setIsAddRoomModalOpen(false); setRoomToEdit(null); }}
        onSaveRoom={handleSaveRoom}
        roomToEdit={roomToEdit}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={handleAdminLoginCancel}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
