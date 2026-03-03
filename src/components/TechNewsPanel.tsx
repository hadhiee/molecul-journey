"use client";

import { useState, useRef } from 'react';

interface NewsItem {
    id: number;
    category: 'ID' | 'INT';
    title: string;
    description: string;
    source: string;
    url: string;
    icon: string;
    color: string;
}

const NEWS_DATA: NewsItem[] = [
    {
        id: 1,
        category: 'ID',
        title: 'Indosat & 5G AI-RAN Pertama di ASEAN',
        description: 'Kolaborasi dengan Nokia & NVIDIA pamerkan jaringan 5G berbasis AI yang lebih cerdas dan responsif di MWC 2026.',
        source: 'VOI ID',
        url: 'https://voi.id',
        icon: '📡',
        color: '#e11d48'
    },
    {
        id: 2,
        category: 'ID',
        title: 'BI Luncurkan Digital Innovation Hub',
        description: 'Memperkuat talenta digital muda Indonesia melalui program Digdaya dan Hackathon 2026 untuk ekonomi digital.',
        source: 'Fintech News',
        url: 'https://fintechnews.id',
        icon: '🏦',
        color: '#3b82f6'
    },
    {
        id: 3,
        category: 'ID',
        title: 'Regulasi Perlindungan Anak Daring',
        description: 'Pemerintah terapkan aturan ketat perlindungan anak di platform digital mulai Maret 2026.',
        source: 'Antara News',
        url: 'https://antaranews.com',
        icon: '🛡️',
        color: '#10b981'
    },
    {
        id: 4,
        category: 'ID',
        title: 'Roadmap Etika AI Nasional 2026',
        description: 'Kementerian Komunikasi segera terbitkan peta jalan dan panduan etika AI untuk industri nasional.',
        source: 'Tech in Asia',
        url: 'https://techinasia.com',
        icon: '🤖',
        color: '#8b5cf6'
    },
    {
        id: 5,
        category: 'INT',
        title: 'Xiaomi 17 Series Global Launch',
        description: 'Xiaomi resmi luncurkan flagship 17 Ultra dan Wear OS Watch 5 di ajang MWC 2026 Barcelona.',
        source: 'Tech Global',
        url: 'https://www.mi.com',
        icon: '📱',
        color: '#f59e0b'
    },
    {
        id: 6,
        category: 'INT',
        title: 'Lenovo Pamer Laptop Yoga Book Pro 3D',
        description: 'Laptop konsep dengan layar 3D tanpa kacamata dan fitur AI terintegrasi mencuri perhatian dunia.',
        source: 'Lenovo Press',
        url: 'https://lenovo.com',
        icon: '💻',
        color: '#ef4444'
    },
    {
        id: 7,
        category: 'INT',
        title: 'Strategi Samsung AI Factory 2030',
        description: 'Samsung targetkan seluruh operasi manufaktur global berbasis kecerdasan buatan penuh pada 2030.',
        source: 'Samsung News',
        url: 'https://samsung.com',
        icon: '🏭',
        color: '#2563eb'
    },
    {
        id: 8,
        category: 'INT',
        title: 'Huawei Forum Ekonomi Digital Ke-4',
        description: 'Huawei tegaskan pentingnya infrastruktur digital dalam mempercepat adopsi AI di sektor publik.',
        source: 'Huawei Forum',
        url: 'https://huawei.com',
        icon: '🌐',
        color: '#dc2626'
    },
    {
        id: 9,
        category: 'INT',
        title: 'iPad Air M4 Resmi Diperkenalkan',
        description: 'Apple tingkatkan performa iPad Air dengan chip M4 untuk kemampuan AI yang jauh lebih cepat.',
        source: 'Apple News',
        url: 'https://apple.com',
        icon: '🍎',
        color: '#000000'
    },
    {
        id: 10,
        category: 'ID',
        title: 'Pertumbuhan 17M Pasar Digital Travel',
        description: 'AI diprediksi dorong pasar travel online Indonesia melesat tajam pada akhir dekade ini.',
        source: 'Phocuswire',
        url: 'https://phocuswire.com',
        icon: '✈️',
        color: '#065f46'
    }
];

export default function TechNewsPanel() {
    const scrollRef = useRef<HTMLDivElement>(null);

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
                    <h2 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Tech Radar News</h2>
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', background: '#eff6ff', padding: '4px 12px', borderRadius: 99 }}>
                    LIVE: INDO & GLOBAL
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
                {NEWS_DATA.map((news) => (
                    <a
                        key={news.id}
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            minWidth: 280,
                            maxWidth: 280,
                            background: '#f8fafc',
                            borderRadius: 24,
                            padding: 20,
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            border: '1px solid #f1f5f9',
                            transition: 'all 0.3s ease',
                            scrollSnapAlign: 'start',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Category Tag */}
                        <div style={{
                            display: 'inline-block',
                            backgroundColor: `${news.color}15`,
                            color: news.color,
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: 8,
                            alignSelf: 'flex-start',
                            textTransform: 'uppercase'
                        }}>
                            {news.category === 'ID' ? '🇮🇩 Indonesia' : '🌍 International'}
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
                            {news.title}
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
                            {news.description}
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
                                <span style={{ fontSize: 16 }}>{news.icon}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{news.source}</span>
                            </div>
                            <span style={{ fontSize: 14, color: '#94a3b8' }}>→</span>
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
            `}</style>
        </div>
    );
}
