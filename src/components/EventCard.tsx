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
                style={{
                    background: bgGradient,
                    color: 'white',
                    boxShadow: `0 10px 20px -5px ${event.color}66`,
                    borderRadius: 24,
                    padding: '20px 16px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                    height: '100%',
                    position: 'relative', overflow: 'hidden'
                }}
            >
                {/* Background Decor */}
                <div
                    className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none"
                />

                <div
                    style={{
                        width: 50, height: 50, borderRadius: 18,
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, marginBottom: 12,
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    className="group-hover:scale-110 transition-transform duration-300"
                >
                    {event.icon}
                </div>

                <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, lineHeight: 1.2, position: 'relative', zIndex: 10 }}>
                    {event.shortName}
                </h3>

                <p style={{ fontSize: 10, fontWeight: 600, opacity: 0.9, position: 'relative', zIndex: 10 }}>
                    {event.branches.length} Bidang Lomba
                </p>
            </div>
        </Link>
    );
}
