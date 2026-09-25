import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const storedUrl = localStorage.getItem('digiletter_supabase_url') || localStorage.getItem('tlt_supabase_url');
  const storedKey = localStorage.getItem('digiletter_supabase_key') || localStorage.getItem('tlt_supabase_key');

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
      console.error('Kesalahan Klien Supabase DigiLetter:', err);
      return null;
    }
  }
  return null;
};

export const checkSupabaseStatus = () => {
  return getSupabaseConfig().isConfigured;
};

export const fetchLettersFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('letters')
      .select('*')
      .order('tanggal_ttd', { ascending: false });

    if (error) {
      // Jika tabel belum dibuat di Supabase, jangan error crash, cukup laporkan
      console.warn('Supabase DigiLetter fetch status:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Pengecualian fetch letters dari Supabase:', err);
    return null;
  }
};

export const insertLetterToSupabase = async (letterData) => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const sanitized = {
      id: letterData.id || `REQ-GS-${Date.now()}`,
      tanggal_pengajuan: letterData.tanggal_pengajuan || todayStr,
      tanggal_ttd: letterData.tanggal_ttd || todayStr,
      jenis_surat: letterData.jenis_surat || 'SURAT',
      kode_perihal: letterData.kode_perihal || 'HK.810',
      spesifikasi_surat: letterData.spesifikasi_surat || 'TEL',
      kepada: letterData.kepada || '-',
      nomor_surat: letterData.nomor_surat || '-',
      no_agenda: letterData.no_agenda !== undefined && letterData.no_agenda !== null && letterData.no_agenda !== '' ? String(letterData.no_agenda) : null,
      perihal: letterData.perihal || '-',
      takah: letterData.takah || '-',
      pic: letterData.pic || '-',
      no_pic: letterData.no_pic || '-',
      keterangan: letterData.keterangan || '',
      status: letterData.status || 'Menunggu Persetujuan'
    };

    const { data, error } = await client
      .from('letters')
      .insert([sanitized])
      .select();

    if (error) {
      console.warn('Gagal menambah surat ke Supabase:', error.message);
      return null;
    }
    return data ? data[0] : null;
  } catch (err) {
    console.warn('Pengecualian insert letter ke Supabase:', err);
    return null;
  }
};

export const updateLetterInSupabase = async (id, updatedFields) => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const sanitized = {};
    const allowedKeys = [
      'tanggal_pengajuan', 'tanggal_ttd', 'jenis_surat', 'kode_perihal',
      'spesifikasi_surat', 'kepada', 'nomor_surat', 'no_agenda', 'perihal',
      'takah', 'pic', 'no_pic', 'keterangan', 'status'
    ];

    allowedKeys.forEach(key => {
      if (updatedFields[key] !== undefined) {
        if (key === 'no_agenda') {
          sanitized[key] = updatedFields[key] !== null && updatedFields[key] !== '' ? String(updatedFields[key]) : null;
        } else {
          sanitized[key] = updatedFields[key];
        }
      }
    });

    const { data, error } = await client
      .from('letters')
      .update(sanitized)
      .eq('id', id)
      .select();

    if (error) {
      console.warn('Gagal update surat di Supabase:', error.message);
      return null;
    }
    return data ? data[0] : null;
  } catch (err) {
    console.warn('Pengecualian update letter di Supabase:', err);
    return null;
  }
};

export const deleteLetterFromSupabase = async (id) => {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('letters')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Gagal hapus surat dari Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Pengecualian delete letter dari Supabase:', err);
    return false;
  }
};

export const subscribeToLetters = (onChangeCallback) => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const channel = client
      .channel('public:letters-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'letters' }, (payload) => {
        onChangeCallback(payload);
      })
      .subscribe();

    return channel;
  } catch (err) {
    console.warn('Pengecualian Realtime letters:', err);
    return null;
  }
};
