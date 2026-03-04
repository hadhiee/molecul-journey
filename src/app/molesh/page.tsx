import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MOLESH_SESSIONS } from "@/data/moleshData";

export const dynamic = "force-dynamic";

export default async function MoleshPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");

    const userEmail = (session.user?.email || "").toLowerCase();

    // Fetch completed MOLESH sessions
    let completedSessions = new Set<number>();
    let sessionScores: Record<number, number> = {};
    try {
        const { data } = await supabase
            .from("user_progress")
            .select("mission_id, score")
            .eq("user_email", userEmail)
            .like("mission_id", "MOLESH_SESI_%");

        if (data) {
            data.forEach((p: any) => {
                const match = p.mission_id?.match(/MOLESH_SESI_(\d+)/);
                if (match) {
                    const sesiNum = parseInt(match[1]);
                    completedSessions.add(sesiNum);
                    sessionScores[sesiNum] = Math.max(sessionScores[sesiNum] || 0, p.score || 0);
                }
            });
        }
    } catch (e) { }

    const totalScore = Object.values(sessionScores).reduce((a, b) => a + b, 0);
    const maxScore = MOLESH_SESSIONS.reduce((a, s) => a + s.xpReward, 0);
    const progressPercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    const pilarProgress = {
        sadari: { done: 0, total: 2 },
        peduli: { done: 0, total: 1 },
        berani: { done: 0, total: 1 },
    };
    if (completedSessions.has(1)) pilarProgress.sadari.done++;
    if (completedSessions.has(2)) pilarProgress.sadari.done++;
    if (completedSessions.has(3)) pilarProgress.peduli.done++;
    if (completedSessions.has(4)) pilarProgress.berani.done++;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#64748b', textDecoration: 'none', marginBottom: 24 }}>
                ← Beranda
            </Link>

            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                borderRadius: 28, padding: 32, color: 'white', marginBottom: 24,
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 10, fontWeight: 900, background: '#f59e0b', color: '#1e293b', padding: '4px 12px', borderRadius: 20, letterSpacing: '0.1em' }}>KURIKULUM</span>
                        <span style={{ fontSize: 10, fontWeight: 900, background: 'rgba(255,255,255,0.15)', color: 'white', padding: '4px 12px', borderRadius: 20, letterSpacing: '0.1em' }}>6 SESI</span>
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.2 }}>
                        MOLESH
                    </h1>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#94a3b8', marginBottom: 20, lineHeight: 1.5 }}>
                        Moklet Leadership: <span style={{ color: '#60a5fa' }}>Sadari</span>, <span style={{ color: '#34d399' }}>Peduli</span>, <span style={{ color: '#f87171' }}>Berani</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, maxWidth: 500 }}>
                        Program leadership khusus siswa RPL, TKJ & PG — dihubungkan dengan konteks kerja tim di proyek perangkat lunak, manajemen jaringan, dan etika profesional dunia digital.
                    </div>
                </div>
            </div>

            {/* Progress Card */}
            <div style={{
                background: 'white', borderRadius: 20, padding: 24,
                border: '1px solid #e5e7eb', marginBottom: 24,
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>Progres Belajar</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>{totalScore}<span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}> / {maxScore} XP</span></div>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                        { label: 'SADARI', color: '#2563eb', bg: '#dbeafe', done: pilarProgress.sadari.done, total: pilarProgress.sadari.total },
                        { label: 'PEDULI', color: '#059669', bg: '#d1fae5', done: pilarProgress.peduli.done, total: pilarProgress.peduli.total },
                        { label: 'BERANI', color: '#dc2626', bg: '#fee2e2', done: pilarProgress.berani.done, total: pilarProgress.berani.total },
                    ].map(p => (
                        <div key={p.label} style={{ background: p.bg, borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
                            <div style={{ fontSize: 9, fontWeight: 900, color: p.color, letterSpacing: '0.1em', marginBottom: 6 }}>{p.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: p.color }}>{p.done}<span style={{ fontSize: 11, color: '#94a3b8' }}>/{p.total}</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Session Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {MOLESH_SESSIONS.map((sesi, index) => {
                    const isComplete = completedSessions.has(sesi.id);
                    const score = sessionScores[sesi.id] || 0;
                    const isLocked = index > 0 && !completedSessions.has(MOLESH_SESSIONS[index - 1].id);

                    return (
                        <Link
                            key={sesi.id}
                            href={isLocked ? '#' : `/molesh/${sesi.id}`}
                            style={{
                                background: isLocked ? '#f8fafc' : 'white',
                                borderRadius: 20, padding: '20px 20px',
                                border: `1px solid ${isComplete ? '#d1fae5' : isLocked ? '#f1f5f9' : '#e5e7eb'}`,
                                textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: 16,
                                opacity: isLocked ? 0.5 : 1,
                                pointerEvents: isLocked ? 'none' : 'auto',
                                transition: 'all 0.2s',
                                boxShadow: isComplete ? '0 2px 8px rgba(16,185,129,0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
                            }}
                        >
                            {/* Number/Status */}
                            <div style={{
                                width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                                background: isComplete ? '#10b981' : isLocked ? '#e2e8f0' : sesi.pilarBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: isComplete ? 20 : 24,
                                color: isComplete ? 'white' : undefined,
                                boxShadow: isComplete ? '0 4px 12px rgba(16,185,129,0.3)' : 'none'
                            }}>
                                {isLocked ? '🔒' : isComplete ? '✓' : sesi.emoji}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 9, fontWeight: 900, color: sesi.pilarColor, background: sesi.pilarBg, padding: '2px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>
                                        {sesi.pilar}
                                    </span>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Sesi {sesi.id}</span>
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: isLocked ? '#94a3b8' : '#1e293b', marginBottom: 2 }}>{sesi.title}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{sesi.subtitle} · {sesi.duration}</div>
                                {isComplete && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                        <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981' }}>✓ Selesai</span>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>+{score} XP</span>
                                    </div>
                                )}
                            </div>

                            {/* Arrow */}
                            <div style={{
                                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                background: isLocked ? '#f1f5f9' : '#f8fafc',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isLocked ? '#cbd5e1' : '#94a3b8', fontSize: 14, fontWeight: 700
                            }}>→</div>
                        </Link>
                    );
                })}
            </div>

            {/* SMK Telkom Info */}
            <div style={{
                marginTop: 32, background: 'linear-gradient(135deg, #1e3a5f, #1e40af)',
                borderRadius: 24, padding: 24, color: 'white',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#93c5fd', letterSpacing: '0.15em', marginBottom: 10 }}>SCHOOL OF GLOBAL DIGITALENT</div>
                    <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>SMK Telkom Malang</div>
                    <div style={{ fontSize: 12, color: '#93c5fd', lineHeight: 1.6, marginBottom: 16 }}>
                        Vocational Competencies: Software Engineering (RPL), Computer & Network Engineering (TKJ), Game Development (PG)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {[
                            { label: 'RPL', desc: 'Full-stack, Mobile, UI/UX', icon: '💻' },
                            { label: 'TKJ', desc: 'Cyber Security, Cloud', icon: '🌐' },
                            { label: 'PG', desc: 'Game Art & Programming', icon: '🎮' },
                        ].map(c => (
                            <div key={c.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 10px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
                                <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
                                <div style={{ fontSize: 11, fontWeight: 800 }}>{c.label}</div>
                                <div style={{ fontSize: 9, color: '#93c5fd', marginTop: 2 }}>{c.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
