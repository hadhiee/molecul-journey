"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Branch } from '@/data/events';

interface BranchListProps {
    branches: Branch[];
    eventId: string;
    themeColor: string;
}

export default function BranchList({ branches, eventId, themeColor }: BranchListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    // Get unique categories
    const categories = ['ALL', ...Array.from(new Set(branches.map(b => b.category).filter(Boolean)))];

    const filteredBranches = branches.filter(branch => {
        const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (branch.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        const matchesCategory = selectedCategory === 'ALL' || branch.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const lksPriorityIds = [
        "graphic-design-technology",
        "cyber-security",
        "it-network-systems-administration",
        "cloud-computing",
        "it-software-solutions-for-business",
        "information-network-cabling",
        "web-technologies",
        "mobile-robotics",
        "3d-digital-game-art",
        "marketing-online",
        "ai"
    ];

    const osnPriorityIds = [
        "info",
        "math",
        "phys"
    ];

    const sortedBranches = [...filteredBranches].sort((a, b) => {
        if (eventId === 'lks') {
            const aIndex = lksPriorityIds.includes(a.id) ? lksPriorityIds.indexOf(a.id) : 999;
            const bIndex = lksPriorityIds.includes(b.id) ? lksPriorityIds.indexOf(b.id) : 999;
            return aIndex - bIndex;
        } else if (eventId === 'osn') {
            const aIndex = osnPriorityIds.includes(a.id) ? osnPriorityIds.indexOf(a.id) : 999;
            const bIndex = osnPriorityIds.includes(b.id) ? osnPriorityIds.indexOf(b.id) : 999;
            return aIndex - bIndex;
        }
        return 0;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ backgroundColor: 'white', borderRadius: 24, padding: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16, display: 'block' }}>
                    Cari Cabang / Bidang Lomba
                </label>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Ketik nama lomba..."
                        style={{
                            width: '100%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: 16, padding: '16px 20px', paddingLeft: 48,
                            fontSize: 14, fontWeight: 600, color: '#1e293b', outline: 'none'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: 0.6 }}>🔍</span>
                </div>

                {categories.length > 1 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat as string)}
                                style={{
                                    padding: '8px 16px', borderRadius: 99, fontSize: 11, fontWeight: 800,
                                    transition: 'all 0.2s', border: '1px solid #e2e8f0', cursor: 'pointer',
                                    backgroundColor: selectedCategory === cat ? themeColor : 'white',
                                    color: selectedCategory === cat ? 'white' : '#64748b',
                                    boxShadow: selectedCategory === cat ? `0 4px 12px ${themeColor}33` : 'none'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {sortedBranches.map((branch) => {
                    let isPriority = false;
                    let priorityLabel = "";
                    let priorityBgColor = 'white';

                    if (eventId === 'lks' && lksPriorityIds.includes(branch.id)) {
                        isPriority = true;
                        priorityLabel = " • PRIORITAS UTAMA ⭐";
                        priorityBgColor = '#fff1f2'; // Soft rose
                    } else if (eventId === 'osn' && osnPriorityIds.includes(branch.id)) {
                        isPriority = true;
                        priorityLabel = " • TERDAFTAR BPTI 🏆";
                        priorityBgColor = '#eff6ff'; // Soft blue
                    }

                    return (
                        <Link
                            href={`/events/${eventId}/${branch.id}`}
                            key={branch.id}
                            style={{ textDecoration: 'none' }}
                        >
                            <div
                                className="game-card"
                                style={{
                                    backgroundColor: isPriority ? priorityBgColor : 'white',
                                    borderRadius: 24, padding: 24,
                                    border: isPriority ? `2px solid ${themeColor}` : '1px solid #f1f5f9',
                                    boxShadow: isPriority ? `0 10px 25px -5px ${themeColor}40` : '0 4px 15px rgba(0,0,0,0.03)',
                                    transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
                                    height: '100%', display: 'flex', flexDirection: 'column'
                                }}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, width: isPriority ? 6 : 4, height: '100%', backgroundColor: themeColor }} />

                                <div style={{ flex: 1 }}>
                                    {(branch.category || isPriority) && (
                                        <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: isPriority ? themeColor : '#94a3b8', marginBottom: 8, display: 'block' }}>
                                            {branch.category || "UMUM"} {isPriority && priorityLabel}
                                        </span>
                                    )}
                                    <h4 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', lineHeight: 1.4, marginBottom: 16 }}>
                                        {branch.name}
                                    </h4>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: themeColor }}>
                                    <span>Mulai Latihan</span>
                                    <span>→</span>
                                </div>

                                {/* Subtle background icon/decor */}
                                <div
                                    style={{
                                        position: 'absolute', bottom: -10, right: -10,
                                        width: 80, height: 80, borderRadius: 99,
                                        backgroundColor: themeColor, opacity: isPriority ? 0.15 : 0.05
                                    }}
                                />
                            </div>
                        </Link>
                    )
                })}

                {filteredBranches.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0', color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>
                        Tidak ditemukan cabang dengan kata kunci "{searchTerm}".
                    </div>
                )}
            </div>
        </div>
    );
}
