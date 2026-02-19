"use client";

import Link from 'next/link';
import { PuspresnasEvent } from '@/data/events';

const GRADIENTS: Record<string, string> = {
    lks: 'linear-gradient(135deg, #e11d48, #9f1239)',
    fiksi: 'linear-gradient(135deg, #d97706, #92400e)',
    opsi: 'linear-gradient(135deg, #0ea5e9, #0369a1)', // Sky
    fls2n: 'linear-gradient(135deg, #8b5cf6, #5b21b6)', // Violet
    osn: 'linear-gradient(135deg, #2563eb, #1e40af)', // Blue
    o2sn: 'linear-gradient(135deg, #16a34a, #15803d)', // Green
    ldi: 'linear-gradient(135deg, #f43f5e, #be123c)', // Rose
};

export default function EventCard({ event }: { event: PuspresnasEvent }) {
    const bgGradient = GRADIENTS[event.id] || `linear-gradient(135deg, ${event.color}, ${event.color})`;

    return (
        <Link href={`/events/${event.id}`} className="block h-full no-underline">
            <div
                className="group relative h-full rounded-[24px] p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col items-center text-center"
                style={{
                    background: bgGradient,
                    color: 'white',
                    boxShadow: `0 10px 20px -5px ${event.color}66`,
                    borderRadius: 24,
                }}
            >
                {/* Background Decor */}
                <div
                    className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none"
                />

                <div
                    className="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl mb-4 border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-300"
                >
                    {event.icon}
                </div>

                <h3 className="relative z-10 text-lg font-black leading-tight mb-2 drop-shadow-sm group-hover:text-white/90">
                    {event.shortName}
                </h3>

                <p className="relative z-10 text-[11px] font-medium opacity-80 line-clamp-2 mb-4 leading-relaxed">
                    {event.description}
                </p>

                <div className="mt-auto relative z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-black/20 px-3 py-1.5 rounded-full">
                    <span>{event.branches.length} Cabang</span>
                    <span>→</span>
                </div>
            </div>
        </Link>
    );
}
