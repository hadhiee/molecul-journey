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

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cari Cabang / Bidang Lomba</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Ketik nama lomba..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                        style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-3 top-3 text-slate-400">🔍</span>
                </div>

                {categories.length > 1 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat as string)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat
                                        ? 'text-white shadow-md transform scale-105'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                    }`}
                                style={selectedCategory === cat ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBranches.map((branch) => (
                    <Link
                        href={`/events/${eventId}/${branch.id}`}
                        key={branch.id}
                        className="group block bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-opacity-100 transition-colors" style={{ backgroundColor: themeColor }} />

                        <div className="pl-3">
                            {branch.category && (
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 block">
                                    {branch.category}
                                </span>
                            )}
                            <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-amber-600 transition-colors mb-2">
                                {branch.name}
                            </h4>
                            <div className="flex items-center text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                                <span>Mulai Latihan</span>
                                <span className="ml-1 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all">→</span>
                            </div>
                        </div>

                        {/* Subtle category dot */}
                        <div
                            className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-20"
                            style={{ backgroundColor: themeColor }}
                        />
                    </Link>
                ))}

                {filteredBranches.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                        Tidak ditemukan cabang dengan kata kunci "{searchTerm}".
                    </div>
                )}
            </div>
        </div>
    );
}
