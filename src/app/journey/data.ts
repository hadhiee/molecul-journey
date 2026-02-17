export interface AttitudeScores { respect: number; communication: number; focus: number; teamwork: number; discipline: number; }
export interface Choice { text: string; effects: Partial<AttitudeScores>; feedback: string; quality: "best" | "good" | "bad"; }
export interface Scenario { situation: string; category: string; choices: Choice[]; }
export interface Location { id: string; name: string; emoji: string; color: string; description: string; x: number; y: number; scenarios: Scenario[]; }
export interface Level { id: number; title: string; subtitle: string; emoji: string; color: string; locations: Location[]; paths: { from: string; to: string }[]; }

export const ATTITUDE_META = [
    { key: "respect", label: "Respect", icon: "🤝", color: "#22c55e" },
    { key: "communication", label: "Communication", icon: "🗣️", color: "#3b82f6" },
    { key: "focus", label: "Focus", icon: "🎯", color: "#8b5cf6" },
    { key: "teamwork", label: "Teamwork", icon: "👥", color: "#f59e0b" },
    { key: "discipline", label: "Discipline", icon: "📏", color: "#ec4899" },
];

export const LEVELS: Level[] = [
    // ===== LEVEL 1: PAGI HARI =====
    {
        id: 1, title: "Pagi Hari", subtitle: "Tiba di sekolah, mulai hari dengan baik!", emoji: "🌅", color: "#f59e0b",
        locations: [
            {
                id: "parkiran", name: "Parkiran", emoji: "🅿️", color: "#64748b", description: "Area parkir kendaraan siswa", x: 20, y: 85,
                scenarios: [{
                    situation: "Kamu parkir motor dan melihat motor temanmu hampir jatuh karena standarnya tidak kokoh.",
                    category: "Respect",
                    choices: [
                        { text: "Bantu benarkan standar motornya dan rapikan", effects: { respect: 3, teamwork: 1 }, feedback: "Kecil tapi bermakna! Menolong tanpa diminta itu keren.", quality: "best" },
                        { text: "Bilang padanya nanti saat ketemu", effects: { communication: 1 }, feedback: "Oke, tapi motornya bisa jatuh sebelum kamu ketemu.", quality: "good" },
                        { text: "Biarkan saja, bukan urusanmu", effects: { respect: -2 }, feedback: "Kasihan kalau motornya jatuh, padahal kamu bisa bantu.", quality: "bad" },
                    ]
                }]
            },
            {
                id: "possatpam", name: "Pos Satpam", emoji: "🛡️", color: "#22c55e", description: "Pos keamanan di gerbang utama", x: 50, y: 85,
                scenarios: [{
                    situation: "Pak Satpam sedang mencatat siswa yang terlambat. Kamu tepat waktu tapi temanmu terlambat dan ingin kamu alihkan perhatian Pak Satpam.",
                    category: "Discipline",
                    choices: [
                        { text: "Tolak dengan baik, sarankan teman jujur ke Pak Satpam", effects: { discipline: 3, communication: 2 }, feedback: "Jujur itu pondasi karakter. Kamu menunjukkan integritas!", quality: "best" },
                        { text: "Bantu alihkan perhatian Pak Satpam", effects: { discipline: -3, teamwork: 1 }, feedback: "Solidaritas itu baik, tapi bukan dengan cara berbohong.", quality: "bad" },
                        { text: "Diam saja dan langsung masuk", effects: { discipline: 1 }, feedback: "Tidak ikut-ikutan, tapi bisa lebih supportif.", quality: "good" },
                    ]
                }]
            },
            {
                id: "gerbang", name: "Gerbang Sekolah", emoji: "🚪", color: "#3b82f6", description: "Gerbang utama sekolah", x: 80, y: 85,
                scenarios: [{
                    situation: "Di gerbang, kamu melihat adik kelas baru yang terlihat bingung dan ketakutan di hari pertamanya.",
                    category: "Communication",
                    choices: [
                        { text: "Sapa dan tawarkan diri untuk mengantarnya ke kelasnya", effects: { communication: 3, respect: 2, teamwork: 1 }, feedback: "Luar biasa! Kamu membuat hari pertamanya menyenangkan.", quality: "best" },
                        { text: "Tunjukkan arah secara singkat", effects: { communication: 1 }, feedback: "Sudah membantu, tapi dia masih butuh lebih banyak dukungan.", quality: "good" },
                        { text: "Jalan terus, dia pasti akan menemukan sendiri", effects: { respect: -1, communication: -1 }, feedback: "Ingat hari pertamamu? Pasti kamu juga butuh bantuan.", quality: "bad" },
                    ]
                }]
            },
        ],
        paths: [{ from: "parkiran", to: "possatpam" }, { from: "possatpam", to: "gerbang" }],
    },
    // ===== LEVEL 2: JAM PELAJARAN =====
    {
        id: 2, title: "Jam Pelajaran", subtitle: "Saatnya belajar dan berinteraksi di kelas!", emoji: "📖", color: "#8b5cf6",
        locations: [
            {
                id: "kelas", name: "Kelas Sendiri", emoji: "📚", color: "#8b5cf6", description: "Ruang kelasmu", x: 15, y: 30,
                scenarios: [{
                    situation: "Guru sedang menjelaskan materi penting. HP-mu bergetar — ada chat dari grup yang katanya urgent.",
                    category: "Focus",
                    choices: [
                        { text: "Abaikan HP, fokus ke pelajaran. Cek saat istirahat", effects: { focus: 3, discipline: 2 }, feedback: "Prioritas yang tepat! Materi ini nanti berguna di ujian.", quality: "best" },
                        { text: "Lihat sekilas di bawah meja", effects: { focus: -1, discipline: -1 }, feedback: "Satu kali 'sekilas' sering jadi berkali-kali.", quality: "good" },
                        { text: "Buka HP dan balas chat sambil pura-pura mencatat", effects: { focus: -3, discipline: -2 }, feedback: "Guru pasti tahu, dan kamu kehilangan materi penting.", quality: "bad" },
                    ]
                }]
            },
            {
                id: "kelaslain", name: "Kelas Lain", emoji: "🏫", color: "#6366f1", description: "Kelas tetangga", x: 40, y: 20,
                scenarios: [{
                    situation: "Kamu diminta guru untuk menyampaikan pesan ke kelas lain. Di sana, siswa sedang ribut karena guru belum datang.",
                    category: "Communication",
                    choices: [
                        { text: "Sampaikan pesan dengan sopan dan ingatkan mereka untuk tenang", effects: { communication: 3, respect: 2, discipline: 1 }, feedback: "Kamu bisa menyampaikan pesan sekaligus memberi pengaruh positif!", quality: "best" },
                        { text: "Sampaikan pesan cepat dan langsung pergi", effects: { communication: 1, discipline: 1 }, feedback: "Tugasnya selesai, tapi kamu bisa berbuat lebih.", quality: "good" },
                        { text: "Ikut ribut sebentar, baru sampaikan pesan", effects: { communication: -1, discipline: -2 }, feedback: "Kamu malah ikut memperburuk suasana.", quality: "bad" },
                    ]
                }]
            },
            {
                id: "ruangguru", name: "Ruang Guru", emoji: "👨‍🏫", color: "#0ea5e9", description: "Ruang para guru", x: 65, y: 30,
                scenarios: [{
                    situation: "Kamu harus mengumpulkan tugas ke guru, tapi ada 3 guru lain yang sedang meeting di ruangan. Pintunya terbuka.",
                    category: "Respect",
                    choices: [
                        { text: "Ketuk pintu, tunggu izin, lalu sampaikan dengan sopan", effects: { respect: 3, communication: 2, discipline: 1 }, feedback: "Etika yang sangat baik! Guru-guru pasti menghargai sikapmu.", quality: "best" },
                        { text: "Masuk pelan-pelan dan taruh tugas di meja tanpa bicara", effects: { respect: 1, discipline: 1 }, feedback: "Niat baik, tapi sebaiknya minta izin dulu.", quality: "good" },
                        { text: "Masuk langsung dan panggil guru dengan keras", effects: { respect: -3, communication: -1 }, feedback: "Meeting mereka terganggu. Perlu lebih sopan.", quality: "bad" },
                    ]
                }]
            },
            {
                id: "piket", name: "Ruang Piket", emoji: "📋", color: "#14b8a6", description: "Ruang piket guru", x: 85, y: 20,
                scenarios: [{
                    situation: "Kamu izin ke toilet tapi lupa bawa kartu izin. Guru piket bertanya kenapa tidak bawa.",
                    category: "Discipline",
                    choices: [
                        { text: "Minta maaf, jujur lupa, dan janji membawa besok", effects: { discipline: 2, communication: 2, respect: 1 }, feedback: "Jujur dan bertanggung jawab. Guru piket pasti menghargai kejujuranmu.", quality: "best" },
                        { text: "Kembali ke kelas ambil kartu izin dulu", effects: { discipline: 2 }, feedback: "Disiplin, tapi waktu terbuang. Besok jangan lupa!", quality: "good" },
                        { text: "Bilang kartunya hilang padahal sebenarnya lupa", effects: { discipline: -2, communication: -1 }, feedback: "Berbohong bukan solusi. Kejujuran itu amanah.", quality: "bad" },
                    ]
                }]
            },
        ],
        paths: [{ from: "kelas", to: "kelaslain" }, { from: "kelaslain", to: "ruangguru" }, { from: "ruangguru", to: "piket" }],
    },
    // ===== LEVEL 3: ISTIRAHAT =====
    {
        id: 3, title: "Jam Istirahat", subtitle: "Waktu refreshing dan mengisi energi!", emoji: "☕", color: "#f59e0b",
        locations: [
            {
                id: "kantin", name: "Kantin", emoji: "🍽️", color: "#f59e0b", description: "Tempat makan dan minum", x: 15, y: 35,
                scenarios: [{
                    situation: "Kamu melihat siswa yang makan sendirian dan terlihat sedih. Teman-temanmu sudah di meja lain.",
                    category: "Teamwork",
                    choices: [
                        { text: "Ajak dia bergabung ke mejamu dan kenalkan ke teman-teman", effects: { teamwork: 3, communication: 2, respect: 2 }, feedback: "Inklusivitas! Kamu mungkin baru saja membuat teman baru.", quality: "best" },
                        { text: "Sapa sekilas lalu duduk dengan temanmu", effects: { communication: 1 }, feedback: "Sudah baik, tapi dia masih sendirian.", quality: "good" },
                        { text: "Abaikan, mungkin dia memang ingin sendiri", effects: { respect: -1 }, feedback: "Tidak ada salahnya menawarkan. Siapa tahu dia butuh teman.", quality: "bad" },
                    ]
                }]
            },
            {
                id: "perpus", name: "Perpustakaan", emoji: "📖", color: "#8b5cf6", description: "Sumber ilmu dan ketenangan", x: 40, y: 25,
                scenarios: [{
                    situation: "Di perpustakaan, ada sekelompok siswa yang ngobrol keras sambil tertawa. Siswa lain yang belajar terganggu.",
                    category: "Discipline",
                    choices: [
                        { text: "Ingatkan mereka dengan sopan bahwa ini perpustakaan", effects: { discipline: 3, communication: 2, respect: 1 }, feedback: "Berani menegur dengan sopan itu butuh keberanian!", quality: "best" },
                        { text: "Pindah ke tempat yang lebih jauh dari mereka", effects: { focus: 1 }, feedback: "Kamu bisa tetap belajar, tapi masalahnya belum terselesaikan.", quality: "good" },
                        { text: "Ikut ngobrol karena penasaran", effects: { discipline: -2, focus: -2 }, feedback: "Kamu malah jadi bagian dari masalah.", quality: "bad" },
                    ]
                }]
            },
            {
                id: "uks", name: "UKS", emoji: "🏥", color: "#ef4444", description: "Unit Kesehatan Sekolah", x: 65, y: 35,
                scenarios: [{
                    situation: "Temanmu mengeluh pusing tapi tidak mau ke UKS karena takut ketinggalan pelajaran setelah istirahat.",
                    category: "Teamwork",
                    choices: [
                        { text: "Antar dia ke UKS dan janji akan meminjamkan catatan", effects: { teamwork: 3, respect: 2, communication: 1 }, feedback: "Caring! Kesehatan itu nomor satu, dan kamu good friend!", quality: "best" },
                        { text: "Sarankan dia istirahat di kelas saja", effects: { teamwork: 1 }, feedback: "Niat baik, tapi UKS lebih tepat untuk menangani.", quality: "good" },
                        { text: "Bilang dia lebay, paling cuma capek biasa", effects: { respect: -2, teamwork: -2 }, feedback: "Jangan remehkan keluhan orang lain tentang kesehatannya.", quality: "bad" },
                    ]
                }]
            },
            {
                id: "mushola", name: "Mushola", emoji: "🕌", color: "#059669", description: "Tempat ibadah Muslim", x: 85, y: 25,
                scenarios: [{
                    situation: "Waktu sholat Dhuha. Kamu melihat sepatu-sepatu berserakan di depan mushola dan ada teman yang kesulitan menemukan sepatunya.",
                    category: "Discipline",
                    choices: [
                        { text: "Bantu rapikan sepatu di rak dan bantu teman mencari", effects: { discipline: 3, respect: 2, teamwork: 1 }, feedback: "Menjaga kebersihan tempat ibadah itu ibadah juga!", quality: "best" },
                        { text: "Rapikan sepatumu sendiri dengan rapi", effects: { discipline: 1 }, feedback: "Sudah baik untuk diri sendiri. Coba ajak yang lain juga!", quality: "good" },
                        { text: "Langsung masuk tanpa peduli sepatu berantakan", effects: { discipline: -2 }, feedback: "Tempat ibadah yang rapi membuat khusyuk lebih mudah.", quality: "bad" },
                    ]
                }]
            },
        ],
        paths: [{ from: "kantin", to: "perpus" }, { from: "perpus", to: "uks" }, { from: "uks", to: "mushola" }],
    },
    // ===== LEVEL 4: KEGIATAN =====
    {
        id: 4, title: "Kegiatan & Olahraga", subtitle: "Waktu untuk bergerak dan berkarya!", emoji: "⚽", color: "#22c55e",
        locations: [
            {
                id: "lab", name: "Lab Komputer", emoji: "💻", color: "#06b6d4", description: "Praktikum dan coding", x: 20, y: 30,
                scenarios: [{
                    situation: "Ada siswa yang tidak sengaja menghapus file project kelompoknya. Dia panik dan hampir menangis.",
                    category: "Teamwork",
                    choices: [
                        { text: "Bantu cari file di recycle bin dan ajarkan cara backup", effects: { teamwork: 3, communication: 2, focus: 1 }, feedback: "Problem solver + mentor! Kamu mengubah krisis jadi pelajaran.", quality: "best" },
                        { text: "Bilang coba cek recycle bin, lalu lanjut kerja sendiri", effects: { communication: 1 }, feedback: "Arah sudah benar, tapi dia butuh lebih banyak dukungan.", quality: "good" },
                        { text: "Tertawa dan bilang seharusnya dia lebih hati-hati", effects: { respect: -3, teamwork: -2 }, feedback: "Itu sangat menyakitkan. Empati itu penting!", quality: "bad" },
                    ]
                }]
            },
            {
                id: "basket", name: "Lapangan Basket", emoji: "🏀", color: "#f97316", description: "Lapangan basket outdoor", x: 50, y: 20,
                scenarios: [{
                    situation: "Saat main basket, ada siswa yang selalu mengoper bola ke dirinya sendiri dan tidak pernah passing.",
                    category: "Communication",
                    choices: [
                        { text: "Ajak timeout, bicara baik-baik tentang teamwork", effects: { communication: 3, teamwork: 2, respect: 1 }, feedback: "Leadership! Kamu membuat tim lebih solid.", quality: "best" },
                        { text: "Teriak minta bola saat dia menguasai bola", effects: { communication: 1, teamwork: 1 }, feedback: "Oke, tapi pembicaraan yang lebih dalam akan lebih efektif.", quality: "good" },
                        { text: "Berhenti main dan marah-marah", effects: { communication: -2, teamwork: -2 }, feedback: "Emosi tidak menyelesaikan masalah. Komunikasinya bisa lebih baik.", quality: "bad" },
                    ]
                }]
            },
            {
                id: "sepakbola", name: "Lapangan Sepak Bola", emoji: "⚽", color: "#22c55e", description: "Lapangan besar multi-fungsi", x: 80, y: 30,
                scenarios: [{
                    situation: "Kamu kiper dan timmu kalah telak. Teman-teman mulai saling menyalahkan, suasana memanas.",
                    category: "Respect",
                    choices: [
                        { text: "Tenangkan tim: 'kita kalah bersama, evaluasi bareng yuk'", effects: { respect: 3, teamwork: 3, communication: 2 }, feedback: "Jiwa sportif dan leadership! Kamu menyatukan tim saat sulit.", quality: "best" },
                        { text: "Diam saja dan biarkan mereka selesai sendiri", effects: { respect: -1 }, feedback: "Kadang diam bukan solusi. Timmu butuh seseorang yang meredam.", quality: "good" },
                        { text: "Ikut menyalahkan pemain lain yang memang mainnya buruk", effects: { respect: -3, teamwork: -3 }, feedback: "Menyalahkan hanya memperburuk. Kalah itu pelajaran bersama.", quality: "bad" },
                    ]
                }]
            },
        ],
        paths: [{ from: "lab", to: "basket" }, { from: "basket", to: "sepakbola" }],
    },
    // ===== LEVEL 5: ORGANISASI =====
    {
        id: 5, title: "Organisasi & Pulang", subtitle: "Menunjukkan jiwa kepemimpinan dan tanggung jawab!", emoji: "🏛️", color: "#e11d48",
        locations: [
            {
                id: "osis", name: "Ruang OSIS", emoji: "🎖️", color: "#e11d48", description: "Markas organisasi siswa", x: 15, y: 30,
                scenarios: [{
                    situation: "Rapat OSIS membahas acara besar. Ada 2 ide berbeda yang sama-sama bagus, tapi anggota mulai memihak dan debatnya panas.",
                    category: "Communication",
                    choices: [
                        { text: "Usulkan voting adil dan ajak semua mendengarkan kedua ide dulu", effects: { communication: 3, respect: 3, teamwork: 2 }, feedback: "Mediator yang hebat! Kamu menjaga demokrasi dan keharmonisan.", quality: "best" },
                        { text: "Pilih salah satu ide tanpa banyak bicara", effects: { communication: -1 }, feedback: "Keputusan terburu-buru bisa memecah tim.", quality: "good" },
                        { text: "Bilang dua-duanya jelek dan usulkan idemu sendiri", effects: { respect: -3, communication: -2, teamwork: -2 }, feedback: "Itu sangat tidak menghargai usaha teman-temanmu.", quality: "bad" },
                    ]
                }]
            },
            {
                id: "kesiswaan", name: "Ruang Kesiswaan", emoji: "📝", color: "#7c3aed", description: "Urusan kesiswaan dan BK", x: 40, y: 20,
                scenarios: [{
                    situation: "Kamu dipanggil ke kesiswaan karena ada laporan bahwa kamu terlibat dalam keributan kemarin. Padahal kamu hanya saksi.",
                    category: "Discipline",
                    choices: [
                        { text: "Jelaskan dengan tenang, kronologis, dan jujur apa yang terjadi", effects: { discipline: 3, communication: 3, respect: 1 }, feedback: "Tenang dan jujur di bawah tekanan. Karakter yang kuat!", quality: "best" },
                        { text: "Bilang kamu tidak tahu apa-apa", effects: { discipline: -1, communication: -2 }, feedback: "Menyembunyikan informasi bisa memperpanjang masalah.", quality: "bad" },
                        { text: "Ceritakan tapi sambil menyalahkan pihak lain berlebihan", effects: { respect: -2, communication: -1 }, feedback: "Jujur itu penting, tapi harus adil ke semua pihak.", quality: "good" },
                    ]
                }]
            },
            {
                id: "tu", name: "Tata Usaha", emoji: "🏢", color: "#0ea5e9", description: "Administrasi sekolah", x: 65, y: 30,
                scenarios: [{
                    situation: "Kamu diminta mengambil surat untuk wali kelasmu. Petugas TU sedang sibuk melayani orang tua siswa.",
                    category: "Respect",
                    choices: [
                        { text: "Tunggu dengan sabar sampai petugas selesai, lalu minta dengan sopan", effects: { respect: 3, discipline: 2 }, feedback: "Sabar dan sopan! Petugas TU pasti senang dilayani siswa sepertimu.", quality: "best" },
                        { text: "Bilang 'permisi' dan langsung minta suratnya", effects: { respect: 1 }, feedback: "Sopan, tapi lebih baik tunggu giliranmu.", quality: "good" },
                        { text: "Langsung minta dengan nada tidak sabar", effects: { respect: -3, communication: -1 }, feedback: "Semua orang punya prioritas. Bersabar itu bentuk respect.", quality: "bad" },
                    ]
                }]
            },
        ],
        paths: [{ from: "osis", to: "kesiswaan" }, { from: "kesiswaan", to: "tu" }],
    },
];

export function getGrade(total: number): { grade: string; emoji: string; title: string; desc: string; color: string } {
    if (total >= 55) return { grade: "S", emoji: "👑", title: "Siswa Moklet Teladan", desc: "Kamu contoh sempurna budaya ATTITUDE!", color: "#f59e0b" };
    if (total >= 45) return { grade: "A", emoji: "🌟", title: "Role Model Hebat", desc: "Sikapmu menginspirasi banyak orang di sekolah!", color: "#22c55e" };
    if (total >= 35) return { grade: "B", emoji: "💪", title: "Terus Berkembang", desc: "Kamu di jalur yang benar. Terus tingkatkan!", color: "#3b82f6" };
    if (total >= 25) return { grade: "C", emoji: "📚", title: "Perlu Belajar Lagi", desc: "Masih banyak yang bisa diperbaiki, semangat!", color: "#f59e0b" };
    return { grade: "D", emoji: "⚠️", title: "Harus Lebih Baik", desc: "Yuk introspeksi dan mulai perbaikan dari hal kecil.", color: "#ef4444" };
}
