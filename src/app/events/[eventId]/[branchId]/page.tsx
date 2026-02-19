import Link from 'next/link';
import { getEvent } from '@/data/events';

export default async function BranchTrainingPage({ params }: { params: Promise<{ eventId: string, branchId: string }> }) {
    const { eventId, branchId } = await params;

    const event = getEvent(eventId);
    const branch = event?.branches.find(b => b.id === branchId);
    const branchName = branch?.name || branchId;

    // Mock Data for "Training Modules" to make it look functional
    const modules = [
        { title: "Pengenalan & Dasar Teori", status: "open", progress: 0 },
        { title: "Latihan Soal Level 1", status: "locked", progress: 0 },
        { title: "Studi Kasus Industri", status: "locked", progress: 0 },
        { title: "Simulasi Kompetisi", status: "locked", progress: 0 },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 80, fontFamily: 'sans-serif' }}>

            {/* Navbar / Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
                    <Link
                        href={`/events/${eventId}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#64748b', textDecoration: 'none' }}
                    >
                        <span>← Kembali</span>
                        <span style={{ display: 'inline' }}>ke {event?.shortName}</span>
                    </Link>
                    <div style={{ fontSize: 10, fontWeight: 900, padding: '6px 14px', backgroundColor: '#f1f5f9', borderRadius: 99, color: '#64748b', transform: 'uppercase', letterSpacing: '0.05em' }}>
                        TRAINING MODE
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

                {/* Hero Section */}
                <div style={{ backgroundColor: 'white', borderRadius: 32, padding: 48, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, backgroundColor: '#f8fafc', borderRadius: 999, transform: 'translate(50%, -50%)' }} />

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <span style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#0f172a', color: 'white', fontSize: 24 }}>
                                {event?.icon}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{event?.name}</span>
                        </div>

                        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', marginBottom: 28, letterSpacing: '-0.02em' }}>{branchName}</h1>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                            <button style={{ padding: '16px 28px', backgroundColor: '#0f172a', color: 'white', fontWeight: 800, borderRadius: 16, border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(15,23,42,0.3)', fontSize: 14 }}>
                                Mulai Latihan Sekarang 🚀
                            </button>
                            <button style={{ padding: '16px 28px', backgroundColor: 'white', border: '2px solid #e2e8f0', color: '#334155', fontWeight: 800, borderRadius: 16, cursor: 'pointer', fontSize: 14 }}>
                                Unduh Silabus 📥
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>

                    {/* Left Column: Character Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ backgroundColor: 'white', borderRadius: 24, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>
                                Character Stats Required
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {event?.characterValues.map((val, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 8 }}>
                                            <span>{val}</span>
                                            <span style={{ color: event.color }}>Level {i + 1}</span>
                                        </div>
                                        <div style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                            <div
                                                style={{ height: '100%', borderRadius: 99, width: `${85 - (i * 10)}%`, backgroundColor: event.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#0f172a', borderRadius: 24, padding: 32, color: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Tips Juara 🏆</h3>
                            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, fontWeight: 500 }}>
                                "Konsistensi adalah kunci. Luangkan waktu minimal 30 menit setiap hari untuk mengasah skill teknis dan karaktermu."
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Training Modules */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>Modul Pelatihan</h2>
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8' }}>Total 4 Modul</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {modules.map((mod, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 20,
                                        backgroundColor: mod.status === 'open' ? 'white' : '#f8fafc',
                                        cursor: mod.status === 'open' ? 'pointer' : 'not-allowed',
                                        opacity: mod.status === 'open' ? 1 : 0.7,
                                        boxShadow: mod.status === 'open' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800,
                                        backgroundColor: mod.status === 'open' ? '#f0fdf4' : '#f1f5f9',
                                        color: mod.status === 'open' ? '#22c55e' : '#94a3b8'
                                    }}>
                                        {i + 1}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: 16, fontWeight: 800, color: mod.status === 'open' ? '#1e293b' : '#64748b', marginBottom: 4 }}>
                                            {mod.title}
                                        </h4>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                                            {mod.status === 'open' ? 'Siap dimulai' : 'Terkunci • Selesaikan modul sebelumnya'}
                                        </div>
                                    </div>

                                    <div style={{ fontSize: 20, color: '#cbd5e1' }}>
                                        {mod.status === 'open' ? '→' : '🔒'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 32, textAlign: 'center' }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', backgroundColor: '#f1f5f9', padding: '10px 20px', borderRadius: 12, display: 'inline-block' }}>
                                🚧 Konten pelatihan sedang dalam tahap penyusunan tim ahli.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
