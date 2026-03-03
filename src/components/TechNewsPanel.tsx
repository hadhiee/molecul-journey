"use client";

import { useState, useRef, useEffect } from 'react';

interface NewsItem {
    id: number;
    category: 'RPL' | 'TKJ' | 'PG';
    title: string;
    description: string;
    source: string;
    url: string;
    icon: string;
    color: string;
}

const NEWS_POOL: NewsItem[] = [
    // RPL (Rekayasa Perangkat Lunak)
    { id: 1, category: 'RPL', title: 'Next.js 16 Production Ready', description: 'Optimasi AI-Middleware dan streaming data real-time kini menjadi standar baru framework React.', source: 'Next.js Blog', url: 'https://nextjs.org', icon: '⚛️', color: '#000000' },
    { id: 2, category: 'RPL', title: 'GitHub Copilot Workspace 2.0', description: 'AI yang mampu merancang seluruh arsitektur sistem dari satu prompt bahasa alami.', source: 'GitHub News', url: 'https://github.blog', icon: '🤖', color: '#24292f' },
    { id: 3, category: 'RPL', title: 'Bun 2.0: Runtime Tercepat', description: 'Ekosistem JavaScript semakin kencang dengan rilis stabil Bun 2.0 yang menggantikan Node.js.', source: 'Bun Dev', url: 'https://bun.sh', icon: '🍞', color: '#fbf0df' },
    { id: 4, category: 'RPL', title: 'Rust Mendominasi Sistem Kritis', description: 'Laporan 2026 menunjukkan Rust menjadi bahasa paling aman untuk pengembangan backend perbankan.', source: 'Dev.to', url: 'https://dev.to', icon: '🦀', color: '#f44336' },
    { id: 5, category: 'RPL', title: 'Arsitektur Serverless v3', description: 'Evolusi Cloud Functions dengan latensi mendekati nol melalui teknologi Global Edge.', source: 'Vercel News', url: 'https://vercel.com', icon: '⚡', color: '#000000' },
    { id: 6, category: 'RPL', title: 'TypeScript 6.0: Macro Power', description: 'Fitur macro baru memungkinkan optimasi kode saat kompilasi secara otomatis.', source: 'TS Official', url: 'https://typescriptlang.org', icon: '📘', color: '#3178c6' },
    { id: 7, category: 'RPL', title: 'Docker GenAI Desktop', description: 'Docker rilis tool lokal untuk manajemen LLM secara kontainerized bagi pengembang.', source: 'Docker Blog', url: 'https://docker.com', icon: '🐳', color: '#2496ed' },
    { id: 8, category: 'RPL', title: 'PostgreSQL 18: Vector Native', description: 'Database relasional terpopuler kini mendukung pencarian vektor secara bawaan untuk AI.', source: 'Postgres SQL', url: 'https://postgresql.org', icon: '🐘', color: '#336791' },

    // TKJ (Teknik Komputer Jaringan)
    { id: 9, category: 'TKJ', title: 'Indosat 5G AI-RAN Pertama ASEAN', description: 'Jaringan seluler berbasis AI hasil kolaborasi NVIDIA dan Nokia resmi beroperasi di Jakarta.', source: 'Indosat News', url: 'https://ioh.co.id', icon: '📡', color: '#ffcc00' },
    { id: 10, category: 'TKJ', title: 'Cisco AI-Native Networking', description: 'Sistem manajemen jaringan yang mampu memprediksi dan memperbaiki gangguan secara mandiri.', source: 'Cisco Tech', url: 'https://cisco.com', icon: '🌐', color: '#049fd9' },
    { id: 11, category: 'TKJ', title: 'Wi-Fi 7 Menjadi Standar Global', description: 'Kecepatan hingga 46 Gbps kini tersedia luas untuk perangkat konsumen generasi terbaru.', source: 'Wi-Fi Alliance', url: 'https://wi-fi.org', icon: '📶', color: '#2563eb' },
    { id: 12, category: 'TKJ', title: 'Starlink Mini untuk Enterprise', description: 'Layanan internet satelit portabel dengan latensi rendah untuk lokasi terpencil industri.', source: 'SpaceX Starlink', url: 'https://starlink.com', icon: '🛰️', color: '#000000' },
    { id: 13, category: 'TKJ', title: 'Fortinet Zero Trust 2.0', description: 'Implementasi keamanan jaringan tanpa batas yang menggunakan biometrik kontinu.', source: 'Security Week', url: 'https://fortinet.com', icon: '🔐', color: '#dc2626' },
    { id: 14, category: 'TKJ', title: 'Cloud Hybrid Standard 2026', description: 'Organisasi berpindah ke strategi multi-cloud berdaulat untuk perlindungan data nasional.', source: 'Cloud News', url: 'https://cloud.google.com', icon: '☁️', color: '#4285f4' },
    { id: 15, category: 'TKJ', title: 'MikroTik Cloud Core v12', description: 'Router dengan throughput terabyte per detik untuk infrastruktur ISP masa depan.', source: 'MikroTik Lab', url: 'https://mikrotik.com', icon: '🧱', color: '#ec1c24' },
    { id: 16, category: 'TKJ', title: '6G Sub-Terahertz Trial Success', description: 'Kecepatan 1 Tbps berhasil diuji coba dalam radius 100 meter untuk jaringan perkotaan.', source: 'Telecom Daily', url: 'https://telecomtv.com', icon: '🚀', color: '#3b82f6' },

    // PG (Pengembangan Gim)
    { id: 17, category: 'PG', title: 'Unreal Engine 5.6: Lumen 2.0', description: 'Teknologi ray-tracing terbaru memungkinkan pencahayaan fotorealistik di perangkat mobile.', source: 'Epic Games', url: 'https://unrealengine.com', icon: '🎮', color: '#000000' },
    { id: 18, category: 'PG', title: 'NPC AI Generatif di GTA VI', description: 'Rumor teknologi dialog dinamis berbasis LLM yang membuat karakter game lebih hidup.', source: 'Gaming Tech', url: 'https://rockstargames.com', icon: '🕵️', color: '#f59e0b' },
    { id: 19, category: 'PG', title: 'Unity WebGL 4.0: Console Grade', description: 'Kini game kualitas konsol bisa dimainkan langsung di browser melalui optimasi WebGPU.', source: 'Unity Blog', url: 'https://unity.com', icon: '📦', color: '#222c37' },
    { id: 20, category: 'PG', title: 'PlayStation 6 Dev-Kit Leak', description: 'Arsitektur APU terbaru menjanjikan 8K 120fps dengan efisiensi energi tinggi.', source: 'Eurogamer', url: 'https://eurogamer.net', icon: '🕹️', color: '#003087' },
    { id: 21, category: 'PG', title: 'Godot 4.4 Stable Released', description: 'Engine open-source terpopuler rilis dukungan C# 12 dan sistem partikel GPU baru.', source: 'Godot Engine', url: 'https://godotengine.org', icon: '🤖', color: '#478cbf' },
    { id: 22, category: 'PG', title: 'Meta Quest 4 Pro Announcement', description: 'Headset VR/AR dengan resolusi 6K per mata mendukung cloud-spatial gaming.', source: 'Meta Reality', url: 'https://meta.com', icon: '🥽', color: '#0668e1' },
    { id: 23, category: 'PG', title: 'Game Rating Indonesia 2026', description: 'Pemerintah ketatkan aturan klasifikasi usia game lokal melalui sistem IGRS.', source: 'Kominfo News', url: 'https://kominfo.go.id', icon: '🇮🇩', color: '#e11d48' },
    { id: 24, category: 'PG', title: 'Nintendo Switch 2 Pro Exclusives', description: 'Line-up game terbaru dengan dukungan DLSS 3.5 rilis akhir tahun ini.', source: 'Nintendo Life', url: 'https://nintendo.com', icon: '🍄', color: '#e60012' }
];

