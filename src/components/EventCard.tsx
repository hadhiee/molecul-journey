"use client";

import Link from 'next/link';
import { PuspresnasEvent } from '@/data/events';

export default function EventCard({ event }: { event: PuspresnasEvent }) {
    return (
        <Link href={`/events/${event.id}`} className="block h-full">
            <div
                className="group relative h-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
                <div
                    className="absolute top-0 left-0 w-2 h-full"
                    style={{ background: event.color }}
                />
                <div className="flex flex-col h-full pl-4">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{event.icon}</span>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                            {event.shortName}
                        </h3>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-grow tracking-wide leading-relaxed">
                        {event.description}
                    </p>

                    <div className="flex items-center text-xs font-bold" style={{ color: event.color }}>
                        <span>{event.branches.length} Cabang</span>
                        <span className="mx-2">•</span>
                        <span className="group-hover:translate-x-1 transition-transform">Lihat Detail →</span>
                    </div>
                </div>

                {/* Decorative gradient overlay on hover */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity duration-300"
                    style={{ background: `linear-gradient(to right, ${event.color}, transparent)` }}
                />
            </div>
        </Link>
    );
}
