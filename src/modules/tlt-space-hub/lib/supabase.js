import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const storedUrl = localStorage.getItem('tlt_supabase_url');
  const storedKey = localStorage.getItem('tlt_supabase_key');

  let rawUrl = (storedUrl || envUrl || '').trim();
  if (rawUrl.includes('/rest/v1')) {
    rawUrl = rawUrl.split('/rest/v1')[0];
  }
  const url = rawUrl.replace(/\/+$/, '');
  const key = (storedKey || envKey || '').trim();

  const isConfigured = Boolean(url && key && url.includes('supabase.co'));
  return { url, key, isConfigured };
};


export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    try {
      return createClient(url, key);
    } catch (err) {
      console.error('Kesalahan Klien Supabase:', err);
      return null;
    }
  }
  return null;
};

export const checkSupabaseStatus = () => {
  return getSupabaseConfig().isConfigured;
};

export const hashPassword = async (password) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Kesalahan enkripsi password:', err);
    return password;
  }
};

export const uploadRoomPhotoToSupabase = async (file) => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `rooms/${fileName}`;

      const { error: uploadError } = await client.storage
        .from('room-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Gagal mengunggah foto ke Supabase Storage:', uploadError.message);
        return null;
      }

      const { data: publicUrlData } = client.storage
        .from('room-photos')
        .getPublicUrl(filePath);

      return publicUrlData ? publicUrlData.publicUrl : null;
    } catch (err) {
      console.error('Pengecualian unggah foto:', err);
      return null;
    }
  }
  return null;
};

export const uploadNotaDinasToSupabase = async (file) => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `nota_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `nota-dinas/${fileName}`;

      const { error: uploadError } = await client.storage
        .from('room-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Gagal mengunggah Nota Dinas ke Supabase Storage:', uploadError.message);
        return null;
      }

      const { data: publicUrlData } = client.storage
        .from('room-photos')
        .getPublicUrl(filePath);

      return publicUrlData ? publicUrlData.publicUrl : null;
    } catch (err) {
      console.error('Pengecualian unggah Nota Dinas:', err);
      return null;
    }
  }
  return null;
};

export const fetchBookingsFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('bookings')
      .select('*')
      .order('tanggal_pelaksanaan', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data peminjaman dari Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Pengecualian ambil peminjaman:', err);
    return null;
  }
};

export const insertBookingToSupabase = async (bookingData) => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const sanitized = {
      id: bookingData.id || `BK-${Date.now().toString().slice(-6)}`,
      tanggal_konfirmasi: bookingData.tanggal_konfirmasi || todayStr,
      tanggal_pelaksanaan: bookingData.tanggal_pelaksanaan || todayStr,
      lama_hari: Number(bookingData.lama_hari) || 1,
      pukul_mulai: bookingData.pukul_mulai || '09:00',
      pukul_selesai: bookingData.pukul_selesai || '11:00',
      ruangan: bookingData.ruangan || '',
      floor: String(bookingData.floor || '9'),
      unit_divisi: bookingData.unit_divisi || '-',
      pic: bookingData.pic || '-',
      pic_phone: bookingData.pic_phone || '-',
      agenda: bookingData.agenda || '-',
      pemberi_izin: bookingData.pemberi_izin || '-',
      status: bookingData.status || 'Menunggu Persetujuan',
      keterangan: bookingData.keterangan || '',
      nota_dinas_url: bookingData.nota_dinas_url || '',
      nota_dinas_name: bookingData.nota_dinas_name || ''
    };

    const { data, error } = await client
      .from('bookings')
      .insert([sanitized])
      .select();

    if (error) {
      console.error('Gagal menambah peminjaman ke Supabase:', error.message);
      return null;
    }
    return data ? data[0] : null;
  } catch (err) {
    console.error('Pengecualian tambah peminjaman:', err);
    return null;
  }
};

export const updateBookingStatusInSupabase = async (id, updatedFields) => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const sanitized = {};
    const allowedKeys = [
      'ruangan', 'floor', 'tanggal_konfirmasi', 'tanggal_pelaksanaan',
      'lama_hari', 'pukul_mulai', 'pukul_selesai', 'unit_divisi', 'pic',
      'pic_phone', 'agenda', 'pemberi_izin', 'status', 'keterangan',
      'nota_dinas_url', 'nota_dinas_name'
    ];

    allowedKeys.forEach(key => {
      if (updatedFields[key] !== undefined) {
        sanitized[key] = updatedFields[key];
      }
    });

    if (sanitized.lama_hari !== undefined) {
      sanitized.lama_hari = Number(sanitized.lama_hari) || 1;
    }

    const { data, error } = await client
      .from('bookings')
      .update(sanitized)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Gagal memperbarui status peminjaman:', error.message);
      return null;
    }
    return data ? data[0] : null;
  } catch (err) {
    console.error('Pengecualian update peminjaman:', err);
    return null;
  }
};

export const deleteBookingFromSupabase = async (id) => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Gagal menghapus peminjaman:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Pengecualian hapus peminjaman:', err);
    return false;
  }
};

export const fetchRoomsFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('rooms')
      .select('*')
      .order('floor', { ascending: true });

    if (error) {
      console.error('Gagal mengambil data ruangan dari Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Pengecualian ambil ruangan:', err);
    return null;
  }
};

export const upsertRoomToSupabase = async (roomData) => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const sanitized = {
      id: roomData.id,
      name: roomData.name || '',
      floor: String(roomData.floor || '9'),
      capacity: Number(roomData.capacity) || 0,
      facilities: Array.isArray(roomData.facilities) ? roomData.facilities : [],
      is_active: roomData.is_active !== undefined ? Boolean(roomData.is_active) : true,
      image: roomData.image || '',
      description: roomData.description || ''
    };

    const { data, error } = await client
      .from('rooms')
      .upsert([sanitized], { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Gagal menyimpan ruangan ke Supabase:', error.message);
      return null;
    }
    return data ? data[0] : null;
  } catch (err) {
    console.error('Pengecualian simpan ruangan:', err);
    return null;
  }
};

export const deleteRoomFromSupabase = async (id) => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { data: targetRoom } = await client
      .from('rooms')
      .select('image')
      .eq('id', id)
      .single();

    if (targetRoom && targetRoom.image && targetRoom.image.includes('room-photos')) {
      try {
        const urlParts = targetRoom.image.split('/room-photos/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await client.storage
            .from('room-photos')
            .remove([filePath]);
        }
      } catch (storageErr) {
        console.warn('Gagal menghapus file foto dari storage:', storageErr);
      }
    }

    const { error } = await client
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Gagal menghapus ruangan:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Pengecualian hapus ruangan:', err);
    return false;
  }
};

export const subscribeToBookings = (onChangeCallback) => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const channel = client
      .channel('public:bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        onChangeCallback(payload);
      })
      .subscribe();

    return channel;
  } catch (err) {
    console.error('Pengecualian langganan Realtime bookings:', err);
    return null;
  }
};

export const subscribeToRooms = (onChangeCallback) => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const channel = client
      .channel('public:rooms-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        onChangeCallback(payload);
      })
      .subscribe();

    return channel;
  } catch (err) {
    console.error('Pengecualian langganan Realtime rooms:', err);
    return null;
  }
};

