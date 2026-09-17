import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://iuneyrwdcnlxtdtaukbu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1bmV5cndkY25seHRkdGF1a2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3OTU4NjUsImV4cCI6MjEwMTM3MTg2NX0.5dkRAOUpEPPT6wBspHgCzR6CL7-TJAgLKM9O6p8yVh8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function exportAllData() {
  console.log('🔄 Menghubungkan ke Supabase lama untuk menarik seluruh history...');

  // 1. Fetch Rooms
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*');

  if (roomsError) {
    console.error('❌ Gagal fetch rooms:', roomsError.message);
  } else {
    console.log(`✅ Berhasil mengambil ${rooms.length} data ruangan.`);
  }

  // 2. Fetch Bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (bookingsError) {
    console.error('❌ Gagal fetch bookings:', bookingsError.message);
  } else {
    console.log(`✅ Berhasil mengambil ${bookings.length} data riwayat pemesanan/booking!`);
  }

  const backupPayload = {
    exported_at: new Date().toISOString(),
    source_url: SUPABASE_URL,
    total_rooms: rooms?.length || 0,
    total_bookings: bookings?.length || 0,
    rooms: rooms || [],
    bookings: bookings || []
  };

  // Simpan ke backup JSON
  const backupDir = path.resolve('src/data');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, 'supabase_history_backup.json');
  fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2), 'utf-8');
  console.log(`💾 File backup JSON tersimpan di: ${backupFilePath}`);

  return backupPayload;
}

exportAllData()
  .then(res => {
    console.log('🎉 Selesai mengekspor data history!');
    console.log(JSON.stringify(res, null, 2));
  })
  .catch(err => {
    console.error('Error:', err);
  });
