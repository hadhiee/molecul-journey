import { getEvent, EVENTS } from '@/data/events';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BranchList from '@/components/BranchList';

export async function generateStaticParams() {
    return EVENTS.map((event) => ({
        eventId: event.id,
    }));
}

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = await params;
    const event = getEvent(eventId);

    if (!event) {
        return notFound();
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', position: 'relative', overflow: 'hidden', paddingBottom: 80 }}>
            {/* Background decoration */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 400, background: 'linear-gradient(to bottom, white, transparent)', opacity: 0.6, zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
                {/* Navigation */}
                <div style={{ marginBottom: 32 }}>
                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                            backgroundColor: 'white', borderRadius: 99, fontSize: 13, fontWeight: 700,
                            color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
                            textDecoration: 'none'
                        }}
                    >
                        <span>← Kembali ke Dashboard</span>
                    </Link>
                </div>

                {/* Header Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 48 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
                        <div
                            style={{
                                width: 120, height: 120, borderRadius: 32,
                                backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 64, boxShadow: `0 20px 40px -10px ${event.color}66`,
                                border: '4px solid white', transform: 'rotate(3deg)'
                            }}
                        >
                            {event.icon}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                                <span style={{ backgroundColor: '#0f172a', color: 'white', fontSize: 10, fontWeight: 900, padding: '6px 12px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Official Puspresnas
                                </span>
                                <span style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontSize: 10, fontWeight: 800, padding: '6px 12px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {event.branches.length} Bidang Lomba
                                </span>
                            </div>
                            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.1 }}>
                                {event.name}
                            </h1>
                            <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500, lineHeight: 1.6, maxWidth: 600 }}>
                                {event.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Character Values Section */}
                <div style={{ marginBottom: 48, background: 'white', padding: 32, borderRadius: 32, boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                            Nilai Karakter Utama
                        </h3>
                        <div style={{ width: 40, height: 4, borderRadius: 99, backgroundColor: event.color }} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {event.characterValues.map((value, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '12px 20px', borderRadius: 16, backgroundColor: '#f8fafc',
                                    border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12
                                }}
                            >
                                <div style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: event.color }} />
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search and List Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 40, boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.5)' }}>
                    <div style={{ backgroundColor: 'rgba(248,250,252,0.5)', borderRadius: 32, padding: 32 }}>
                        <BranchList branches={event.branches} eventId={event.id} themeColor={event.color} />
                    </div>
                </div>

            </div>
        </div>
    );
}
