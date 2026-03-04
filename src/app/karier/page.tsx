import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CAREER_PATHS, CAREER_CATEGORIES } from "@/data/careerData";

export const dynamic = "force-dynamic";

export default async function KarierPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");
    const userEmail = (session.user?.email || "").toLowerCase();

    // Fetch explored careers
    let exploredCareers = new Set<string>();
    let totalCareerXP = 0;
    try {
        const { data } = await supabase
            .from("user_progress")
            .select("mission_id, score")
            .eq("user_email", userEmail)
            .like("mission_id", "CAREER_EXPLORE_%");
        if (data) {
            data.forEach((p: any) => {
                const match = p.mission_id?.match(/CAREER_EXPLORE_(.+)/);
                if (match) {
                    exploredCareers.add(match[1]);
                    totalCareerXP += (p.score || 0);
                }
            });
        }
    } catch (e) { }

    const totalCareers = CAREER_PATHS.length;
    const exploredCount = exploredCareers.size;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#64748b', textDecoration: 'none', marginBottom: 24 }}>
                ← Beranda
            </Link>

            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0c4a6e 100%)',
                borderRadius: 28, padding: 32, color: 'white', marginBottom: 24,
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', bottom: -40, left: -20, width: 160, height: 160, background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)', filter: 'blur(30px)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, background: '#f59e0b', color: '#1e293b', padding: '4px 12px', borderRadius: 20, letterSpacing: '0.1em' }}>CAREER EXPLORER</span>
                        <span style={{ fontSize: 9, fontWeight: 900, background: 'rgba(255,255,255,0.15)', color: 'white', padding: '4px 12px', borderRadius: 20 }}>{totalCareers} KARIER</span>
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.2 }}>
                        Potensi Karier Masa Depan 🚀
                    </h1>
                    <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, maxWidth: 440 }}>
                        Jelajahi karier IT yang menjanjikan untuk lulusan RPL, TKJ & PG. Baca fakta menarik dan dapatkan XP!
                    </div>
                </div>
            </div>

            {/* Progress Card */}
            <div style={{
                background: 'white', borderRadius: 20, padding: 20,
                border: '1px solid #e5e7eb', marginBottom: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 4 }}>Progress Eksplorasi</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>
                        {exploredCount}<span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}> / {totalCareers} karier</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>+{totalCareerXP}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>XP EARNED</div>
                </div>
            </div>

            {/* Category Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {CAREER_CATEGORIES.map(cat => {
                    const count = CAREER_PATHS.filter(c => c.category === cat.id).length;
                    return (
                        <div key={cat.id} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: cat.color + '12', border: `1px solid ${cat.color}30`,
                            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: cat.color
                        }}>
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                            <span style={{ background: cat.color + '20', padding: '1px 6px', borderRadius: 10, fontSize: 9, fontWeight: 800 }}>{count}</span>
                        </div>
                    );
                })}
            </div>

            {/* Career Cards by Category */}
            {CAREER_CATEGORIES.map(cat => {
                const careers = CAREER_PATHS.filter(c => c.category === cat.id);
                if (careers.length === 0) return null;
                return (
                    <div key={cat.id} style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <div style={{ width: 4, height: 24, background: cat.color, borderRadius: 2 }} />
                            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b' }}>{cat.icon} {cat.label}</h2>
                            <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', padding: '3px 10px', borderRadius: 20 }}>{cat.jurusan}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {careers.map(career => {
                                const isExplored = exploredCareers.has(career.id);
                                return (
                                    <Link
                                        key={career.id}
                                        href={`/karier/${career.id}`}
                                        style={{
                                            background: 'white', borderRadius: 20, padding: '18px 18px',
                                            border: `1px solid ${isExplored ? '#d1fae5' : '#e5e7eb'}`,
                                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14,
                                            transition: 'all 0.2s',
                                            boxShadow: isExplored ? '0 2px 8px rgba(16,185,129,0.08)' : '0 2px 6px rgba(0,0,0,0.03)',
                                        }}
                                    >
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                                            background: career.gradient,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 22, boxShadow: `0 4px 14px ${career.accentColor}30`
                                        }}>
                                            {career.emoji}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                                                {career.jurusan.map(j => (
                                                    <span key={j} style={{ fontSize: 8, fontWeight: 800, color: cat.color, background: cat.color + '15', padding: '1px 6px', borderRadius: 4 }}>{j}</span>
                                                ))}
                                                <span style={{
                                                    fontSize: 8, fontWeight: 800,
                                                    color: career.demandColor,
                                                    background: career.demandColor + '15',
                                                    padding: '1px 6px', borderRadius: 4
                                                }}>
                                                    {career.demandLevel}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 2 }}>{career.title}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{career.subtitle} · {career.salaryRange}</div>
                                            {isExplored && (
                                                <div style={{ fontSize: 9, fontWeight: 800, color: '#10b981', marginTop: 4 }}>✓ EXPLORED · +{career.xpReward} XP</div>
                                            )}
                                        </div>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                            background: isExplored ? '#d1fae5' : '#f8fafc',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: isExplored ? '#10b981' : '#94a3b8', fontSize: 13, fontWeight: 700
                                        }}>
                                            {isExplored ? '✓' : '→'}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
