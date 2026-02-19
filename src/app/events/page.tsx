import Link from 'next/link';
import { EVENTS, PuspresnasEvent } from '@/data/events';
import EventCard from '@/components/EventCard';

// Helper to group events
const EVENT_GROUPS = [
    {
        title: "Vokasi & Kewirausahaan",
        description: "Kembangkan skill teknis dan jiwa bisnis profesional.",
        ids: ['lks', 'fiksi'],
        gradient: 'linear-gradient(to bottom, #f43f5e, #f97316)'
    },
    {
        title: "Sains & Riset",
        description: "Eksplorasi ilmu pengetahuan dan inovasi penemuan baru.",
        ids: ['osn', 'opsi'],
        gradient: 'linear-gradient(to bottom, #3b82f6, #06b6d4)'
    },
    {
        title: "Seni, Bahasa & Olahraga",
        description: "Ekspresikan bakat seni, kemampuan komunikasi, dan ketangkasan fisik.",
        ids: ['fls2n', 'ldi', 'o2sn'],
        gradient: 'linear-gradient(to bottom, #8b5cf6, #a855f7)'
    }
];

export default function EventsIndexPage() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 96, fontFamily: 'sans-serif' }}>

            {/* 1. Hero Section with Pattern */}
            <div style={{
                position: 'relative', backgroundColor: '#0f172a', color: 'white', overflow: 'hidden',
                borderBottomLeftRadius: 60, borderBottomRightRadius: 60, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                paddingTop: 80, paddingBottom: 120
            }}>
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.2,
                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px'
                }} />

                <div style={{ position: 'absolute', top: 0, right: 0, width: 500, height: 500, backgroundColor: '#2563eb', borderRadius: 999, filter: 'blur(120px)', opacity: 0.2, transform: 'translate(50%, -50%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 400, height: 400, backgroundColor: '#e11d48', borderRadius: 999, filter: 'blur(100px)', opacity: 0.2, transform: 'translate(-25%, 50%)' }} />

                <div style={{ position: 'relative', zIndex: 10, maxWidth: 1000, margin: '0 auto', textAlign: 'center', padding: '0 24px' }}>
                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 99,
                            backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 14, fontWeight: 700,
                            textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 32
                        }}
                    >
                        <span>← Kembali ke Dashboard</span>
                    </Link>

                    <h1 style={{ fontSize: 64, fontWeight: 900, marginBottom: 24, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #d1d5db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Puspresnas Arena
                    </h1>
                    <p style={{ fontSize: 20, color: '#d1d5db', fontWeight: 500, maxWidth: 800, margin: '0 auto', lineHeight: 1.6 }}>
                        Pusat inkubasi talenta nasional. Asah karakter, raih prestasi, dan jadilah kebanggaan bangsa.
                    </p>

                    {/* Stats Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 40 }}>
                        {[
                            { label: "7 Ajang Bergengsi", icon: "🏆" },
                            { label: "100+ Bidang Lomba", icon: "🎯" },
                            { label: "Pendidikan Karakter", icon: "🛡️" },
                        ].map((stat, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', backgroundColor: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: 99, fontSize: 14, fontWeight: 700, color: '#e5e7eb' }}>
                                <span>{stat.icon}</span>
                                <span>{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Main Content - Grouped Layout */}
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', marginTop: -60, position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', gap: 64 }}>

                {EVENT_GROUPS.map((group, idx) => {
                    const groupEvents = group.ids.map(id => EVENTS.find(e => e.id === id)).filter(Boolean) as PuspresnasEvent[];

                    return (
                        <div key={idx}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 24 }}>
                                <div style={{ width: 6, height: 48, borderRadius: 99, background: group.gradient }}></div>
                                <div>
                                    <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b' }}>{group.title}</h2>
                                    <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>{group.description}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                                {groupEvents.map(event => (
                                    <div key={event.id}>
                                        <EventCard event={event} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}

                {/* 3. Bottom CTA - Encouragement */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #4f46e5, #7c3aed)', borderRadius: 32, padding: 48,
                    textAlign: 'center', color: 'white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '15rem', fontWeight: 900, color: 'white', opacity: 0.05, transform: 'translate(25%, -25%)' }}>
                        GO
                    </div>

                    <div style={{ position: 'relative', zIndex: 10, maxWidth: 600, margin: '0 auto' }}>
                        <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>Belum yakin harus mulai dari mana?</h2>
                        <p style={{ fontSize: 18, color: '#e0e7ff', marginBottom: 32, fontWeight: 500 }}>
                            Coba eksplorasi "Journey Map" untuk menemukan minat bakatmu melalui game simulasi.
                        </p>
                        <Link
                            href="/journey"
                            style={{
                                display: 'inline-block', padding: '16px 40px', backgroundColor: 'white', color: '#4338ca',
                                fontWeight: 900, borderRadius: 20, textDecoration: 'none', fontSize: 18,
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                            }}
                        >
                            Mulai Petualangan 🗺️
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
