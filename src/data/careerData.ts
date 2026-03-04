export interface TechFact {
    fact: string;
    source?: string;
}

export interface CareerSkill {
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    description: string;
}

export interface CareerPath {
    id: string;
    title: string;
    subtitle: string;
    emoji: string;
    jurusan: ("RPL" | "TKJ" | "PG")[];
    category: string;
    salaryRange: string;
    demandLevel: "Sangat Tinggi" | "Tinggi" | "Menengah";
    demandColor: string;
    gradient: string;
    accentColor: string;
    description: string;
    whatYouDo: string[];
    skillsNeeded: CareerSkill[];
    techFacts: TechFact[];
    realCompanies: string[];
    learningPath: string[];
    xpReward: number;
}

export const CAREER_CATEGORIES = [
    { id: "software", label: "Software Engineering", icon: "💻", color: "#3b82f6", jurusan: "RPL" },
    { id: "network", label: "Network & Security", icon: "🌐", color: "#10b981", jurusan: "TKJ" },
    { id: "game", label: "Game Development", icon: "🎮", color: "#8b5cf6", jurusan: "PG" },
    { id: "emerging", label: "Emerging Tech", icon: "🚀", color: "#f59e0b", jurusan: "ALL" },
];

export const CAREER_PATHS: CareerPath[] = [
    // ===== RPL CAREERS =====
    {
        id: "fullstack-dev",
        title: "Full-Stack Developer",
        subtitle: "Menguasai Frontend & Backend",
        emoji: "🖥️",
        jurusan: ["RPL"],
        category: "software",
        salaryRange: "Rp 8-35 Juta/bulan",
        demandLevel: "Sangat Tinggi",
        demandColor: "#10b981",
        gradient: "linear-gradient(135deg, #1e3a5f, #2563eb)",
        accentColor: "#3b82f6",
        description: "Full-Stack Developer adalah software engineer yang menguasai baik sisi frontend (tampilan user) maupun backend (server, database, API). Mereka bisa membangun aplikasi secara end-to-end dari nol.",
        whatYouDo: [
            "Membangun tampilan website/aplikasi yang interaktif",
            "Merancang dan mengelola database",
            "Membuat API dan logic bisnis di server",
            "Deploy aplikasi ke cloud (AWS, GCP, Vercel)",
            "Berkolaborasi dengan designer dan product manager"
        ],
        skillsNeeded: [
            { name: "JavaScript/TypeScript", level: "advanced", description: "Bahasa utama web modern" },
            { name: "React / Next.js", level: "advanced", description: "Framework frontend paling populer" },
            { name: "Node.js / Python", level: "intermediate", description: "Backend runtime & bahasa" },
            { name: "PostgreSQL / MongoDB", level: "intermediate", description: "Database relasional & NoSQL" },
            { name: "Git & DevOps", level: "intermediate", description: "Version control & deployment" },
        ],
        techFacts: [
            { fact: "JavaScript adalah bahasa pemrograman paling populer di dunia selama 11 tahun berturut-turut (Stack Overflow Survey 2024)." },
            { fact: "Next.js (yang dipakai MoLeCul ini!) dibuat oleh Vercel dan digunakan oleh Netflix, TikTok, dan Nike." },
            { fact: "Rata-rata Full-Stack Developer senior di Silicon Valley menghasilkan $150,000-$250,000 per tahun (~Rp 2.3-3.8 Miliar)." },
            { fact: "GitHub memiliki lebih dari 100 juta developer terdaftar — dan 90% repository aktif menggunakan JavaScript." },
            { fact: "Framework React diciptakan oleh Meta (Facebook) pada 2013 dan kini digunakan oleh 40% website di seluruh dunia." },
        ],
        realCompanies: ["Tokopedia", "Gojek", "Traveloka", "Google", "Meta", "Vercel"],
        learningPath: [
            "HTML, CSS, JavaScript dasar",
            "React.js & komponen UI",
            "Node.js & Express API",
            "Database (PostgreSQL/MongoDB)",
            "Next.js Full-Stack",
            "Cloud Deployment & DevOps"
        ],
        xpReward: 25,
    },
    {
        id: "mobile-dev",
        title: "Mobile App Developer",
        subtitle: "Membangun Aplikasi iOS & Android",
        emoji: "📱",
        jurusan: ["RPL"],
        category: "software",
        salaryRange: "Rp 8-30 Juta/bulan",
        demandLevel: "Sangat Tinggi",
        demandColor: "#10b981",
        gradient: "linear-gradient(135deg, #1a1145, #7c3aed)",
        accentColor: "#8b5cf6",
        description: "Mobile Developer merancang dan membangun aplikasi untuk smartphone. Dengan 6.8 miliar pengguna smartphone di dunia, karier ini sangat menjanjikan. Bisa menggunakan native (Swift/Kotlin) atau cross-platform (Flutter/React Native).",
        whatYouDo: [
            "Membangun aplikasi mobile untuk iOS dan Android",
            "Mengintegrasikan API dan layanan cloud",
            "Mendesain UI/UX yang responsif untuk layar kecil",
            "Mengoptimasi performa dan battery usage",
            "Publish dan maintain app di App Store / Play Store"
        ],
        skillsNeeded: [
            { name: "Flutter / Dart", level: "advanced", description: "Cross-platform framework by Google" },
            { name: "React Native", level: "intermediate", description: "Cross-platform dengan JavaScript" },
            { name: "Kotlin (Android)", level: "intermediate", description: "Bahasa native Android modern" },
            { name: "Swift (iOS)", level: "intermediate", description: "Bahasa native Apple" },
            { name: "Firebase / Supabase", level: "intermediate", description: "Backend-as-a-Service" },
        ],
        techFacts: [
            { fact: "Ada 8.93 juta aplikasi mobile di seluruh app store dunia (2024). Google Play Store saja memiliki 3.5 juta app." },
            { fact: "Flutter oleh Google bisa membuat 1 codebase untuk iOS, Android, Web, dan Desktop sekaligus." },
            { fact: "Industri aplikasi mobile menghasilkan revenue $935 miliar di tahun 2023 — lebih besar dari PDB Thailand." },
            { fact: "WhatsApp awalnya dibuat oleh hanya 2 developer, lalu dibeli Facebook seharga $19 miliar (Rp 292 Triliun)." },
            { fact: "Rata-rata orang Indonesia menghabiskan 5.5 jam per hari di smartphone — artinya ada peluang besar bagi mobile developer!" },
        ],
        realCompanies: ["Gojek", "Tokopedia", "Grab", "Traveloka", "Shopee", "Apple"],
        learningPath: [
            "Dart & Flutter basics",
            "Widgets & State Management",
            "API Integration & HTTP",
            "Local Storage & SQLite",
            "Firebase Authentication & Firestore",
            "Publishing ke Play Store / App Store"
        ],
        xpReward: 25,
    },
    {
        id: "ui-ux-designer",
        title: "UI/UX Designer",
        subtitle: "Merancang Pengalaman Digital",
        emoji: "🎨",
        jurusan: ["RPL", "PG"],
        category: "software",
        salaryRange: "Rp 7-25 Juta/bulan",
        demandLevel: "Tinggi",
        demandColor: "#f59e0b",
        gradient: "linear-gradient(135deg, #831843, #ec4899)",
        accentColor: "#ec4899",
        description: "UI/UX Designer menggabungkan psikologi, seni, dan teknologi untuk menciptakan produk digital yang indah dan mudah digunakan. UI (User Interface) fokus pada tampilan, UX (User Experience) fokus pada kenyamanan pengguna.",
        whatYouDo: [
            "Riset kebutuhan pengguna (user research)",
            "Membuat wireframe, mockup, dan prototipe",
            "Mendesain komponen UI yang konsisten (design system)",
            "Menguji desain dengan real user (usability testing)",
            "Berkolaborasi erat dengan frontend developer"
        ],
        skillsNeeded: [
            { name: "Figma", level: "advanced", description: "Tool desain kolaboratif #1" },
            { name: "Design Thinking", level: "advanced", description: "Framework pemecahan masalah kreatif" },
            { name: "Prototyping", level: "intermediate", description: "Membuat prototipe interaktif" },
            { name: "HTML/CSS dasar", level: "beginner", description: "Memahami implementasi teknis" },
            { name: "User Research", level: "intermediate", description: "Riset dan empati pengguna" },
        ],
        techFacts: [
            { fact: "Setiap $1 yang diinvestasikan dalam UX menghasilkan return $100 — ROI sebesar 9,900%. (Forrester Research)" },
            { fact: "Figma dibeli oleh Adobe seharga $20 miliar (Rp 308 Triliun) — membuat founder Dylan Field menjadi miliarder di usia 30." },
            { fact: "88% pengguna online tidak akan kembali ke website setelah pengalaman buruk (user experience). Desain = Bisnis." },
            { fact: "Apple menghabiskan $10 miliar per tahun untuk R&D desain produk. Steve Jobs berkata: 'Design is not just what it looks like. Design is how it works.'" },
            { fact: "Indonesia memiliki lebih dari 2,000 startup tech aktif — semuanya butuh UI/UX designer!" },
        ],
        realCompanies: ["Tokopedia", "Gojek", "Bukalapak", "Apple", "Google", "Figma"],
        learningPath: [
            "Prinsip desain visual & tipografi",
            "Figma dari nol sampai mahir",
            "Design Thinking & User Research",
            "Wireframing & Prototyping",
            "Design System & Component Library",
            "Portfolio & Case Study"
        ],
        xpReward: 25,
    },

    // ===== TKJ CAREERS =====
    {
        id: "cyber-security",
        title: "Cyber Security Engineer",
        subtitle: "Penjaga Benteng Digital",
        emoji: "🛡️",
        jurusan: ["TKJ"],
        category: "network",
        salaryRange: "Rp 10-45 Juta/bulan",
        demandLevel: "Sangat Tinggi",
        demandColor: "#10b981",
        gradient: "linear-gradient(135deg, #0f2027, #203a43)",
        accentColor: "#10b981",
        description: "Cyber Security Engineer melindungi infrastruktur digital dari serangan hacker, malware, dan ancaman siber lainnya. Dengan meningkatnya serangan siber global, profesi ini sangat dibutuhkan dan bergaji tinggi.",
        whatYouDo: [
            "Melakukan penetration testing (ethical hacking)",
            "Menganalisis threat & vulnerability sistem",
            "Mengkonfigurasi firewall, IDS/IPS, dan SIEM",
            "Merespons insiden keamanan siber",
            "Membuat kebijakan keamanan (security policy)"
        ],
        skillsNeeded: [
            { name: "Linux & Networking", level: "advanced", description: "Fondasi wajib keamanan siber" },
            { name: "Penetration Testing", level: "advanced", description: "Kali Linux, Metasploit, Burp Suite" },
            { name: "SIEM & SOC", level: "intermediate", description: "Security monitoring & incident response" },
            { name: "Python Scripting", level: "intermediate", description: "Automasi tugas keamanan" },
            { name: "Sertifikasi (CEH/CompTIA)", level: "intermediate", description: "Sertifikasi industri" },
        ],
        techFacts: [
            { fact: "Kerugian akibat cybercrime global mencapai $10.5 TRILIUN per tahun di 2025 — lebih besar dari PDB Jepang!" },
            { fact: "Ada 3.5 JUTA lowongan cyber security yang belum terisi di seluruh dunia. Demand jauh lebih tinggi dari supply." },
            { fact: "Rata-rata ethical hacker bersertifikat CEH menghasilkan $89,000/tahun (~Rp 1.3 Miliar). Bug bounty hunter top bisa dapat $500K+." },
            { fact: "Indonesia mengalami 1.2 miliar serangan siber di 2023. BSSN (Badan Siber) sangat membutuhkan talenta keamanan." },
            { fact: "Hacker usia 18 tahun berhasil menemukan bug di Tesla dan memenangkan $100,000 di kompetisi Pwn2Own." },
        ],
        realCompanies: ["BSSN", "Telkom Security", "CrowdStrike", "Palo Alto", "Microsoft Security", "Google Project Zero"],
        learningPath: [
            "Dasar jaringan (TCP/IP, OSI Model)",
            "Linux Administration",
            "Ethical Hacking & Kali Linux",
            "Web Application Security (OWASP)",
            "SOC Analysis & Incident Response",
            "Sertifikasi: CompTIA Security+ / CEH"
        ],
        xpReward: 25,
    },
    {
        id: "cloud-engineer",
        title: "Cloud Engineer",
        subtitle: "Arsitek Infrastruktur Awan",
        emoji: "☁️",
        jurusan: ["TKJ", "RPL"],
        category: "network",
        salaryRange: "Rp 12-40 Juta/bulan",
        demandLevel: "Sangat Tinggi",
        demandColor: "#10b981",
        gradient: "linear-gradient(135deg, #0c4a6e, #0ea5e9)",
        accentColor: "#0ea5e9",
        description: "Cloud Engineer merancang, mengelola, dan mengoptimasi infrastruktur di cloud platform seperti AWS, Google Cloud, dan Azure. Data menunjukkan 94% perusahaan sudah menggunakan cloud computing.",
        whatYouDo: [
            "Merancang arsitektur cloud (microservices, serverless)",
            "Mengelola server, storage, dan database di cloud",
            "Implementasi CI/CD pipeline untuk deployment otomatis",
            "Monitoring performa dan biaya cloud",
            "Menerapkan keamanan cloud (IAM, encryption)"
        ],
        skillsNeeded: [
            { name: "AWS / GCP / Azure", level: "advanced", description: "Platform cloud utama" },
            { name: "Docker & Kubernetes", level: "advanced", description: "Containerization & orchestration" },
            { name: "Linux & Bash", level: "intermediate", description: "Server administration" },
            { name: "Terraform / IaC", level: "intermediate", description: "Infrastructure as Code" },
            { name: "CI/CD (GitHub Actions)", level: "intermediate", description: "Deployment automation" },
        ],
        techFacts: [
            { fact: "Pasar cloud computing global bernilai $600+ miliar di 2024 dan tumbuh 20% setiap tahun. AWS saja menghasilkan $90 miliar setahun." },
            { fact: "Netflix menjalankan SELURUH platformnya di AWS cloud — melayani 260 juta pengguna di 190 negara tanpa server fisik sendiri." },
            { fact: "Google menjalankan lebih dari 1 MILIAR container per minggu menggunakan Kubernetes — yang awalnya adalah proyek internal bernama Borg." },
            { fact: "Rata-rata Cloud Architect bersertifikasi AWS Solutions Architect menghasilkan $140,000/tahun (~Rp 2.1 Miliar)." },
            { fact: "Indonesia termasuk salah satu pasar cloud yang tumbuh paling cepat di Asia Tenggara — Google, AWS, dan Azure semua membuka data center di sini." },
        ],
        realCompanies: ["AWS", "Google Cloud", "Microsoft Azure", "Alibaba Cloud", "Telkom Sigma", "Biznet Gio"],
        learningPath: [
            "Fundamental jaringan & Linux",
            "AWS / GCP Free Tier hands-on",
            "Docker & Containerization",
            "Kubernetes Basics",
            "Infrastructure as Code (Terraform)",
            "Sertifikasi: AWS Cloud Practitioner"
        ],
        xpReward: 25,
    },
    {
        id: "network-engineer",
        title: "Network Engineer",
        subtitle: "Membangun Jalan Tol Data",
        emoji: "🔌",
        jurusan: ["TKJ"],
        category: "network",
        salaryRange: "Rp 7-30 Juta/bulan",
        demandLevel: "Tinggi",
        demandColor: "#f59e0b",
        gradient: "linear-gradient(135deg, #064e3b, #059669)",
        accentColor: "#059669",
        description: "Network Engineer merancang, membangun, dan memelihara jaringan komputer yang menghubungkan jutaan perangkat. Tanpa mereka, internet tidak akan berfungsi.",
        whatYouDo: [
            "Merancang topologi jaringan (LAN/WAN/WLAN)",
            "Konfigurasi router, switch, dan firewall (Cisco/Mikrotik)",
            "Troubleshooting masalah konektivitas",
            "Implementasi VLAN, VPN, dan security jaringan",
            "Monitoring jaringan dan capacity planning"
        ],
        skillsNeeded: [
            { name: "TCP/IP & OSI Model", level: "advanced", description: "Fondasi jaringan" },
            { name: "Cisco IOS / Mikrotik", level: "advanced", description: "Konfigurasi perangkat jaringan" },
            { name: "Routing & Switching", level: "advanced", description: "OSPF, BGP, VLAN, STP" },
            { name: "Network Security", level: "intermediate", description: "Firewall, IDS, VPN" },
            { name: "Wireless (WiFi 6/7)", level: "intermediate", description: "Teknologi wireless terbaru" },
        ],
        techFacts: [
            { fact: "Internet global mentransmisikan 402.74 EXABYTE data PER HARI di 2024. 1 Exabyte = 1 miliar gigabyte. Network engineer memastikan ini berjalan lancar." },
            { fact: "Kabel laut (submarine cable) sepanjang 1.3 juta km menghubungkan seluruh benua. Jika direntangkan, bisa melilit bumi 32 kali!" },
            { fact: "WiFi 7 (2024) bisa mencapai kecepatan 46 Gbps — cukup cepat untuk download 1 film 4K dalam 0.5 detik." },
            { fact: "Mikrotik, perusahaan asal Latvia, perangkatnya digunakan oleh 60%+ ISP di Indonesia. Sertifikasi MTCNA sangat dihargai di industri lokal." },
            { fact: "Seorang Network Engineer di Indonesia dengan sertifikasi CCNP bisa menghasilkan Rp 15-35 Juta/bulan, bahkan lebih untuk CCIE." },
        ],
        realCompanies: ["Telkom Indonesia", "Indosat", "XL Axiata", "Cisco", "Biznet", "CBN Fiber"],
        learningPath: [
            "Dasar jaringan (IP addressing, subnetting)",
            "Cisco Packet Tracer / GNS3",
            "Routing protocols (OSPF, EIGRP)",
            "Switching (VLAN, STP, EtherChannel)",
            "Network Security & VPN",
            "Sertifikasi: CCNA / MTCNA"
        ],
        xpReward: 25,
    },

    // ===== PG CAREERS =====
    {
        id: "game-programmer",
        title: "Game Programmer",
        subtitle: "Menghidupkan Dunia Virtual",
        emoji: "🎮",
        jurusan: ["PG", "RPL"],
        category: "game",
        salaryRange: "Rp 8-35 Juta/bulan",
        demandLevel: "Tinggi",
        demandColor: "#f59e0b",
        gradient: "linear-gradient(135deg, #312e81, #6d28d9)",
        accentColor: "#7c3aed",
        description: "Game Programmer menulis kode yang menghidupkan game — dari fisika, AI musuh, multiplayer networking, hingga shader grafis. Industri gaming bernilai lebih dari industri film dan musik digabungkan.",
        whatYouDo: [
            "Programming game logic, AI, dan physics",
            "Bekerja dengan game engine (Unity/Unreal)",
            "Implementasi multiplayer dan networking",
            "Optimasi performa (FPS, memory management)",
            "Kolaborasi dengan artist, designer, dan audio"
        ],
        skillsNeeded: [
            { name: "C# (Unity)", level: "advanced", description: "Bahasa utama Unity Engine" },
            { name: "C++ (Unreal)", level: "advanced", description: "Bahasa performa tinggi untuk AAA" },
            { name: "Game Physics & Math", level: "intermediate", description: "Vektor, matrix, trigonometri" },
            { name: "Shader Programming", level: "intermediate", description: "HLSL/GLSL untuk grafis" },
            { name: "Version Control (Git)", level: "beginner", description: "Kolaborasi tim" },
        ],
        techFacts: [
            { fact: "Industri gaming global bernilai $187 MILIAR di 2024 — lebih besar dari industri film ($100B) dan musik ($26B) DIGABUNGKAN." },
            { fact: "GTA V telah menghasilkan $8.6 miliar sejak rilis — menjadikannya produk hiburan paling menguntungkan sepanjang sejarah." },
            { fact: "Unreal Engine 5 bisa merender 10 MILIAR poligon secara real-time berkat teknologi Nanite. Grafis game kini setara film CGI." },
            { fact: "Indonesia memiliki 200+ studio game aktif. Toge Productions dari Jakarta berhasil menjual game Coffee Talk ke seluruh dunia." },
            { fact: "Rata-rata gaji Game Programmer senior di perusahaan AAA seperti Rockstar atau Naughty Dog mencapai $120,000-$180,000/tahun." },
        ],
        realCompanies: ["Toge Productions", "Agate International", "Mojiken Studio", "Epic Games", "Riot Games", "miHoYo"],
        learningPath: [
            "C# Programming Basics",
            "Unity Engine Fundamentals",
            "2D & 3D Game Development",
            "Game Physics & AI",
            "Multiplayer & Networking",
            "Portfolio: Publish game ke Steam/itch.io"
        ],
        xpReward: 25,
    },
    {
        id: "game-artist",
        title: "Game Artist / 3D Artist",
        subtitle: "Menciptakan Visual Memukau",
        emoji: "🎨",
        jurusan: ["PG"],
        category: "game",
        salaryRange: "Rp 6-28 Juta/bulan",
        demandLevel: "Tinggi",
        demandColor: "#f59e0b",
        gradient: "linear-gradient(135deg, #701a75, #d946ef)",
        accentColor: "#d946ef",
        description: "Game Artist menciptakan semua visual dalam game — karakter, environment, UI, animasi, dan efek. Mereka bekerja dengan software 3D seperti Blender, Maya, dan ZBrush untuk menghidupkan dunia virtual.",
        whatYouDo: [
            "Membuat model 3D karakter dan environment",
            "Texturing dan material (PBR workflow)",
            "Rigging dan animasi karakter",
            "Membuat UI/HUD game",
            "Concept art dan visual development"
        ],
        skillsNeeded: [
            { name: "Blender / Maya", level: "advanced", description: "3D modeling software" },
            { name: "Substance Painter", level: "intermediate", description: "Texturing PBR" },
            { name: "ZBrush", level: "intermediate", description: "Sculpting detail tinggi" },
            { name: "Photoshop/Illustrator", level: "intermediate", description: "2D art & concept" },
            { name: "Unity/Unreal Integration", level: "beginner", description: "Export asset ke engine" },
        ],
        techFacts: [
            { fact: "Blender 100% GRATIS dan open source, tapi digunakan oleh studio AAA seperti Ubisoft dan CD Projekt Red. Bukti bahwa tool mahal bukan jaminan." },
            { fact: "Karakter dalam game modern bisa memiliki 100,000+ polygon. Kratos di God of War Ragnarök memiliki lebih dari 80,000 poligon hanya untuk wajahnya." },
            { fact: "AI generatif seperti Stable Diffusion kini membantu game artist membuat concept art 10x lebih cepat — tapi skill manual tetap fondasi utama." },
            { fact: "Artstation (platform portfolio seniman digital) menampilkan karya dari artis di 150+ negara. Portfolio yang kuat lebih penting dari ijazah." },
            { fact: "Film Avatar 2 dan game seperti Fortnite menggunakan teknik motion capture — menangkap gerakan manusia nyata untuk animasi digital." },
        ],
        realCompanies: ["Agate International", "Mojiken Studio", "Blizzard", "Naughty Dog", "CD Projekt Red", "Riot Games"],
        learningPath: [
            "Drawing & Anatomy Basics",
            "Blender 3D Modeling",
            "Texturing (Substance Painter)",
            "Character Rigging & Animation",
            "Environment Art",
            "Portfolio di ArtStation"
        ],
        xpReward: 25,
    },

    // ===== EMERGING TECH =====
    {
        id: "ai-ml-engineer",
        title: "AI / Machine Learning Engineer",
        subtitle: "Membangun Kecerdasan Buatan",
        emoji: "🤖",
        jurusan: ["RPL", "TKJ", "PG"],
        category: "emerging",
        salaryRange: "Rp 15-60 Juta/bulan",
        demandLevel: "Sangat Tinggi",
        demandColor: "#10b981",
        gradient: "linear-gradient(135deg, #0f172a, #1e40af)",
        accentColor: "#6366f1",
        description: "AI/ML Engineer membangun sistem yang bisa belajar dari data — dari chatbot cerdas seperti ChatGPT, mobil otonom, hingga diagnosis medis otomatis. Ini adalah profesi dengan pertumbuhan tertinggi di dunia.",
        whatYouDo: [
            "Melatih model machine learning dengan dataset besar",
            "Membangun dan deploy model AI ke produksi",
            "Natural Language Processing (chatbot, terjemahan)",
            "Computer Vision (pengenalan gambar/video)",
            "MLOps — mengelola lifecycle model AI"
        ],
        skillsNeeded: [
            { name: "Python", level: "advanced", description: "Bahasa utama AI/ML" },
            { name: "TensorFlow / PyTorch", level: "advanced", description: "Framework deep learning" },
            { name: "Matematika (Linear Algebra)", level: "intermediate", description: "Fondasi ML" },
            { name: "Data Processing (Pandas)", level: "intermediate", description: "Mengolah dataset" },
            { name: "Cloud ML (Vertex AI)", level: "intermediate", description: "Deploy model di cloud" },
        ],
        techFacts: [
            { fact: "ChatGPT mencapai 100 juta pengguna dalam 2 bulan — rekor tercepat sepanjang sejarah. Instagram butuh 2.5 tahun untuk angka yang sama." },
            { fact: "OpenAI (pembuat ChatGPT) bernilai $157 miliar di 2025 — menjadikannya perusahaan AI paling bernilai di dunia." },
            { fact: "Google DeepMind's AlphaFold telah memprediksi struktur 200 JUTA protein — memecahkan masalah biologi yang bertahan 50 tahun." },
            { fact: "45% pekerjaan saat ini bisa diotomasi oleh AI dalam 10-20 tahun ke depan (McKinsey). Tapi AI juga akan MENCIPTAKAN jutaan pekerjaan baru." },
            { fact: "Indonesia memiliki roadmap AI nasional 'Strategi Nasional Kecerdasan Artifisial 2020-2045' — lulusan IT yang paham AI sangat dibutuhkan." },
        ],
        realCompanies: ["Google DeepMind", "OpenAI", "Meta AI", "Tokopedia AI", "Gojek ML Team", "NVIDIA"],
        learningPath: [
            "Python Programming",
            "Statistik & Probabilitas",
            "Machine Learning Basics (scikit-learn)",
            "Deep Learning (TensorFlow/PyTorch)",
            "NLP atau Computer Vision spesialisasi",
            "MLOps & Model Deployment"
        ],
        xpReward: 25,
    },
    {
        id: "blockchain-web3",
        title: "Blockchain / Web3 Developer",
        subtitle: "Membangun Internet Terdesentralisasi",
        emoji: "⛓️",
        jurusan: ["RPL", "TKJ"],
        category: "emerging",
        salaryRange: "Rp 15-50 Juta/bulan",
        demandLevel: "Tinggi",
        demandColor: "#f59e0b",
        gradient: "linear-gradient(135deg, #1a1a2e, #f59e0b)",
        accentColor: "#f59e0b",
        description: "Blockchain Developer membangun aplikasi terdesentralisasi (dApps) dan smart contract di jaringan blockchain seperti Ethereum dan Solana. Teknologi ini merevolusi keuangan, supply chain, dan digital identity.",
        whatYouDo: [
            "Menulis smart contract (Solidity/Rust)",
            "Membangun frontend dApps yang terhubung ke blockchain",
            "Audit keamanan smart contract",
            "Implementasi DeFi (Decentralized Finance)",
            "Merancang tokenomics dan NFT marketplace"
        ],
        skillsNeeded: [
            { name: "Solidity", level: "advanced", description: "Bahasa smart contract Ethereum" },
            { name: "Web3.js / ethers.js", level: "advanced", description: "Library interaksi blockchain" },
            { name: "React + Next.js", level: "intermediate", description: "Frontend dApp" },
            { name: "Kriptografi dasar", level: "intermediate", description: "Hash, digital signatures" },
            { name: "Hardhat / Foundry", level: "intermediate", description: "Development framework" },
        ],
        techFacts: [
            { fact: "Ethereum memproses transaksi senilai $1+ TRILIUN per tahun. Smart contract di Ethereum mengelola aset digital lebih besar dari PDB banyak negara." },
            { fact: "Vitalik Buterin menciptakan Ethereum saat berusia 19 tahun. White paper-nya ditulis di kamar kos sewaktu kuliah." },
            { fact: "NFT karya seniman Beeple (Everydays) terjual seharga $69 juta di Christie's — menjadikannya salah satu karya seni termahal yang pernah dijual hidup." },
            { fact: "Bank Indonesia sedang mengembangkan Central Bank Digital Currency (CBDC) bernama 'Rupiah Digital' menggunakan teknologi blockchain." },
            { fact: "Gaji average Solidity developer di global market adalah $125,000-$200,000/tahun karena sangat langka dan sangat dibutuhkan." },
        ],
        realCompanies: ["Ethereum Foundation", "Solana Labs", "Coinbase", "Binance", "Consensys", "Tokocrypto"],
        learningPath: [
            "JavaScript & TypeScript",
            "Konsep Blockchain & Cryptography",
            "Solidity & Smart Contract",
            "Hardhat Development Environment",
            "Frontend dApp (React + Web3.js)",
            "Security Auditing & Best Practices"
        ],
        xpReward: 25,
    },
    {
        id: "devops-sre",
        title: "DevOps / SRE Engineer",
        subtitle: "Menjaga Sistem Selalu Hidup",
        emoji: "⚙️",
        jurusan: ["TKJ", "RPL"],
        category: "emerging",
        salaryRange: "Rp 12-45 Juta/bulan",
        demandLevel: "Sangat Tinggi",
        demandColor: "#10b981",
        gradient: "linear-gradient(135deg, #14532d, #22c55e)",
        accentColor: "#22c55e",
        description: "DevOps/SRE (Site Reliability Engineering) menjembatani development dan operations — memastikan software di-deploy cepat, aman, dan sistem selalu berjalan 99.99%. Google mempopulerkan peran SRE.",
        whatYouDo: [
            "Membangun CI/CD pipeline (automated deployment)",
            "Mengelola infrastructure as code (Terraform/Ansible)",
            "Monitoring & alerting (Grafana, Prometheus, Datadog)",
            "Container orchestration (Kubernetes)",
            "Incident response & postmortem analysis"
        ],
        skillsNeeded: [
            { name: "Linux & Shell Scripting", level: "advanced", description: "Fondasi sistem" },
            { name: "Docker & Kubernetes", level: "advanced", description: "Containerization" },
            { name: "CI/CD (Jenkins/GitHub Actions)", level: "advanced", description: "Automated deployment" },
            { name: "Monitoring (Prometheus/Grafana)", level: "intermediate", description: "Observability" },
            { name: "Cloud Platform (AWS/GCP)", level: "intermediate", description: "Infrastructure" },
        ],
        techFacts: [
            { fact: "Google mempopulerkan konsep SRE — tim SRE Google menjaga agar Gmail, YouTube, dan Search tetap online untuk 4.3 miliar pengguna." },
            { fact: "Amazon kehilangan $66,240 PER DETIK ketika website-nya down. Ini menunjukkan betapa pentingnya SRE/DevOps." },
            { fact: "Perusahaan yang menerapkan DevOps deploy 200x lebih sering dan recover dari failure 24x lebih cepat (DORA State of DevOps Report)." },
            { fact: "Kubernetes awalnya bernama 'Project Seven of Nine' (referensi Star Trek) di Google sebelum dirilis ke publik sebagai open source." },
            { fact: "Rata-rata gaji DevOps engineer di global adalah $110,000-$160,000/tahun. Di Indonesia, senior DevOps bisa mencapai Rp 30-45 Juta/bulan." },
        ],
        realCompanies: ["Google SRE", "Netflix", "Tokopedia DevOps", "Gojek Platform", "GitLab", "HashiCorp"],
        learningPath: [
            "Linux Administration & Bash Scripting",
            "Git & GitHub Actions CI/CD",
            "Docker Fundamentals",
            "Kubernetes (K8s)",
            "Monitoring (Prometheus + Grafana)",
            "Terraform & Infrastructure as Code"
        ],
        xpReward: 25,
    },
];
