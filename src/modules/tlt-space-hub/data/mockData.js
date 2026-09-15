// Data default Fasilitas Ruangan Rapat Telkom Landmark Tower (Diselaraskan persis dengan Supabase)
export const MOCK_ROOMS = [
  {
    id: 'room-lt9-solid4',
    name: 'Ruang Rapat Solid 4 Lantai 9',
    floor: '9',
    capacity: 25,
    description: 'Ruang rapat utama lantai 9 yang dilengkapi dengan fasilitas presentasi modern dan setup hybrid meeting.',
    facilities: ['Smart Display LED 75"', 'Central Climate Control', 'High-Speed Wi-Fi', 'Whiteboard Glassboard'],
    image: '/solid-4-room.png'
  },
  {
    id: 'room-lt11-warroom',
    name: 'Ruang Rapat War Room Lantai 11',
    floor: '11',
    capacity: 6,
    description: 'Ruang rapat intensif berkapasitas 6 orang untuk diskusi strategi cepat dan koordinasi khusus.',
    facilities: ['Smart Display LED 55"', 'Audio-Visual Hybrid VC', 'Whiteboard', 'Power Hub'],
    image: '/war-room.png'
  },
  {
    id: 'room-lt11-vip',
    name: 'Ruang Rapat VIP Lantai 11',
    floor: '11',
    capacity: 10,
    description: 'Ruang rapat VIP dengan kenyamanan premium untuk tamu kehormatan dan jajaran pimpinan.',
    facilities: ['Smart Display LED 75"', 'Audio-Visual Conference System', 'Executive Chairs', 'Coffee Station Access'],
    image: '/vip-room.png'
  },
  {
    id: 'room-lt11-smart',
    name: 'Ruang Rapat Smart Room Lantai 11',
    floor: '11',
    capacity: 15,
    description: 'Ruang rapat pintar serbaguna dengan peralatan audio-visual interaktif modern.',
    facilities: ['Smart Display LED 75"', 'Audio-Visual Hybrid System', 'Wi-Fi 6', 'Glass Whiteboard'],
    image: '/smart-room.png'
  },
  {
    id: 'room-lt11-atb',
    name: 'Ruang Rapat ATB Lantai 11',
    floor: '11',
    capacity: 40,
    description: 'Ruang rapat berkapasitas besar lantai 11 yang dapat disesuaikan untuk rapat pleno dan lokakarya divisi.',
    facilities: ['Smart Display LED 75"', 'Audio-Visual Hybrid VC', 'Sound System', 'Modular Seating'],
    image: '/atb-room.png'
  },
  {
    id: 'room-lt12-ballroom',
    name: 'Grand Ballroom & Hall Lantai 12',
    floor: '12',
    capacity: 100,
    description: 'Aula utama dan Grand Ballroom lantai 12 untuk seminar besar, townhall regional, dan acara korporat.',
    facilities: ['Dual Large Projector & Screen', 'Integrated Pro Sound System', 'Podium Pembicara', 'Stage Microphones', 'Full AC Control'],
    image: '/aula-lt-12.png'
  }
];

export const INITIAL_BOOKINGS = [];
