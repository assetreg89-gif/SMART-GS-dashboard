import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, CalendarCheck, CheckSquare, FileText, Clock, RotateCcw, XCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AnalyticsDashboard({ bookings, theme }) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#cbd5e1' : '#334155';
  const titleColor = isDark ? '#ffffff' : '#0f172a';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  const getNormalizedStatus = (rawStatus) => {
    if (!rawStatus) return 'Menunggu Persetujuan';
    const s = rawStatus.trim();
    if (s === 'Booking / TU' || s === 'Pending' || s === 'Menunggu Persetujuan') return 'Menunggu Persetujuan';
    if (s === 'Disetujui - Unggah Nota Dinas' || s === 'Unggah Nota Dinas') return 'Unggah Nota Dinas';
    if (s === 'Approved' || s === 'Disetujui') return 'Disetujui';
    if (s === 'Done' || s === 'Selesai') return 'Selesai';
    if (s === 'Reschedule' || s === 'Jadwal Ulang') return 'Jadwal Ulang';
    if (s === 'Tidak Jadi' || s === 'Dibatalkan') return 'Dibatalkan';
    return s;
  };

  const totalBookings = bookings.length;
  const approvedCount = bookings.filter(b => getNormalizedStatus(b.status) === 'Disetujui').length;
  const notaCount = bookings.filter(b => getNormalizedStatus(b.status) === 'Unggah Nota Dinas').length;
  const doneCount = bookings.filter(b => getNormalizedStatus(b.status) === 'Selesai').length;
  const pendingCount = bookings.filter(b => getNormalizedStatus(b.status) === 'Menunggu Persetujuan').length;

  const floorCounts = { '9': 0, '11': 0, '12': 0 };
  bookings.forEach(b => {
    if (floorCounts[b.floor] !== undefined) {
      floorCounts[b.floor]++;
    }
  });

  const floorChartData = {
    labels: ['Lantai 9', 'Lantai 11', 'Lantai 12'],
    datasets: [
      {
        label: 'Jumlah Peminjaman',
        data: [floorCounts['9'], floorCounts['11'], floorCounts['12']],
        backgroundColor: [
          'rgba(224, 0, 0, 0.85)',
          'rgba(59, 130, 246, 0.85)',
          'rgba(34, 197, 94, 0.85)',
        ],
        borderColor: ['#e00000', '#3b82f6', '#22c55e'],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const statusCounts = {
    'Unggah Nota Dinas': notaCount,
    'Disetujui': approvedCount,
    'Selesai': doneCount,
    'Menunggu Persetujuan': pendingCount,
    'Jadwal Ulang': bookings.filter(b => getNormalizedStatus(b.status) === 'Jadwal Ulang').length,
    'Dibatalkan': bookings.filter(b => getNormalizedStatus(b.status) === 'Dibatalkan').length,
  };

  const statusPieData = {
    labels: ['Unggah Nota Dinas', 'Disetujui (Resmi)', 'Selesai', 'Menunggu Persetujuan', 'Jadwal Ulang', 'Dibatalkan'],
    datasets: [
      {
        data: [
          statusCounts['Unggah Nota Dinas'],
          statusCounts['Disetujui'],
          statusCounts['Selesai'],
          statusCounts['Menunggu Persetujuan'],
          statusCounts['Jadwal Ulang'],
          statusCounts['Dibatalkan']
        ],
        backgroundColor: [
          'rgba(14, 165, 233, 0.85)',
          'rgba(34, 197, 94, 0.85)',
          'rgba(22, 163, 74, 0.85)',
          'rgba(234, 179, 8, 0.85)',
          'rgba(59, 130, 246, 0.85)',
          'rgba(239, 68, 68, 0.85)',
        ],
        borderColor: isDark ? '#0b0f19' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: { family: 'Plus Jakarta Sans', size: 12 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      y: {
        ticks: { color: textColor, stepSize: 1 },
        grid: { color: gridColor }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Peminjaman</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(224, 0, 0, 0.15)', color: 'var(--primary-red)' }}>
              <CalendarCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-title)' }}>{totalBookings}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--status-done-text)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
            <TrendingUp size={12} /> Real-time Supabase Data
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Unggah Nota Dinas</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.15)', color: '#0284c7' }}>
              <FileText size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--status-nota-text)' }}>{notaCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Ruangan Tersedia (Tahap Unggah Nota)
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Disetujui (Resmi)</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
              <CheckSquare size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--status-approved-text)' }}>{approvedCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Nota Dinas Valid & Disetujui
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Menunggu Persetujuan</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--status-pending-text)' }}>{pendingCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Pengajuan Baru Awal
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: titleColor, marginBottom: '1.25rem' }}>
            Tingkat Penggunaan Ruangan per Lantai
          </h3>
          <div style={{ height: '280px', position: 'relative' }}>
            <Bar data={floorChartData} options={chartOptions} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: titleColor, marginBottom: '1.25rem' }}>
            Persentase Status Peminjaman Ruang
          </h3>
          <div style={{ height: '280px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <Pie data={statusPieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12 } } } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}
