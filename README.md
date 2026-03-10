<p align="center">
  <img src="public/icon.svg" width="100" alt="MoLeCul Logo" />
</p>

<h1 align="center">🎮 MoLeCul — Moklet Learning Culture Journey</h1>

<p align="center">
  <b>Aplikasi Gamifikasi Pembelajaran Budaya Sekolah SMK Telkom Malang</b><br/>
  <i>Membangun karakter ATTITUDE melalui game interaktif, simulasi, dan AI</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Supabase-Database-green?logo=supabase" />
  <img src="https://img.shields.io/badge/Three.js-3D-black?logo=three.js" />
  <img src="https://img.shields.io/badge/PWA-Ready-orange?logo=pwa" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-purple?logo=google" />
</p>

---

## 📋 Daftar Isi

- [Tentang Aplikasi](#-tentang-aplikasi)
- [Apa itu Moklet Learning Culture?](#-apa-itu-moklet-learning-culture)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur Aplikasi](#-arsitektur-aplikasi)
- [Tech Stack](#-tech-stack)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Struktur Halaman](#-struktur-halaman)
- [Cara Menjalankan](#-cara-menjalankan)
- [Tim Pengembang](#-tim-pengembang)

---

## 🎯 Tentang Aplikasi

**MoLeCul** (Moklet Learning Culture) adalah aplikasi web progresif (PWA) yang dirancang untuk mengenalkan dan menginternalisasi **budaya belajar** di SMK Telkom Malang kepada siswa baru melalui pendekatan **gamifikasi**.

Aplikasi ini menjadi pendamping digital siswa selama **Masa Pengenalan Lingkungan Sekolah (MPLS)** dan seterusnya, mengubah proses pengenalan budaya sekolah yang biasanya satu arah menjadi pengalaman **interaktif, menyenangkan, dan bermakna**.

### 🎮 Kenapa Gamifikasi?

| Metode Tradisional | MoLeCul |
|---|---|
| Ceramah satu arah | Simulasi interaktif |
| Hafalan peraturan | Learning by doing |
| Evaluasi di akhir | Feedback instan |
| Motivasi eksternal | XP, badge, leaderboard |
| Selesai setelah MPLS | Journey berkelanjutan |

---

## 📖 Apa itu Moklet Learning Culture?

Moklet Learning Culture adalah kebiasaan bersama warga sekolah dalam belajar dan bekerja secara profesional. Bukan hanya menyelesaikan tugas, tapi **membangun mindset bertumbuh**.

### Nilai ATTITUDE

MoLeCul dibangun berdasarkan 8 nilai inti **ATTITUDE** SMK Telkom Malang:

| Huruf | Nilai | Deskripsi |
|:---:|---|---|
| **A** | Act Respectfully | Menjaga adab kepada guru & saling menghargai sesama |
| **T** | Talk Politely | Bertutur kata santun, positif, menghindari ucapan kasar |
| **T** | Turn Off Distraction | Fokus penuh pada materi, tidak bermain HP saat belajar |
| **I** | Involve Actively | Hadir sepenuhnya, merespon instruksi, aktif berpartisipasi |
| **T** | Think Solutions | Berorientasi pada penyelesaian masalah, bukan mengeluh |
| **U** | Use Tech Wisely | Memanfaatkan teknologi & AI sebagai alat bantu, bukan plagiasi |
| **D** | Dare to Ask | Membangun rasa ingin tahu, tidak malu bertanya |
| **E** | Eager to Collaborate | Terbuka untuk bekerja sama dan berbagi ilmu |

---

## 🚀 Fitur Utama

### 1. 🏠 Dashboard Interaktif (Home)
Halaman utama sebagai pusat kendali petualangan siswa.
- **Banner User** — Profil, total XP, dan progress misi.
- **Panel Aktivitas Harian** — Check-in, upload bukti kegiatan, dan refleksi harian.
- **Leaderboard Top 5** — Peringkat global siswa berdasarkan XP yang dihitung secara akurat (Single Source of Truth).
- **Tech Radar** — Update berita teknologi (Cyber Security, DevOps, Cloud Computing).

### 2. 🤖 MoDy — AI Moklet Buddy
**Halaman:** `/ai-tutor`
Asisten virtual berbasis **Google Gemini AI** dengan persona kakak tingkat (Senior) Moklet.
- **Socratic Method** — Membimbing mencari solusi, bukan sekadar memberi jawaban.
- **Spesialis Jurusan** — Memahami konteks RPL, TKJ, dan PG.
- **Culture Counselor** — Menjelaskan penerapan nilai ATTITUDE di sekolah.

### 3. 🗺️ Journey Map & MOLESH
- **Journey Map (`/journey`)** — Simulasi satu hari di sekolah (Parkiran → Kelas → Kantin → Lapangan → OSIS).
- **MOLESH (`/molesh`)** — *Moklet Leadership* (Sadari, Peduli, Berani). Program kepemimpinan khusus untuk membangun etika profesional di dunia digital.

### 4. 🏢 Exploration Zone (Gedung & Identitas)
- **Gedung Sekolah 3D (`/sekolah-3d`)** — Tour kampus virtual 360° menggunakan model 3D interaktif.
- **Seragam Mokleter (`/seragam`)** — Preview 3D seragam harian sekolah (Senin-Jumat) beserta ketentuan detailnya.
- **Career Explorer (`/karier`)** — Jelajahi jalur karier IT masa depan untuk tiap jurusan.
- **Profil YPT & Ekskul** — Mengenal Yayasan Pendidikan Telkom dan berbagai wadah minat bakat siswa.

### 5. 🎮 Training Grounds — Mini Games
Koleksi game edukatif untuk melatih karakter dan nilai ATTITUDE.

#### 🔴 Action Arena (Ketangkasan)
| Game | Deskripsi | Nilai ATTITUDE |
|---|---|---|
| 🏃 **Runner** | Menghindari distraksi & mengambil buku pelajaran. | **Turn Off Distraction** |
| 🥊 **Fighter** | Melawan "Hoax" & "Kemalasan" di arena 3D. | **Act Respectfully** |
| 🚀 **Space shooter** | Menembak asteroid kebiasaan buruk di luar angkasa. | **Think Solutions** |
| 🐍 **Moklet Snake** | Mengumpulkan huruf A-T-T-I-T-U-D-E secara berurutan. | **Discipline** |
| 🧩 **Tetris** | Menyusun blok strategi pembelajaran. | **Collaboration** |
| 🛡️ **Focus Guard** | Menghalau notifikasi distraksi yang muncul cepat. | **Focus** |

#### 🔵 Strategy & Exploration
| Game | Deskripsi | Nilai ATTITUDE |
|---|---|---|
| 🏗️ **Integrity Tower** | Menyusun balok menara integritas dengan fisika 3D. | **Character** |
| ⚡ **Tantangan Kilat** | Kuis cepat berbasis skenario sosial nyata. | **Think Solutions** |
| 🔗 **Connect** | Menghubungkan konsep budaya dengan pasangannya. | **Knowledge** |
| 💎 **Discovery 3D** | Mencari kristal ATTITUDE di labirin sekolah 3D. | **Involve Actively** |

---

### 6. 🏆 Puspresnas Arena
Informasi lengkap ajang talenta nasional (LKS, FIKSI, OSN, FLS2N, O2SN, dll) beserta cabang loba dan kriteria penilaiannya.

### 7. 📊 Sistem XP & Leaderboard Terintegrasi
- **Real-time Sync** — Skor game disimpan secara bertahap (*Incremental Saving*) dan otomatis terhubung ke akun.
- **Pagination Logic** — Homepage mengambil ribuan data rekam nilai secara akurat tanpa terpotong limit limit database (Sync Score logic).
- **Mission Progress** — Pelacakan misi yang diselesaikan di setiap fitur modul.

---

## 🏗️ Arsitektur Aplikasi

```
MoLeCul Architecture
├── 🌐 Frontend (Next.js 16 + React 19)
│   ├── Server components (Dashboard, Culture Hub)
│   ├── Client components (Games, AI Chat, 3D Viewers)
│   └── Three.js (3D Environment)
├── 💾 Database (Supabase / PostgreSQL)
│   ├── user_progress (XP & Rekam Jejak)
│   └── scenarios (Query konten dinamis)
└── 🤖 AI (Google Gemini API)
    └── MoDy - Custom Prompted Assistant
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & 3D**: React 19 + Three.js + React Three Fiber
- **Database**: Supabase
- **Authentikasi**: NextAuth.js (Google SSO Domain Sekolah)
- **PWA**: Ready (Offline Support & App Install)

---

## 📂 Struktur Halaman Lengkap

```
/                     → Dashboard Utama
/ai-tutor             → MoDy AI Chat
/molesh               → Kurikulum Leadership
/journey              → Journey Map Adventure
/sekolah-3d           → Campus Tour 3D
/seragam              → Katalog 3D Seragam
/karier               → Career Path Explorer
/culture              → Culture Hub
/events               → Puspresnas Hub
/bombi                → Profil Maskot 3D
/profil-ypt           → Tentang Yayasan
/ekskul               → Daftar Ekstrakurikuler
/admin/logs           → Monitoring Aktivitas
```

---

## 💻 Cara Menjalankan

1. `git clone https://github.com/hadhiee/molecul-journey.git`
2. `npm install`
3. Setting `.env.local` (Supabase, Google Auth, Gemini API Key)
4. `npm run dev`

---

## 🎓 Tim Pengembang

**MoLeCul** dikembangkan khusus untuk ekosistem pendidikan **SMK Telkom Malang** guna mengakselerasi internalisasi budaya sekolah secara digital dan modern.

<p align="center">
  <b>🎮 MoLeCul — Belajar Budaya, Seru Tanpa Batas!</b><br/>
  <i>SMK Telkom Malang © 2026</i>
</p>
