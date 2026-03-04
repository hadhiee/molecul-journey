export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface ContentSection {
    title: string;
    icon: string;
    body: string;
}

export interface MoleshSession {
    id: number;
    title: string;
    subtitle: string;
    pilar: string;
    pilarColor: string;
    pilarBg: string;
    emoji: string;
    duration: string;
    objective: string;
    intro: string;
    sections: ContentSection[];
    activity: {
        title: string;
        description: string;
        icon: string;
    };
    closing: string;
    quiz: QuizQuestion[];
    xpReward: number;
}

export const MOLESH_SESSIONS: MoleshSession[] = [
    {
        id: 1,
        title: "Neuroplastisitas & Potensi Diri",
        subtitle: "Otakmu Bisa Diupgrade Seperti Software",
        pilar: "SADARI",
        pilarColor: "#2563eb",
        pilarBg: "#dbeafe",
        emoji: "🧠",
        duration: "30-45 menit",
        objective: "Siswa memahami bahwa otak manusia mampu berubah dan berkembang (neuroplastisitas), sehingga potensi diri tidak terbatas pada bakat bawaan.",
        intro: "Tahukah kamu? Otakmu bekerja seperti sistem operasi yang terus menerima update. Setiap kali kamu belajar hal baru — entah itu bahasa pemrograman, konfigurasi jaringan, atau skill baru lainnya — otak membentuk koneksi saraf baru. Ini disebut NEUROPLASTISITAS.",
        sections: [
            {
                title: "Otak = CPU yang Bisa Di-Overclock",
                icon: "⚡",
                body: "Otak manusia memiliki sekitar 86 miliar neuron. Setiap kali kamu latihan coding atau troubleshooting jaringan, koneksi antar neuron (sinaps) menguat. Ini seperti bandwidth yang semakin besar — semakin sering dipakai, semakin cepat.\n\nNeuroplastisitas membuktikan bahwa TIDAK ADA yang namanya 'tidak berbakat'. Yang ada hanyalah 'belum cukup latihan'. Otak kamu literally berubah secara fisik setiap kali kamu belajar."
            },
            {
                title: "Prefrontal Cortex vs Amigdala",
                icon: "🎯",
                body: "Di balik dahimu ada Prefrontal Cortex — bagian otak untuk berpikir logis, membuat keputusan, dan menunda gratifikasi (seperti menahan diri untuk tidak buka sosmed saat coding).\n\nDi sisi lain, ada Amigdala — pusat emosi dan reaksi 'fight or flight'. Ketika kamu panik saat presentasi atau marah saat kode error, itu Amigdala yang mengambil alih.\n\nPemimpin sejati belajar mengaktifkan Prefrontal Cortex dan 'meng-handle' Amigdala. Ini bisa dilatih!"
            },
            {
                title: "Myelin: Semakin Diulang, Semakin Cepat",
                icon: "🔄",
                body: "Myelin adalah lapisan pelindung di serabut saraf yang membuat sinyal otak bergerak lebih cepat. Semakin sering kamu mengulang sebuah skill, semakin tebal myelin-nya.\n\nItulah mengapa programmer senior bisa mengetik kode tanpa berpikir keras — bukan karena jenius bawaan, tapi karena myelin yang sudah tebal akibat ribuan jam latihan. Ini berlaku untuk SEMUA skill."
            }
        ],
        activity: {
            title: "Brain Mapping Exercise",
            description: "Gambarlah 'peta otak' kamu: tulis 3 skill yang sudah kamu kuasai di tengah, lalu hubungkan dengan skill baru yang ingin kamu pelajari. Bayangkan koneksi neuron baru yang akan terbentuk!",
            icon: "🗺️"
        },
        closing: "Ingat: setiap kali kamu merasa 'susah', itu tandanya otakmu sedang membentuk koneksi baru. Rasa susah = proses upgrade sedang berjalan. Jangan berhenti di tengah jalan!",
        quiz: [
            {
                id: "s1q1",
                question: "Apa yang dimaksud dengan neuroplastisitas?",
                options: [
                    "Kemampuan otak untuk menyimpan data seperti hard drive",
                    "Kemampuan otak untuk berubah dan membentuk koneksi baru sepanjang hidup",
                    "Kemampuan otak untuk bekerja tanpa istirahat",
                    "Kemampuan otak untuk menghafal semua pelajaran"
                ],
                correctIndex: 1,
                explanation: "Neuroplastisitas adalah kemampuan otak untuk berubah struktur dan fungsinya, membentuk koneksi saraf (sinaps) baru setiap kali kita belajar hal baru."
            },
            {
                id: "s1q2",
                question: "Bagian otak mana yang bertanggung jawab untuk berpikir logis dan membuat keputusan?",
                options: [
                    "Amigdala",
                    "Hipotalamus",
                    "Prefrontal Cortex",
                    "Cerebellum"
                ],
                correctIndex: 2,
                explanation: "Prefrontal Cortex terletak di belakang dahi dan bertanggung jawab untuk berpikir logis, perencanaan, dan pengambilan keputusan."
            },
            {
                id: "s1q3",
                question: "Apa fungsi myelin dalam proses belajar?",
                options: [
                    "Menghapus koneksi saraf yang tidak dipakai",
                    "Memperlambat sinyal otak agar lebih akurat",
                    "Membuat sinyal otak bergerak lebih cepat saat skill diulang-ulang",
                    "Menambah jumlah neuron di otak"
                ],
                correctIndex: 2,
                explanation: "Myelin mempercepat transmisi sinyal saraf. Semakin sering skill dilatih, semakin tebal myelin-nya, sehingga skill tersebut semakin otomatis dan cepat."
            },
            {
                id: "s1q4",
                question: "Ketika kamu merasa frustrasi saat belajar coding yang sulit, apa yang sebenarnya terjadi di otakmu?",
                options: [
                    "Otakmu sudah mencapai batas kapasitas",
                    "Kamu tidak cocok menjadi programmer",
                    "Otakmu sedang membentuk koneksi saraf baru (proses upgrade)",
                    "Otakmu sedang error dan perlu restart"
                ],
                correctIndex: 2,
                explanation: "Rasa frustasi saat belajar hal baru adalah pertanda bahwa otak sedang aktif membangun koneksi baru. Ini adalah proses neuroplastisitas yang normal dan positif."
            },
            {
                id: "s1q5",
                question: "Dalam konteks IT, neuroplastisitas bisa dianalogikan dengan...",
                options: [
                    "Hard drive yang penuh dan perlu di-format",
                    "Software yang bisa di-update dan di-upgrade secara berkala",
                    "Virus yang menyebar di jaringan",
                    "Komputer lama yang tidak bisa upgrade"
                ],
                correctIndex: 1,
                explanation: "Seperti software yang terus menerima update, otak kita terus berubah dan berkembang setiap kali kita belajar — tidak ada kata terlambat untuk upgrade!"
            }
        ],
        xpReward: 100
    },

    {
        id: 2,
        title: "Personal Branding & Growth Mindset",
        subtitle: "The Debugging Mindset",
        pilar: "SADARI",
        pilarColor: "#2563eb",
        pilarBg: "#dbeafe",
        emoji: "🐛",
        duration: "30-45 menit",
        objective: "Siswa mampu memetakan potensi diri dan mengelola hambatan mental dalam belajar teknologi.",
        intro: "Di dunia IT, menemukan bug bukan berarti kamu programmer yang buruk — justru itu artinya kamu sedang debugging, dan itu adalah proses belajar paling berharga. Sama seperti kehidupan: error dan kegagalan adalah DATA, bukan identitas diri.",
        sections: [
            {
                title: "The Debugging Mindset",
                icon: "🔍",
                body: "Ketika kode error, programmer tidak berkata 'Saya gagal.' Programmer berkata 'Ada bug yang perlu diperbaiki.'\n\nCoba terapkan ini di kehidupan:\n• Nilai jelek? → Bug di metode belajar, bukan bug di dirimu.\n• Gagal presentasi? → Error di persiapan, bisa di-debug.\n• Ditolak lomba? → Return value bukan yang diharapkan, coba input lain.\n\nMenganggap kegagalan sebagai DATA membantumu tetap objektif dan tidak menyerah."
            },
            {
                title: "Fixed vs Growth Mindset di IT",
                icon: "🌱",
                body: "FIXED MINDSET: 'Saya memang tidak berbakat coding / networking.'\nGROWTH MINDSET: 'Saya BELUM menguasai coding / networking.'\n\nKata kunci: BELUM. Ini bukan sekadar optimisme kosong — ini didukung oleh neuroscience (myelin dan neuroplastisitas dari Sesi 1).\n\nContoh nyata:\n• Linus Torvalds tidak langsung mahir membuat Linux.\n• Mark Zuckerberg belajar coding dari nol di kamar asrama.\n• Bug pertama dalam sejarah komputer ditemukan oleh Grace Hopper — dan dia bangga menemukannya!"
            },
            {
                title: "Personal SWOT untuk Siswa IT SMK",
                icon: "📊",
                body: "SWOT Analysis bukan hanya untuk bisnis — ini alat powerful untuk mengenal dirimu:\n\n💪 STRENGTH: Apa yang sudah kamu kuasai? (Python? HTML? Cisco? Mikrotik?)\n⚠️ WEAKNESS: Apa yang masih harus diperbaiki? (Manajemen waktu? Debugging? Dokumentasi?)\n🚀 OPPORTUNITY: Peluang apa yang bisa kamu manfaatkan? (Lomba? Sertifikasi? Magang?)\n🛑 THREAT: Hambatan apa yang mengancam? (Distraksi? Prokrastinasi? Kurang praktek?)\n\nKejujuran dalam SWOT = SADARI yang sesungguhnya."
            }
        ],
        activity: {
            title: "Readme.md Diri Sendiri",
            description: "Seperti sebuah repository di GitHub, buatlah README.md tentang dirimu:\n\n# [Nama Kamu]\n## About\n[Deskripsi singkat tentang dirimu]\n## Skills\n- [Skill 1]\n- [Skill 2]\n## Currently Learning\n- [Yang sedang dipelajari]\n## Bug to Fix\n- [Satu kelemahan yang ingin diperbaiki]\n## How to Reach Me\n- [Kontak / sosmed]",
            icon: "📝"
        },
        closing: "Kejujuran pada diri sendiri adalah langkah pertama menuju pertumbuhan. Readme.md kamu bukan dokumen final — ini living document yang terus di-update, sama seperti dirimu.",
        quiz: [
            {
                id: "s2q1",
                question: "Apa perbedaan utama antara Fixed Mindset dan Growth Mindset?",
                options: [
                    "Fixed Mindset selalu optimis, Growth Mindset realistis",
                    "Fixed Mindset percaya kemampuan tetap, Growth Mindset percaya kemampuan bisa dikembangkan",
                    "Fixed Mindset untuk networking, Growth Mindset untuk coding",
                    "Tidak ada perbedaan, hanya istilah berbeda"
                ],
                correctIndex: 1,
                explanation: "Fixed Mindset menganggap kemampuan bersifat tetap (bakat), sedangkan Growth Mindset percaya bahwa kemampuan bisa dikembangkan melalui usaha dan latihan."
            },
            {
                id: "s2q2",
                question: "Dalam Debugging Mindset, kegagalan dianggap sebagai...",
                options: [
                    "Bukti ketidakmampuan",
                    "Hal yang harus disembunyikan",
                    "Data yang bisa dianalisis untuk perbaikan",
                    "Alasan untuk menyerah"
                ],
                correctIndex: 2,
                explanation: "Debugging Mindset menganggap kegagalan sebagai data — informasi berharga yang bisa dianalisis untuk menemukan solusi, bukan sebagai cerminan identitas diri."
            },
            {
                id: "s2q3",
                question: "Dalam analisis SWOT, 'Malas dokumentasi kode' termasuk kategori...",
                options: [
                    "Strength",
                    "Weakness",
                    "Opportunity",
                    "Threat"
                ],
                correctIndex: 1,
                explanation: "Malas dokumentasi adalah kelemahan (Weakness) personal yang perlu diperbaiki — dan menyadari ini adalah langkah pertama pilar SADARI."
            },
            {
                id: "s2q4",
                question: "Mengapa membuat 'README.md Diri Sendiri' penting untuk personal branding?",
                options: [
                    "Karena bisa dapat banyak followers di GitHub",
                    "Karena membantu memetakan skill, nilai diri, dan arah pengembangan secara jujur",
                    "Karena guru menyuruhnya",
                    "Karena bisa mendapat nilai bagus"
                ],
                correctIndex: 1,
                explanation: "README.md diri sendiri membantu memetakan kompetensi secara jujur, mengenali area pengembangan, dan menentukan arah pertumbuhan — inti dari pilar SADARI."
            },
            {
                id: "s2q5",
                question: "Kalimat mana yang mencerminkan Growth Mindset?",
                options: [
                    "Saya memang tidak cocok jadi programmer",
                    "Saya tidak pernah bisa memahami jaringan",
                    "Saya belum menguasai React, tapi saya sedang belajar",
                    "Coding itu hanya untuk orang jenius"
                ],
                correctIndex: 2,
                explanation: "Kata kunci 'BELUM' menunjukkan Growth Mindset — percaya bahwa kemampuan bisa dikembangkan melalui proses belajar yang berkelanjutan."
            }
        ],
        xpReward: 100
    },

    {
        id: 3,
        title: "Kolaborasi dalam Tim (Scrum & Peer Review)",
        subtitle: "Code Review dengan Empati",
        pilar: "PEDULI",
        pilarColor: "#059669",
        pilarBg: "#d1fae5",
        emoji: "🤝",
        duration: "30-45 menit",
        objective: "Membangun empati dalam bekerja sama di proyek teknis.",
        intro: "Software hebat tidak dibuat oleh satu orang jenius — tapi oleh TIM yang saling peduli. Google menemukan bahwa faktor #1 tim berkinerja tinggi bukan kecerdasan individu, tapi PSYCHOLOGICAL SAFETY — rasa aman untuk bertanya tanpa takut dianggap bodoh.",
        sections: [
            {
                title: "Code/Job Review dengan Empati",
                icon: "💬",
                body: "Teknik Sandwich Feedback — cara memberi masukan tanpa menjatuhkan:\n\n🍞 ROTI ATAS (Pujian): 'Logika loop-mu sudah bagus dan efisien.'\n🥩 ISI (Saran): 'Mungkin bisa ditambahkan error handling di sini untuk antisipasi input null.'\n🍞 ROTI BAWAH (Dorongan): 'Secara keseluruhan, kode ini solid. Keep it up!'\n\nBandingkan dengan: 'Kode lu berantakan, banyak bug.' → Ini BUKAN code review, ini cyber-bullying.\n\nDi dunia profesional, kemampuan memberi feedback yang konstruktif adalah SKILL yang sangat dihargai."
            },
            {
                title: "Psychological Safety dalam Tim",
                icon: "🛡️",
                body: "Project Aristotle dari Google menemukan bahwa TIM TERBAIK adalah tim di mana:\n\n✅ Anggota berani bertanya tanpa takut dianggap bodoh\n✅ Kesalahan dijadikan pelajaran, bukan bahan bully\n✅ Setiap anggota merasa suaranya didengar\n✅ Konflik diselesaikan secara dewasa, bukan dengan drama\n\nSebagai siswa IT, ini relevan banget:\n• Sprint meeting di Scrum → Semua punya hak bicara\n• Stand-up daily → Update progres tanpa judgment\n• Retrospective → Evaluasi proses, bukan menyalahkan orang"
            },
            {
                title: "Listening as a Leader",
                icon: "👂",
                body: "Mendengar ≠ Menunggu giliran bicara.\n\nDalam konteks IT:\n• UX Designer mendengar user SEBELUM mendesain interface\n• Network Admin mendengar keluhan user SEBELUM konfigurasi\n• Project Manager mendengar tim SEBELUM menentukan deadline\n\nTeknik Active Listening:\n1. 👀 Kontak mata / perhatian penuh\n2. 🔄 Paraphrase: 'Jadi maksudmu...'\n3. ❓ Tanya klarifikasi: 'Bisa jelaskan lebih detail?'\n4. ✋ Tahan judgment sampai mereka selesai bicara\n\nSoftware dan jaringan dibuat oleh manusia, untuk manusia. Peduli pada rekan tim = peduli pada kualitas produk."
            }
        ],
        activity: {
            title: "Simulasi Peer Review",
            description: "Berpasangan dengan teman, periksa hasil pekerjaan mereka (kode, desain jaringan, atau tugas apapun). Berikan feedback menggunakan teknik Sandwich:\n1. Satu hal yang kamu puji\n2. Satu saran perbaikan yang sopan\n3. Satu kata motivasi",
            icon: "🔄"
        },
        closing: "Software dibuat oleh manusia untuk manusia. Ketika kita peduli pada proses dan orang-orang di dalamnya, hasilnya selalu lebih baik.",
        quiz: [
            {
                id: "s3q1",
                question: "Apa urutan yang benar dalam teknik Sandwich Feedback?",
                options: [
                    "Kritik → Pujian → Kritik",
                    "Pujian → Saran Perbaikan → Motivasi/Dorongan",
                    "Saran → Saran → Saran",
                    "Pujian → Pujian → Pujian"
                ],
                correctIndex: 1,
                explanation: "Sandwich Feedback: Awali dengan pujian (apa yang sudah bagus), berikan saran perbaikan spesifik, dan tutup dengan motivasi/dorongan positif."
            },
            {
                id: "s3q2",
                question: "Menurut Project Aristotle Google, faktor #1 tim berkinerja tinggi adalah...",
                options: [
                    "Kecerdasan individu anggota",
                    "Gaji yang tinggi",
                    "Psychological Safety — rasa aman untuk bertanya dan berbuat salah",
                    "Menggunakan teknologi terbaru"
                ],
                correctIndex: 2,
                explanation: "Google menemukan bahwa Psychological Safety — di mana setiap anggota merasa aman bertanya, mengambil risiko, dan membuat kesalahan — adalah prediktor terkuat kinerja tim."
            },
            {
                id: "s3q3",
                question: "Mana yang merupakan contoh Active Listening yang baik?",
                options: [
                    "Menyela pembicaraan karena sudah tahu jawabannya",
                    "Memparafrase: 'Jadi maksudmu masalahnya ada di server?'",
                    "Bermain HP sambil mendengarkan",
                    "Langsung memberi solusi tanpa bertanya lebih lanjut"
                ],
                correctIndex: 1,
                explanation: "Memparafrase menunjukkan bahwa kamu benar-benar mendengar dan memahami apa yang disampaikan — ini adalah inti dari Active Listening."
            },
            {
                id: "s3q4",
                question: "Dalam Scrum, kapan semua anggota tim punya hak bicara yang setara?",
                options: [
                    "Hanya saat demo ke klien",
                    "Hanya saat CTO hadir",
                    "Saat sprint meeting, daily standup, dan retrospective",
                    "Hanya di grup WhatsApp"
                ],
                correctIndex: 2,
                explanation: "Scrum dirancang agar semua anggota tim punya suara — di daily standup (update progres), sprint meeting (perencanaan), dan retrospective (evaluasi proses)."
            },
            {
                id: "s3q5",
                question: "Mengapa peduli pada rekan tim sama pentingnya dengan peduli pada kualitas kode?",
                options: [
                    "Karena bisa mendapat lebih banyak like di sosmed",
                    "Karena software dibuat oleh manusia untuk manusia — tim yang sehat menghasilkan produk yang berkualitas",
                    "Karena bisa menghindari lembur",
                    "Karena perusahaan mewajibkannya"
                ],
                correctIndex: 1,
                explanation: "Kualitas produk teknologi sangat bergantung pada kualitas kolaborasi tim yang membuatnya. Tim yang saling peduli menghasilkan komunikasi lebih baik, bug lebih sedikit, dan produk lebih berkualitas."
            }
        ],
        xpReward: 100
    },

    {
        id: 4,
        title: "Mengambil Keputusan & Etika Digital",
        subtitle: "Fail Fast, Learn Faster",
        pilar: "BERANI",
        pilarColor: "#dc2626",
        pilarBg: "#fee2e2",
        emoji: "⚡",
        duration: "30-45 menit",
        objective: "Melatih keberanian mengambil tanggung jawab dan menjaga integritas profesional.",
        intro: "Tahun 2017, seorang engineer di Equifax mengabaikan patch keamanan selama berbulan-bulan. Akibatnya? Data 147 juta orang bocor. Keberanian bukan hanya soal mengambil risiko — tapi juga soal berani bertanggung jawab dan berani menolak yang tidak etis.",
        sections: [
            {
                title: "Berani Gagal, Cepat Belajar",
                icon: "🚀",
                body: "Di Silicon Valley, ada prinsip: FAIL FAST, LEARN FASTER.\n\nMinimum Viable Product (MVP) = keberanian merilis produk yang belum sempurna untuk mendapatkan feedback nyata.\n\nContoh:\n• Instagram awalnya adalah aplikasi check-in bernama 'Burbn' — gagal, lalu pivot.\n• Slack awalnya adalah game online yang gagal — pivot jadi messaging app.\n• YouTube awalnya adalah situs kencan online — pivot jadi video platform.\n\nPelajaran: kegagalan bukan akhir. Kegagalan adalah data berharga yang mengarahkan ke kesuksesan. Tapi untuk gagal, kamu harus BERANI memulai dulu."
            },
            {
                title: "Integritas & Etika Digital",
                icon: "🔒",
                body: "Keberanian paling sulit bukan berani mengambil risiko — tapi BERANI MENOLAK tindakan tidak etis:\n\n❌ Diminta hack akun orang? BERANI bilang TIDAK.\n❌ Bisa copy-paste tugas dari internet? BERANI ngerjain sendiri.\n❌ Menemukan vulnerability di sistem sekolah? BERANI lapor ke admin, bukan exploit.\n❌ Diminta manipulasi data laporan? BERANI tolak.\n\nDi dunia IT, integritas adalah SEGALANYA. Satu pelanggaran etika bisa menghancurkan karier seumur hidup. Trust building butuh bertahun-tahun, tapi trust breaking hanya butuh satu klik."
            },
            {
                title: "Decision Making Berbasis Data",
                icon: "📈",
                body: "Pemimpin IT tidak mengambil keputusan berdasarkan perasaan — tapi berdasarkan DATA.\n\nFramework keputusan teknis:\n1. 📊 IDENTIFY: Apa masalahnya secara spesifik?\n2. 🔍 ANALYZE: Apa data yang tersedia? (log, metrics, feedback)\n3. 🎯 OPTIONS: Apa saja pilihan solusinya?\n4. ⚖️ EVALUATE: Risiko dan benefit masing-masing?\n5. ✅ DECIDE: Pilih dan tanggung jawab.\n6. 🔄 REVIEW: Evaluasi hasilnya.\n\nKeberanian bukan tentang asal nekat. Keberanian adalah mengambil keputusan sulit berdasarkan data terbaik yang tersedia, sambil siap bertanggung jawab atas hasilnya."
            }
        ],
        activity: {
            title: "The Hard Choice — Dilema Etika",
            description: "Diskusikan dalam kelompok kecil:\n\nSKENARIO: Deadline aplikasi klien besok pagi. Kamu menemukan bug serius yang bisa menyebabkan data user bocor. Fix butuh 3 hari lagi. Bos menyuruhmu deploy tanpa fix karena klien sudah bayar.\n\nApa yang kamu lakukan? Gunakan framework Decision Making untuk mengambil keputusan.",
            icon: "⚖️"
        },
        closing: "Keberanian adalah otot yang harus dilatih dari hal kecil. Berani jujur saat ujian → berani jujur saat bekerja → berani bertanggung jawab sebagai profesional.",
        quiz: [
            {
                id: "s4q1",
                question: "Apa yang dimaksud dengan prinsip 'Fail Fast, Learn Faster'?",
                options: [
                    "Sengaja membuat produk gagal agar bisa belajar",
                    "Berani merilis produk/ide, mendapatkan feedback nyata, dan cepat memperbaiki",
                    "Menyembunyikan kegagalan agar tidak ketahuan",
                    "Bekerja secepat mungkin tanpa peduli kualitas"
                ],
                correctIndex: 1,
                explanation: "Fail Fast, Learn Faster berarti berani mencoba, menerima feedback secepat mungkin dari dunia nyata, dan menggunakan data tersebut untuk perbaikan yang lebih cepat."
            },
            {
                id: "s4q2",
                question: "Kamu menemukan celah keamanan di website sekolah. Apa tindakan yang BERANI dan ETIS?",
                options: [
                    "Exploit celahnya untuk mendapat nilai bagus",
                    "Simpan informasinya untuk diri sendiri",
                    "Laporkan ke admin IT sekolah (responsible disclosure)",
                    "Posting di sosmed untuk mendapat viral"
                ],
                correctIndex: 2,
                explanation: "Responsible disclosure — melaporkan vulnerability kepada pihak yang berwenang — adalah tindakan berani DAN etis. Ini menunjukkan integritas profesional sejati."
            },
            {
                id: "s4q3",
                question: "Dalam framework Decision Making, langkah pertama yang harus dilakukan adalah...",
                options: [
                    "Langsung mengambil keputusan",
                    "Mengidentifikasi masalah secara spesifik",
                    "Bertanya ke ChatGPT",
                    "Menyerahkan keputusan ke orang lain"
                ],
                correctIndex: 1,
                explanation: "Langkah pertama adalah IDENTIFY — memahami dan mendefinisikan masalah secara spesifik sebelum mencari solusi."
            },
            {
                id: "s4q4",
                question: "Mengapa integritas sangat penting dalam karier IT?",
                options: [
                    "Karena bisa mendapat gaji lebih tinggi",
                    "Karena kepercayaan (trust) dibangun bertahun-tahun tapi bisa hancur dalam satu klik",
                    "Karena bos selalu mengawasi",
                    "Karena ada CCTV di kantor"
                ],
                correctIndex: 1,
                explanation: "Di dunia IT, kamu memegang akses ke data sensitif. Satu pelanggaran etika (data breach, hacking, manipulasi) bisa menghancurkan karier dan kepercayaan yang dibangun bertahun-tahun."
            },
            {
                id: "s4q5",
                question: "Dalam skenario 'deadline vs bug keamanan', pilihan yang tepat menurut prinsip BERANI adalah...",
                options: [
                    "Deploy saja, bos yang tanggung",
                    "Jujur komunikasikan risiko ke klien dan bos, minta tambahan waktu untuk fix",
                    "Keluar dari pekerjaan",
                    "Pura-pura tidak menemukan bug"
                ],
                correctIndex: 1,
                explanation: "BERANI dalam MOLESH berarti berani jujur dan bertanggung jawab. Mengkomunikasikan risiko secara transparan melindungi user, klien, dan integritasmu sebagai profesional."
            }
        ],
        xpReward: 100
    },

    {
        id: 5,
        title: "Kepemimpinan Organisasi",
        subtitle: "Situational Leadership & Conflict Resolution",
        pilar: "SADARI + PEDULI + BERANI",
        pilarColor: "#7c3aed",
        pilarBg: "#ede9fe",
        emoji: "👑",
        duration: "30-45 menit",
        objective: "Menerapkan pilar Sadari, Peduli, Berani dalam konteks OSIS, kelas, atau kepemimpinan proyek.",
        intro: "Seorang Project Manager di perusahaan IT bukan orang yang paling pintar coding — tapi orang yang paling bisa MEMIMPIN tim. Dan kepemimpinan yang efektif membutuhkan semua pilar MOLESH: Sadari situasi, Peduli pada tim, dan Berani mengambil keputusan.",
        sections: [
            {
                title: "Situational Leadership",
                icon: "🧭",
                body: "Tidak ada satu gaya kepemimpinan yang selalu benar. Pemimpin yang baik menyesuaikan gayanya:\n\n📋 DIRECTING (Instruktif): Untuk anggota baru yang belum punya skill.\n→ 'Pertama, install Node.js. Lalu buka terminal dan ketik npm init.'\n\n🤝 COACHING (Membimbing): Untuk yang sudah mulai paham tapi belum percaya diri.\n→ 'Coba kamu yang handle bagian backend. Kalau butuh bantuan, saya di sini.'\n\n💪 SUPPORTING (Mendukung): Untuk yang sudah mahir tapi kadang ragu.\n→ 'Keputusan arsitektur boleh kamu yang tentukan. Saya trust kamu.'\n\n🚀 DELEGATING (Mendelegasikan): Untuk yang sudah expert.\n→ 'Project ini kamu yang lead. Update saya setiap Jumat.'\n\nIntinya: SADARI level anggota tim, lalu sesuaikan pendekatan."
            },
            {
                title: "Conflict Resolution",
                icon: "🧘",
                body: "Konflik di tim itu NORMAL — yang berbahaya adalah konflik yang diabaikan.\n\nSaat menghadapi konflik, ingat:\n🧠 PREFRONTAL CORTEX vs AMIGDALA (dari Sesi 1)\n\nLangkah resolusi konflik:\n1. 🛑 PAUSE — Tahan reaksi emosional (aktifkan Prefrontal Cortex)\n2. 👂 LISTEN — Dengarkan semua pihak tanpa menghakimi (PEDULI)\n3. 🔍 IDENTIFY — Cari akar masalah, bukan gejalanya (SADARI)\n4. 🤝 COLLABORATE — Cari solusi bersama, bukan menang-kalah\n5. ✅ COMMIT — Sepakati solusi dan komitmen bersama (BERANI)\n\nContoh: Dua anggota tim berebut mengerjakan fitur yang sama → bukan tentang siapa yang benar, tapi bagaimana membagi task secara efisien."
            },
            {
                title: "Leading by Example",
                icon: "🌟",
                body: "Pemimpin adalah orang pertama yang melakukan apa yang dia minta orang lain lakukan:\n\n• Minta tim datang tepat waktu? → Kamu yang pertama datang.\n• Minta tim push code berkualitas? → Kamu yang pertama code review.\n• Minta tim jujur? → Kamu yang pertama mengakui kesalahan.\n• Minta tim berani speak up? → Kamu yang pertama mendengar tanpa judgment.\n\nKepemimpinan bukan titel. Ketua OSIS yang tidak memberi contoh BUKAN pemimpin. Anggota biasa yang memberi contoh ADALAH pemimpin.\n\nDalam istilah Git: pemimpin adalah orang yang berani melakukan 'first commit'."
            }
        ],
        activity: {
            title: "Roleplay: Pemimpin Tim",
            description: "Roleplay dalam kelompok 4 orang:\n\nSKENARIO: Kamu adalah ketua tim proyek aplikasi. Satu anggota tim selalu terlambat submit, satu lagi menolak ide orang lain, dan satu lagi diam saja tidak pernah bicara di meeting.\n\nTerapkan:\n• SADARI: Kontrol emosimu, pahami situasi masing-masing\n• PEDULI: Tanya kendala mereka secara personal\n• BERANI: Ambil keputusan tegas (reassign task, atur ground rules, atau beri konsekuensi)\n\nBergantian menjadi pemimpin!",
            icon: "🎭"
        },
        closing: "Kepemimpinan bukan tentang jabatan, tapi tentang pengaruh. Kamu tidak perlu jadi ketua OSIS untuk menjadi pemimpin — cukup mulai dari dirimu sendiri.",
        quiz: [
            {
                id: "s5q1",
                question: "Gaya kepemimpinan mana yang paling tepat untuk anggota tim yang sudah expert?",
                options: [
                    "Directing — memberikan instruksi detail",
                    "Coaching — membimbing langkah demi langkah",
                    "Delegating — memberikan kepercayaan penuh dan minta update berkala",
                    "Supporting — selalu mendampingi saat bekerja"
                ],
                correctIndex: 2,
                explanation: "Untuk anggota yang sudah expert, gaya Delegating paling tepat — berikan kepercayaan, beri otonomi, dan minta update secara berkala."
            },
            {
                id: "s5q2",
                question: "Langkah PERTAMA yang harus dilakukan saat menghadapi konflik di tim adalah...",
                options: [
                    "Langsung menegur yang salah",
                    "Melaporkan ke guru/atasan",
                    "PAUSE — tahan reaksi emosional, aktifkan Prefrontal Cortex",
                    "Mengabaikan konfliknya berharap selesai sendiri"
                ],
                correctIndex: 2,
                explanation: "Langkah pertama adalah PAUSE — menahan reaksi emosional agar bisa berpikir jernih menggunakan Prefrontal Cortex sebelum mengambil tindakan."
            },
            {
                id: "s5q3",
                question: "Apa makna 'Leading by Example' dalam konteks tim IT?",
                options: [
                    "Pemimpin harus mengerjakan semua tugas sendiri",
                    "Pemimpin melakukan duluan apa yang diminta dari orang lain",
                    "Pemimpin harus menunjukkan bahwa dia paling pintar",
                    "Pemimpin hanya memberi perintah tanpa terlibat"
                ],
                correctIndex: 1,
                explanation: "Leading by Example berarti pemimpin menjadi contoh pertama — datang tepat waktu, berani mengakui kesalahan, dan melakukan standar yang diminta dari tim."
            },
            {
                id: "s5q4",
                question: "Dalam Situational Leadership, kapan gaya 'Directing' paling tepat digunakan?",
                options: [
                    "Untuk anggota yang sudah expert",
                    "Untuk anggota baru yang belum punya skill",
                    "Untuk semua anggota di setiap situasi",
                    "Hanya saat deadline sudah dekat"
                ],
                correctIndex: 1,
                explanation: "Directing (instruktif) paling tepat untuk anggota baru yang belum memiliki skill dan pengetahuan. Mereka butuh instruksi yang jelas dan detail."
            },
            {
                id: "s5q5",
                question: "Pernyataan mana yang paling benar tentang kepemimpinan?",
                options: [
                    "Hanya ketua OSIS yang bisa disebut pemimpin",
                    "Kepemimpinan ditentukan oleh jabatan dan pangkat",
                    "Kepemimpinan bukan tentang jabatan, tapi tentang pengaruh dan contoh",
                    "Pemimpin harus selalu tegas dan tidak boleh mendengar pendapat orang lain"
                ],
                correctIndex: 2,
                explanation: "Kepemimpinan sejati bukan soal titel atau jabatan — siapapun yang memberi contoh dan pengaruh positif adalah pemimpin."
            }
        ],
        xpReward: 150
    },

    {
        id: 6,
        title: "Rencana Aksi Moklet Hebat",
        subtitle: "Personal Leadership Roadmap",
        pilar: "IMPLEMENTASI",
        pilarColor: "#f59e0b",
        pilarBg: "#fef3c7",
        emoji: "🗺️",
        duration: "30-45 menit",
        objective: "Merangkum seluruh materi menjadi komitmen nyata dan rencana aksi 3 bulan ke depan.",
        intro: "Kamu sudah belajar tentang otak yang bisa berubah (SADARI), empati dalam berkolaborasi (PEDULI), dan keberanian mengambil keputusan (BERANI). Sekarang saatnya mengubah pengetahuan menjadi AKSI NYATA.",
        sections: [
            {
                title: "Sustainability: Menjaga Konsistensi",
                icon: "🔋",
                body: "Motivasi itu seperti baterai — bisa habis. Yang membuat kamu terus maju bukan motivasi, tapi HABIT (kebiasaan).\n\nTips membangun kebiasaan MOLESH:\n\n⏰ TRIGGER: Set reminder harian untuk refleksi 5 menit\n🎯 ROUTINE: Lakukan satu aksi kecil MOLESH setiap hari\n🏆 REWARD: Celebrate setiap milestone kecil\n\nContoh:\n• Setiap pagi, tulis 1 hal yang kamu syukuri (SADARI)\n• Setiap minggu, bantu 1 teman memahami pelajaran (PEDULI)\n• Setiap bulan, coba 1 tantangan baru (BERANI)\n\nKonsistensi mengalahkan intensitas. 30 menit coding setiap hari > 7 jam marathon sekali seminggu."
            },
            {
                title: "Koneksi Antar Pilar",
                icon: "🔗",
                body: "Ketiga pilar MOLESH saling terhubung dan memperkuat:\n\n🧠 SADARI diri sendiri → membuatmu tahu kapasitas dan batasanmu\n↓\n💚 PEDULI pada orang lain → karena kamu tahu bahwa semua orang punya perjuangan masing-masing\n↓\n🔥 BERANI mengambil tindakan → karena kamu tahu tujuanmu dan kamu punya support system\n↓\n🔄 Kembali ke SADARI → refleksi atas tindakan yang sudah diambil\n\nIni bukan linear, tapi siklus yang terus berputar dan membuatmu semakin bertumbuh sebagai pemimpin."
            },
            {
                title: "Roadmap 3 Bulan",
                icon: "📅",
                body: "Saatnya membuat rencana nyata:\n\n🧠 SADARI — BULAN 1:\nPilih SATU skill baru yang akan kamu pelajari secara mandiri.\nContoh: Belajar React, Python, Cloud Computing, atau UI/UX Design.\nTarget: minimal 30 menit per hari, dokumentasikan progres.\n\n💚 PEDULI — BULAN 2:\nLakukan SATU bantuan nyata untuk adik kelas atau teman sebaya.\nContoh: Mengajar coding dasar, membantu troubleshoot jaringan, atau membuat tutorial.\nTarget: share pengetahuanmu minimal sekali seminggu.\n\n🔥 BERANI — BULAN 3:\nAmbil SATU tantangan besar.\nContoh: Ikut lomba, ambil sertifikasi, melamar magang, atau buat proyek open source.\nTarget: submit atau daftar sebelum bulan berakhir.\n\nINGAT: Rencana tanpa aksi = wishful thinking. Aksi tanpa rencana = buang energi."
            }
        ],
        activity: {
            title: "Personal Leadership Roadmap",
            description: "Buat rencana aksi personalmu dalam format berikut:\n\n📋 NAMA: [Namamu]\n📅 PERIODE: [3 bulan ke depan]\n\n🧠 SADARI (Bulan 1):\n- Skill yang akan dipelajari: ___\n- Target harian: ___\n- Cara mengukur progres: ___\n\n💚 PEDULI (Bulan 2):\n- Bantuan yang akan diberikan: ___\n- Target mingguan: ___\n- Siapa yang akan dibantu: ___\n\n🔥 BERANI (Bulan 3):\n- Tantangan yang akan diambil: ___\n- Deadline: ___\n- Langkah pertama: ___\n\nTuliskan dan share ke teman sebangku!",
            icon: "📝"
        },
        closing: "Saya Moklet. Saya SADARI potensi dan tanggung jawab saya. Saya PEDULI pada sesama dan lingkungan. Saya BERANI bertindak dengan integritas. Saya adalah pemimpin — dimulai dari diri sendiri, saat ini, di sini.",
        quiz: [
            {
                id: "s6q1",
                question: "Menurut materi MOLESH, apa yang lebih penting dari motivasi untuk menjaga konsistensi?",
                options: [
                    "Bakat alami",
                    "Dukungan orang tua",
                    "Habit (kebiasaan) yang dibangun secara bertahap",
                    "Menonton video motivasi setiap hari"
                ],
                correctIndex: 2,
                explanation: "Motivasi bersifat sementara seperti baterai yang bisa habis. HABIT (kebiasaan) yang dibangun secara bertahap adalah kunci konsistensi jangka panjang."
            },
            {
                id: "s6q2",
                question: "Bagaimana ketiga pilar MOLESH saling terhubung?",
                options: [
                    "Mereka terpisah dan tidak berhubungan",
                    "SADARI → PEDULI → BERANI → kembali ke SADARI (siklus)",
                    "Hanya BERANI yang penting, sisanya pelengkap",
                    "PEDULI paling penting, sisanya opsional"
                ],
                correctIndex: 1,
                explanation: "Ketiga pilar membentuk siklus: Sadari diri → Peduli pada orang lain → Berani bertindak → Refleksi kembali (Sadari). Siklus ini terus berputar membuatmu bertumbuh."
            },
            {
                id: "s6q3",
                question: "Dalam roadmap MOLESH, apa yang dilakukan di Bulan ke-3 (pilar BERANI)?",
                options: [
                    "Belajar skill baru secara mandiri",
                    "Membantu adik kelas atau teman sebaya",
                    "Mengambil tantangan besar (lomba, sertifikasi, magang, proyek)",
                    "Refleksi diri dan evaluasi"
                ],
                correctIndex: 2,
                explanation: "Bulan ke-3 difokuskan pada pilar BERANI — mengambil satu tantangan besar seperti ikut lomba, ambil sertifikasi, melamar magang, atau memulai proyek."
            },
            {
                id: "s6q4",
                question: "Mana statement yang BENAR tentang konsistensi dalam belajar?",
                options: [
                    "Marathon coding 10 jam sekali sebulan lebih efektif",
                    "Konsistensi mengalahkan intensitas — 30 menit setiap hari > 7 jam marathon seminggu sekali",
                    "Belajar hanya perlu dilakukan saat ada ujian",
                    "Konsistensi tidak penting selama kamu memiliki bakat"
                ],
                correctIndex: 1,
                explanation: "Konsistensi mengalahkan intensitas. Latihan rutin 30 menit setiap hari membangun myelin lebih efektif daripada marathon yang jarang dilakukan (sesuai neuroscience dari Sesi 1)."
            },
            {
                id: "s6q5",
                question: "Apa inti pesan dari seluruh kurikulum MOLESH?",
                options: [
                    "Siswa SMK harus menjadi programer terkenal",
                    "Hanya siswa pintar yang bisa menjadi pemimpin",
                    "Setiap siswa adalah pemimpin yang dimulai dari diri sendiri melalui Sadari, Peduli, dan Berani",
                    "Kepemimpinan hanya diperlukan di dunia kerja"
                ],
                correctIndex: 2,
                explanation: "Pesan inti MOLESH: setiap siswa Moklet adalah pemimpin yang dimulai dari menyadari potensi diri, peduli pada sesama, dan berani bertindak dengan integritas."
            }
        ],
        xpReward: 200
    }
];
