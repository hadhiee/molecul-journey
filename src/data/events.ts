import { lksSkills } from './lksSkills';

export interface Branch {
    id: string;
    name: string;
    category?: string;
    description?: string;
}

export interface PuspresnasEvent {
    id: string;
    name: string;
    shortName: string;
    description: string;
    color: string; // Hex for gradient start or main theme
    icon: string;
    branches: Branch[];
}

const generateId = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

export const EVENTS: PuspresnasEvent[] = [
    {
        id: 'lks',
        name: 'Lomba Kompetensi Siswa (LKS)',
        shortName: 'LKS SMK',
        description: 'Ajang kompetisi keterampilan siswa SMK tingkat nasional dalam berbagai bidang keahlian.',
        color: '#e11d48', // Rose-600
        icon: '🛠️',
        branches: lksSkills.map(skill => ({
            id: skill.id,
            name: skill.name,
            category: skill.cluster
        }))
    },
    {
        id: 'fiksi',
        name: 'Festival Inovasi dan Kewirausahaan Siswa Indonesia (FIKSI)',
        shortName: 'FIKSI',
        description: 'Kompetisi kewirausahaan siswa SMA/SMK/MA untuk menumbuhkan jiwa wirausaha muda.',
        color: '#d97706', // Amber-600
        icon: '💡',
        branches: [
            // Rencana Usaha
            { id: 'ru-agri', name: 'Agribisnis, Agroteknologi & Kemaritiman', category: 'Rencana Usaha' },
            { id: 'ru-fashion', name: 'Fesyen', category: 'Rencana Usaha' },
            { id: 'ru-game', name: 'Gim', category: 'Rencana Usaha' },
            { id: 'ru-music', name: 'Industri Musik, Film, Animasi & Video', category: 'Rencana Usaha' },
            { id: 'ru-health', name: 'Kesehatan', category: 'Rencana Usaha' },
            { id: 'ru-craft', name: 'Kriya', category: 'Rencana Usaha' },
            { id: 'ru-culinary', name: 'Kuliner', category: 'Rencana Usaha' },
            { id: 'ru-tourism', name: 'Pariwisata', category: 'Rencana Usaha' },
            { id: 'ru-art', name: 'Seni Rupa & Desain', category: 'Rencana Usaha' },
            { id: 'ru-tech', name: 'Teknologi Digital', category: 'Rencana Usaha' },
            { id: 'ru-social', name: 'Kewirausahaan Sosial', category: 'Rencana Usaha' },

            // Pengembangan Usaha
            { id: 'pu-agri', name: 'Agribisnis, Agroteknologi & Kemaritiman', category: 'Pengembangan Usaha' },
            { id: 'pu-fashion', name: 'Fesyen', category: 'Pengembangan Usaha' },
            { id: 'pu-game', name: 'Gim', category: 'Pengembangan Usaha' },
            { id: 'pu-music', name: 'Industri Musik, Film, Animasi & Video', category: 'Pengembangan Usaha' },
            { id: 'pu-health', name: 'Kesehatan', category: 'Pengembangan Usaha' },
            { id: 'pu-craft', name: 'Kriya', category: 'Pengembangan Usaha' },
            { id: 'pu-culinary', name: 'Kuliner', category: 'Pengembangan Usaha' },
            { id: 'pu-tourism', name: 'Pariwisata', category: 'Pengembangan Usaha' },
            { id: 'pu-art', name: 'Seni Rupa & Desain', category: 'Pengembangan Usaha' },
            { id: 'pu-tech', name: 'Teknologi Digital', category: 'Pengembangan Usaha' },
            { id: 'pu-social', name: 'Kewirausahaan Sosial', category: 'Pengembangan Usaha' },
        ]
    },
    {
        id: 'opsi',
        name: 'Olimpiade Penelitian Siswa Indonesia (OPSI)',
        shortName: 'OPSI',
        description: 'Ajang kompetisi penelitian ilmiah bagi siswa jenjang SMA/MA.',
        color: '#0ea5e9', // Sky-500
        icon: '🔬',
        branches: [
            // Matematika, Sains, dan Teknologi (MST)
            { id: 'mst-math', name: 'Matematika', category: 'Matematika, Sains, dan Teknologi (MST)' },
            { id: 'mst-phys', name: 'Fisika', category: 'Matematika, Sains, dan Teknologi (MST)' },
            { id: 'mst-bio', name: 'Biologi', category: 'Matematika, Sains, dan Teknologi (MST)' },
            { id: 'mst-chem', name: 'Kimia', category: 'Matematika, Sains, dan Teknologi (MST)' },
            { id: 'mst-astro', name: 'Astronomi', category: 'Matematika, Sains, dan Teknologi (MST)' },
            { id: 'mst-comp', name: 'Informatika', category: 'Matematika, Sains, dan Teknologi (MST)' },
            { id: 'mst-env', name: 'Ilmu Lingkungan', category: 'Matematika, Sains, dan Teknologi (MST)' },
            { id: 'mst-eng', name: 'Rekayasa', category: 'Matematika, Sains, dan Teknologi (MST)' },

            // Fisika Terapan dan Rekayasa (FTR) - merging into simplified categories requested by user logic
            // User request logic: IPA, IPS, IPT (Agrikultur etc). Adapting to valid OPSI categories.
            // Wait, User requested STRICT categories: IPA, IPS, IPT.
            // Let's follow user Instruction STRICTLY for categories.

            // IPA
            { id: 'ipa-math', name: 'Matematika', category: 'IPA' },
            { id: 'ipa-phys', name: 'Fisika', category: 'IPA' },
            { id: 'ipa-bio', name: 'Biologi', category: 'IPA' },
            { id: 'ipa-geo', name: 'Geologi & Ilmu Kebumian', category: 'IPA' },
            { id: 'ipa-chem', name: 'Kimia', category: 'IPA' },
            { id: 'ipa-astro', name: 'Astronomi', category: 'IPA' },

            // IPS
            { id: 'ips-soc', name: 'Sosiologi', category: 'IPS' },
            { id: 'ips-psy', name: 'Psikologi & Pendidikan', category: 'IPS' },
            { id: 'ips-econ', name: 'Ilmu Ekonomi & Manajemen', category: 'IPS' },
            { id: 'ips-hist', name: 'Seni Budaya & Sejarah', category: 'IPS' },
            { id: 'ips-lang', name: 'Bahasa & Sastra', category: 'IPS' },

            // IPT
            { id: 'ipt-agri', name: 'Agrikultur & Teknologi Pangan', category: 'IPT' },
            { id: 'ipt-energy', name: 'Teknologi Energi & Energi Terbarukan', category: 'IPT' },
            { id: 'ipt-eng', name: 'Rekayasa Teknik', category: 'IPT' },
            { id: 'ipt-it', name: 'Teknologi Informasi & Komputer', category: 'IPT' },
        ]
    },
    {
        id: 'fls2n',
        name: 'Festival Lomba Seni Siswa Nasional (FLS2N)',
        shortName: 'FLS2N',
        description: 'Ajang talenta di bidang seni budaya bagi peserta didik jenjang SMA/SMK.',
        color: '#8b5cf6', // Violet-500
        icon: '🎨',
        branches: [
            { id: 'baca-puisi', name: 'Baca Puisi' },
            { id: 'cipta-lagu', name: 'Cipta Lagu' },
            { id: 'cipta-puisi', name: 'Cipta Puisi' },
            { id: 'desain-poster', name: 'Desain Poster' },
            { id: 'film-pendek', name: 'Film Pendek' },
            { id: 'fotografi', name: 'Fotografi' },
            { id: 'gitar-solo', name: 'Instrumen Solo Gitar' },
            { id: 'jurnalistik', name: 'Jurnalistik' },
            { id: 'komik-digital', name: 'Komik Digital' },
            { id: 'musik-tradisi', name: 'Kreativitas Musik Tradisional' },
            { id: 'kriya', name: 'Kriya' },
            { id: 'cerpen', name: 'Menulis Cerita Pendek (Cerpen)' },
            { id: 'nyanyi-solo', name: 'Menyanyi Solo' },
            { id: 'monolog', name: 'Monolog' },
            { id: 'tari-kreasi', name: 'Tari Kreasi' },
        ]
    },
    {
        id: 'osn',
        name: 'Olimpiade Sains Nasional (OSN)',
        shortName: 'OSN',
        description: 'Ajang kompetisi bidang sains bagi peserta didik SD/SMP/SMA.',
        color: '#2563eb', // Blue-600
        icon: '⚛️',
        branches: [
            { id: 'math', name: 'Matematika' },
            { id: 'phys', name: 'Fisika' },
            { id: 'chem', name: 'Kimia' },
            { id: 'info', name: 'Informatika/Komputer' },
            { id: 'bio', name: 'Biologi' },
            { id: 'astro', name: 'Astronomi' },
            { id: 'econ', name: 'Ekonomi' },
            { id: 'earth', name: 'Kebumian' },
            { id: 'geo', name: 'Geografi' },
        ]
    },
    {
        id: 'o2sn',
        name: 'Olimpiade Olahraga Siswa Nasional (O2SN)',
        shortName: 'O2SN',
        description: 'Ajang kompetisi bidang olahraga bagi peserta didik.',
        color: '#16a34a', // Green-600
        icon: '🏆',
        branches: [
            { id: 'silat', name: 'Pencak Silat (Jurus Tunggal)', category: 'Beladiri' },
            { id: 'karate', name: 'Karate (Kata Perorangan)', category: 'Beladiri' },
            // Additional common branches if needed, but user specifically asked for these 2
        ]
    },
    {
        id: 'ldi',
        name: 'Lomba Debat Indonesia (LDI)',
        shortName: 'LDI / NSDC',
        description: 'Ajang kompetisi debat untuk mengasah kemampuan berpikir kritis dan komunikasi.',
        color: '#f43f5e', // Rose-500
        icon: '🗣️',
        branches: [
            { id: 'ldbi', name: 'LDBI (Debat Bahasa Indonesia)' },
            { id: 'nsdc', name: 'NSDC (Debat Bahasa Inggris)' },
        ]
    },
];

export const getEvent = (id: string) => EVENTS.find(e => e.id === id);