export default function TechNewsPanel() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Rotate news based on the current hour
        const updateNews = () => {
            const currentHour = new Date().getHours();
            // Deterministic shuffle logic based on hour
            const seed = currentHour;
            const shuffled = [...NEWS_POOL].sort((a, b) => {
                const valA = (a.id * seed) % 17;
                const valB = (b.id * seed) % 17;
                return valA - valB;
            });
            setNews(shuffled.slice(0, 10));
        };

        updateNews();

        // Interval to check every minute if hour changed
        const interval = setInterval(updateNews, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            background: 'white',
            borderRadius: 32,
            padding: '24px 0',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10, backgroundColor: '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                    }}>📡</div>
                    <h2 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Tech Radar: RPL · TKJ · PG</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981', background: '#f0fdf4', padding: '4px 12px', borderRadius: 99 }}>
                        UPDATES HOURLY
                    </div>
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div
                ref={scrollRef}
                className="hide-scrollbar"
                style={{
                    display: 'flex',
                    gap: 16,
                    overflowX: 'auto',
                    padding: '0 24px 12px',
                    scrollSnapType: 'x mandatory',
                    scrollBehavior: 'smooth'
                }}
            >
                {news.map((item) => (
                    <a
                        key={`${item.id}-${item.category}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            minWidth: 280,
                            maxWidth: 280,
                            background: '#f8fafc',
                            borderRadius: 24,
                            padding: 24,
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            border: '1px solid #f1f5f9',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            scrollSnapAlign: 'start',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Dept Badge */}
                        <div style={{
                            display: 'inline-block',
                            backgroundColor: item.category === 'RPL' ? '#eff6ff' : item.category === 'TKJ' ? '#f0fdf4' : '#fff7ed',
                            color: item.category === 'RPL' ? '#3b82f6' : item.category === 'TKJ' ? '#22c55e' : '#f59e0b',
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '4px 12px',
                            borderRadius: 99,
                            alignSelf: 'flex-start',
                            textTransform: 'uppercase',
                            boxShadow: `0 2px 4px ${item.color}10`
                        }}>
                            {item.category}
                        </div>

                        {/* Title */}
                        <h3 style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: '#1e293b',
                            lineHeight: 1.4,
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: 42
                        }}>
                            {item.title}
                        </h3>

                        {/* Description */}
                        <p style={{
                            fontSize: 12,
                            color: '#64748b',
                            lineHeight: 1.5,
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            flex: 1
                        }}>
                            {item.description}
                        </p>

                        {/* Footer */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 4,
                            paddingTop: 12,
                            borderTop: '1px dashed #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 18 }}>{item.icon}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{item.source}</span>
                            </div>
                            <span style={{ fontSize: 14, color: '#94a3b8' }}>↗</span>
                        </div>
                    </a>
                ))}
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
            `}</style>
        </div>
    );
}
