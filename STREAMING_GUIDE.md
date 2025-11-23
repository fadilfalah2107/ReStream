# StreamVerse - Panduan Lengkap Streaming

## 🎥 Pengenalan Platform Streaming

StreamVerse adalah platform live streaming berbasis web dengan latensi rendah yang menggunakan teknologi WebRTC untuk pengalaman streaming real-time. Platform ini memungkinkan Anda melakukan streaming langsung dan menonton konten secara real-time tanpa perlu menginstal perangkat lunak tambahan.

## 📱 Dua Metode Streaming

### 1. Streaming Langsung dari Browser (Pemula)

**Untuk Streamer:**
1. Kunjungi halaman `/streamer` pada situs StreamVerse
2. Pilih kualitas streaming yang diinginkan (Tinggi/Sedang/Rendah)
3. Klik tombol "Start Streaming"
4. Berikan izin akses kamera dan mikrofon saat diminta
5. Anda sekarang siaran langsung! Bagikan URL penonton: `https://domain-anda.com/`

**Untuk Penonton:**
1. Akses halaman utama (`/`) atau gunakan link yang diberikan streamer
2. Stream otomatis terhubung jika ada streamer aktif
3. Nikmati pengalaman menonton dengan kontrol volume dan layar penuh

### 2. Streaming dengan OBS Studio (Profesional)

#### Persiapan OBS Studio

**Metode A: WebRTC via Browser Source (Direkomendasikan)**

1. **Konfigurasi di OBS:**
   - Buka OBS Studio
   - Tambahkan source baru "Browser"
   - Isi URL dengan alamat streamer Anda (misalnya `https://domain-anda.com/streamer`)
   - Atur lebar: 1920, tinggi: 1080
   - Centang "Control audio via OBS"

2. **Memulai Streaming:**
   - Di Browser Source, klik "Start Streaming"
   - Berikan izin yang diminta
   - Stream Anda akan langsung tampil di halaman penonton

**Metode B: Virtual Camera (Alternatif)**

1. **Setup Virtual Camera:**
   ```bash
   # Instal plugin Virtual Camera OBS
   # Windows: Sudah bawaan di OBS Studio 26.0+
   # Mac: Gunakan plugin OBS Virtual Camera
   # Linux: Gunakan v4l2loopback
   ```

2. **Aktifkan Virtual Camera di OBS:**
   - Menu Tools → Start Virtual Camera
   - Buka halaman `/streamer` di browser
   - Pilih "OBS Virtual Camera" sebagai input perangkat

3. **Mulai Streaming:**
   - Klik "Start Streaming" di panel streamer
   - Stream akan muncul di halaman penonton

#### Pengaturan Kualitas untuk OBS

**Pengaturan Video:**
- Resolusi: 1920x1080 (Full HD) atau 1280x720 (HD)
- FPS: 30 (untuk koneksi stabil) atau 60 (untuk kualitas maksimal)
- Bitrate: 2500-6000 Kbps (tergantung koneksi internet)

**Pengaturan Audio:**
- Sample Rate: 48kHz
- Audio Bitrate: 160 Kbps
- Codec: AAC

**Optimasi Kinerja:**
- Gunakan encoding perangkat keras (NVENC untuk NVIDIA, AMF untuk AMD)
- Pastikan koneksi internet stabil (minimal upload 5 Mbps)
- Tutup aplikasi latar belakang yang tidak perlu
- Gunakan kabel LAN daripada Wi-Fi untuk stabilitas lebih baik

## 🔧 Teknologi dan Arsitektur

### Arsitektur WebRTC

Platform ini menggunakan WebRTC untuk streaming berlatensi rendah:

1. **Server Signaling**: Endpoint WebSocket di `wss://[project-id].supabase.co/functions/v1/stream-signaling`
2. **Server STUN**: Server STUN Google untuk NAT traversal
3. **Koneksi Peer-to-Peer**: Koneksi langsung antara streamer dan penonton

### Kompatibilitas Browser

**Didukung Penuh:**
- Chrome 74+
- Firefox 66+
- Safari 14.1+
- Edge 79+

**Perangkat Mobile:**
- Chrome Android 74+
- Safari iOS 14.5+

### Persyaratan Jaringan

**Untuk Streamer:**
- Upload: minimal 5 Mbps (direkomendasikan 10 Mbps)
- Latensi: < 50ms ideal
- Koneksi: Stabil dan tidak terputus

**Untuk Penonton:**
- Download: minimal 3 Mbps
- Latensi: < 100ms
- Koneksi: Stabil untuk pengalaman optimal

## 🐛 Troubleshooting dan Solusi Masalah

### Stream Tidak Muncul

1. **Periksa izin perangkat:**
   - Pastikan browser memiliki akses ke kamera dan mikrofon
   - Cek pengaturan browser → Privasi → Kamera/Mikrofon

2. **Cek koneksi jaringan:**
   - Buka console browser (F12)
   - Perhatikan pesan error
   - Pastikan koneksi WebSocket aktif

3. **Pengaturan firewall:**
   - Pastikan port WebRTC tidak diblokir
   - Izinkan lalu lintas ke domain *.supabase.co

### Latensi Tinggi

1. **Optimasi pengaturan:**
   - Kurangi resolusi atau bitrate
   - Gunakan koneksi kabel (LAN)
   - Tutup aplikasi latar belakang

2. **Periksa jaringan:**
   - Lakukan speed test
   - Pastikan tidak ada packet loss
   - Coba jaringan berbeda

### Audio Tidak Terdengar

1. **Dari sisi browser:**
   - Pastikan video tidak dalam mode mute
   - Periksa volume sistem
   - Izinkan autoplay di pengaturan browser

2. **Dari sisi OBS:**
   - Periksa level mixer audio
   - Pastikan perangkat audio yang benar dipilih
   - Verifikasi "Control audio via OBS" tercentang

## 🌟 Fitur Utama

✅ **Live Streaming Real-Time**
- Transmisi video & audio real-time
- Dukungan penonton simultan banyak
- Latensi rendah (< 1 detik)

✅ **Interaktif dan Modern**
- UI/UX responsif dan menarik
- Efek glassmorphism
- Animasi halus
- Tema gelap/terang

✅ **Kontrol dan Statistik**
- Panel streamer lengkap
- Monitoring jumlah penonton
- Statistik durasi streaming
- Pengaturan kualitas dinamis

## 🚀 Pengembangan Mendatang

- [ ] Dukungan screen sharing
- [ ] Fungsi rekaman dan replay
- [ ] Chat interaktif real-time
- [ ] Sistem penjadwalan stream
- [ ] Dashboard analytics
- [ ] Multiple room streaming
- [ ] Fitur moderator
- [ ] Integrasi donasi/kontribusi

## 💡 Tips dan Praktik Terbaik

1. **Sesi pra-streaming:**
   - Uji kualitas kamera dan mikrofon
   - Periksa pencahayaan dan latar belakang
   - Lakukan uji coba kecil sebelum siaran besar

2. **Interaksi dengan audiens:**
   - Responsif terhadap pertanyaan penonton
   - Minta umpan balik secara berkala
   - Jaga konten tetap interaktif dan menarik

3. **Lingkungan streaming:**
   - Pencahayaan yang baik
   - Ruang yang tenang
   - Koneksi internet stabil
   - Power backup jika memungkinkan

---

**Platform:** StreamVerse
**Teknologi:** WebRTC, Supabase Realtime, React, TypeScript
**Dukungan:** Periksa log console untuk troubleshooting teknis
