# StreamVerse - Platform Live Streaming Real-Time

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![WebRTC](https://img.shields.io/badge/WebRTC-%20-blue?logo=webrtc)](https://webrtc.org/)
[![Supabase](https://img.shields.io/badge/Supabase-%20-orange?logo=supabase)](https://supabase.com/)

StreamVerse adalah platform live streaming modern dengan latensi rendah yang dibangun dengan teknologi WebRTC, React, dan TypeScript. Platform ini memungkinkan transmisi video secara real-time langsung dari browser dengan delay minimal dan kemampuan streaming berkualitas tinggi.

## ✨ Fitur

- **Streaming Real-Time**: Streaming dengan latensi ultra-rendah menggunakan teknologi WebRTC
- **Berdasarkan Browser**: Tidak perlu plugin atau instalasi software
- **Kualitas Tinggi**: Mendukung video hingga 1080p dengan pengaturan kualitas adaptif
- **UI Interaktif**: Desain glassmorphism modern dengan tata letak responsif
- **Multi-Platform**: Berfungsi di berbagai browser desktop dan mobile
- **Setup Mudah**: Panel streamer sederhana dengan fungsi satu-klik mulai/berhenti
- **Pelacakan Penonton**: Real-time viewer count dan statistik streaming
- **Integrasi OBS**: Kemampuan streaming lanjutan dengan OBS Studio

## 🚀 Demo Live

Nikmati StreamVerse secara langsung:
- **URL Penonton**: [https://your-domain.com/](https://your-domain.com/)
- **Panel Streamer**: [https://your-domain.com/streamer](https://your-domain.com/streamer)

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Framework**: [React](https://reactjs.org/) (v18.3.1)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/) (v5.8.3)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan animasi kustom
- **Komponen UI**: [shadcn/ui](https://ui.shadcn.com/) dengan styling kustom
- **Ikon**: [Lucide React](https://lucide.dev/)

### Infrastruktur Streaming
- **Protokol**: [WebRTC](https://webrtc.org/) untuk streaming peer-to-peer
- **Real-time**: [Supabase Realtime](https://supabase.com/realtime) untuk signaling
- **Backend**: Fungsi Edge Supabase untuk server signaling

### Pengembangan
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Linting**: [ESLint](https://eslint.org/)
- **Package Manager**: [Bun](https://bun.sh/)

## 📋 Prasyarat

- Node.js 18+ atau Bun 1.0+
- Browser modern dengan dukungan WebRTC (Chrome 74+, Firefox 66+, Safari 14.1+)
- Koneksi internet stabil (minimal 5 Mbps upload untuk streamer)

## 🚀 Memulai

### Instalasi

1. Clone repository:
```bash
git clone https://github.com/fadilfalah2107/streamverse.git
cd streamverse
```

2. Instal dependensi:
```bash
# Menggunakan Bun (direkomendasikan)
bun install

# Atau menggunakan npm
npm install
```

3. Siapkan variabel lingkungan:
```bash
cp .env.example .env
```

4. Konfigurasi variabel proyek Supabase di `.env`:
```env
VITE_SUPABASE_URL=url_supabase_anda
VITE_SUPABASE_ANON_KEY=kunci_anon_supabase_anda
```

### Pengembangan

Jalankan server pengembangan:
```bash
bun dev
# atau
npm run dev
```

Buka [http://localhost:5173](http://localhost:8080) di browser Anda untuk melihat aplikasi.

### Build

Buat build produksi:
```bash
bun build
# atau
npm run build
```

## 📖 Penggunaan

### Untuk Streamer

1. Akses `/streamer` pada situs yang telah dideploy
2. Pilih kualitas streaming yang diinginkan (Tinggi/Sedang/Rendah)
3. Klik "Start Streaming" dan berikan izin akses kamera/mikrofon
4. Bagikan link penonton yang dihasilkan dengan audiens Anda
5. Pantau statistik real-time (jumlah penonton, durasi, dll.)
6. Klik "Stop Stream" saat selesai

### Untuk Penonton

1. Kunjungi URL utama (`/`) atau gunakan link yang diberikan streamer
2. Stream akan otomatis terhubung jika streamer aktif
3. Gunakan kontrol volume dan mode layar penuh untuk pengalaman menonton yang lebih baik

### Streaming Lanjutan dengan OBS Studio

Untuk kualitas streaming profesional, StreamVerse mendukung integrasi OBS Studio:

1. Tambahkan "Browser Source" ke scene Anda
2. Atur URL ke halaman streamer Anda (`/streamer`)
3. Konfigurasi dimensi (direkomendasikan: 1920x1080)
4. Aktifkan "Control audio via OBS"
5. Mulai streaming dari browser source di OBS

## 🌐 Kompatibilitas Browser

| Browser | Versi | Dukungan WebRTC |
|---------|-------|-----------------|
| Chrome | 74+ | ✅ Dukungan Penuh |
| Firefox | 66+ | ✅ Dukungan Penuh |
| Safari | 14.1+ | ✅ Dukungan Penuh |
| Edge | 79+ | ✅ Dukungan Penuh |
| Chrome (Android) | 74+ | ✅ Dukungan Penuh |
| Safari (iOS) | 14.5+ | ✅ Dukungan Penuh |

## ⚙️ Konfigurasi

### Pengaturan Kualitas Video
- **Tinggi (1080p)**: 1920x1080 @ 30fps - Terbaik untuk koneksi cepat
- **Sedang (720p)**: 1280x720 @ 30fps - Keseimbangan kualitas dan performa
- **Rendah (480p)**: 854x480 @ 24fps - Dioptimalkan untuk koneksi lambat

### Persyaratan Jaringan
- **Untuk Streamer**: Minimal kecepatan upload 5 Mbps (10 Mbps direkomendasikan)
- **Untuk Penonton**: Minimal kecepatan download 3 Mbps

## 🔧 API & Integrasi

StreamVerse menggunakan WebRTC untuk streaming peer-to-peer langsung antara streamer dan penonton. Layanan Supabase Realtime menangani signaling untuk menjalin koneksi.

Platform ini menyertakan:
- Implementasi broadcaster WebRTC kustom
- Pelacakan kehadiran penonton secara real-time
- Monitoring durasi streaming
- Metrik kualitas layanan

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur Anda (`git checkout -b fitur/fitur-luar-biasa`)
3. Lakukan perubahan
4. Jalankan tes (`bun test` atau `npm test`)
5. Commit perubahan Anda (`git commit -m 'Tambah fitur luar biasa'`)
6. Push ke branch (`git push origin fitur/fitur-luar-biasa`)
7. Buka Pull Request

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE](LICENSE) untuk detail selengkapnya.

## 🐛 Troubleshooting

### Masalah Umum

1. **Tidak ada video saat streaming**
   - Periksa izin browser untuk kamera dan mikrofon
   - Verifikasi browser Anda mendukung WebRTC
   - Periksa ad blocker yang mungkin mengganggu koneksi

2. **Latensi tinggi**
   - Gunakan koneksi kabel daripada Wi-Fi
   - Tutup aplikasi lain yang memakan bandwidth
   - Coba pengaturan kualitas yang lebih rendah

3. **Masalah audio**
   - Periksa pengaturan audio sistem
   - Pastikan autoplay browser diaktifkan
   - Verifikasi pengaturan mixer audio OBS jika menggunakan OBS

### Console Browser

Buka developer tools browser (F12) dan periksa console untuk pesan error yang dapat membantu mendiagnosis masalah.

## 🚧 Roadmap

- [ ] Dukungan screen sharing
- [ ] Perekaman dan replay stream
- [ ] Fungsi chat interaktif
- [ ] Sistem penjadwalan stream
- [ ] Dashboard analytics
- [ ] Multiple room streaming
- [ ] Kontrol moderator
- [ ] Integrasi donasi/kontribusi

## 🙏 Terima Kasih

- [WebRTC](https://webrtc.org/) untuk teknologi komunikasi real-time
- [Supabase](https://supabase.com/) untuk infrastruktur backend real-time
- [React](https://reactjs.org/) untuk framework UI berbasis komponen
- [Tailwind CSS](https://tailwindcss.com/) untuk styling utility-first
- [shadcn/ui](https://ui.shadcn.com/) untuk komponen UI yang accessible

## 📬 Dukungan

Untuk dukungan, silakan buka isu di repository GitHub atau hubungi pengelola proyek.

---

**StreamVerse** - *Platform Streaming Real-Time Modern*

*Dibangun dengan ❤️ menggunakan React, TypeScript, dan WebRTC*
