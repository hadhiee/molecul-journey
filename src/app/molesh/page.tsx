import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function MoleshDashboard() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");

    const userEmail = session.user?.email?.toLowerCase();

    // Fetch completed sessions to show checkmarks
    let completedSessions = new Set<string>();
    if (userEmail) {
        const { data } = await supabase
            .from("user_progress")
            .select("mission_id")
            .eq("user_email", userEmail)
            .like("mission_id", "MOLESH_%");

        if (data) data.forEach(p => completedSessions.add(p.mission_id));
    }

    const curriculum = [
        {
            id: "S2",
            title: "Sadari: Personal Branding & Growth Mindset",
            subtitle: "The Debugging Mindset: Error bukan identitas diri.",
            emoji: "🧠",
            xp: 1000,
            color: "#6366f1",
            bg: "#eef2ff",
            desc: "Deep Dive 'Sadari' untuk siswa IT / Moklet."
        },
        {
            id: "S3",
            title: "Peduli: Kolaborasi Tim IT (Scrum & Peer Review)",
            subtitle: "Psychological Safety & Sandwich Feedback.",
            emoji: "🤝",
            xp: 1000,
            color: "#059669",
            bg: "#ecfdf5",
            desc: "Membangun empati dalam bekerja sama di proyek teknis."
        },
        {
            id: "S4",
            title: "Berani: Keputusan Cepat & Etika Digital",
            subtitle: "Fail Fast, Learn Faster & Integritas Profesional.",
            emoji: "🚀",
            xp: 1000,
            color: "#be123c",
            bg: "#fff1f2",
            desc: "Melatih keberanian mengambil tanggung jawab."
        },
        {
            id: "S5",
            title: "Implementasi MOLESH dalam Organisasi",
            subtitle: "Situational Leadership & Conflict Resolution.",
            emoji: "👑",
            xp: 1000,
            color: "#1e1b4b",
            bg: "#f8fafc",
            desc: "Penerapan pilar MOLESH dalam konteks OSIS/Kepemimpinan."
        },
        {
            id: "S6",
            title: "Final Project: Rencana Aksi Moklet Hebat",
            subtitle: "Sustainability & Personal Leadership Roadmap.",
            emoji: "🏅",
            xp: 1000,
            color: "#d97706",
            bg: "#fffbeb",
            desc: "Merangkum seluruh materi menjadi komitmen nyata."
        }
    ];

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header Awareness */}
            <Link href="/" style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, color: '#64748b', textDecoration: 'none', marginBottom: 24 }}>
                ← Kembali ke Home
            </Link>

            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                borderRadius: 32, padding: '32px 24px', color: 'white',
                marginBottom: 32, position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 48px -12px rgba(30,27,75,0.3)'
            }}>
                <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, fontSize: 120 }}>🛡️</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, background: 'rgba(255,255,255,0.2)', color: 'white', padding: '6px 14px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16, display: 'inline-block' }}>
                        Advanced Curriculum
                    </span>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 12 }}>
                        Moklet Leadership (MOLESH)
                    </h1>
                    <p style={{ fontSize: 15, opacity: 0.8, fontWeight: 500, lineHeight: 1.5, maxWidth: 500 }}>
                        Lanjut perjalananmu menjadi pemimpin IT masa depan melalui tiga pilar: <span style={{ fontWeight: 900, color: '#f8fafc' }}>Sadari, Peduli, Berani.</span>
                    </p>
                </div>
            </div>

            {/* Curriculum List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {curriculum.map((session, i) => {
                    const isCompleted = completedSessions.has(`MOLESH_${session.id}`);
                    return (
                        <Link key={session.id} href={`/molesh/${session.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{
                                background: 'white', borderRadius: 24, padding: 20,
                                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16,
                                transition: 'all 0.3s ease', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: 16, background: session.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 28, flexShrink: 0
                                }}>
                                    {session.emoji}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 10, fontWeight: 900, color: session.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Sesi {i + 2} {isCompleted && '✅ LULU'}
                                        </span>
                                        <span style={{ width: 4, height: 4, borderRadius: 2, background: '#cbd5e1' }} />
                                        <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b' }}>+1.000 XP</span>
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#1e293b', marginBottom: 2 }}>{session.title}</h3>
                                    <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {session.subtitle}
                                    </p>
                                </div>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 10, background: '#f8fafc',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 14, flexShrink: 0
                                }}>
                                    →
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Footer Encouragement */}
            <div style={{ marginTop: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>Misi Anda: Selesaikan semua Pilar Leadership</div>
                <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {[2, 3, 4, 5, 6].map(s => (
                        <div key={s} style={{
                            width: 32, height: 8, borderRadius: 4,
                            background: completedSessions.has(`MOLESH_S${s}`) ? '#1e1b4b' : '#e2e8f0'
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
