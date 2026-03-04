"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CAREER_PATHS } from "@/data/careerData";

export default function KarierDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [careerId, setCareerId] = useState("");
    const [currentFact, setCurrentFact] = useState(0);
    const [factsRead, setFactsRead] = useState(new Set<number>());
    const [xpClaimed, setXpClaimed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAllSkills, setShowAllSkills] = useState(false);

    useEffect(() => {
        params.then(p => setCareerId(p.id));
    }, [params]);

    const career = CAREER_PATHS.find(c => c.id === careerId);

    if (!career) {
        return (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8' }}>Memuat karier...</div>
            </div>
        );
    }

    const allFactsRead = factsRead.size >= career.techFacts.length;

    const readFact = (idx: number) => {
        setCurrentFact(idx);
        setFactsRead(prev => new Set([...prev, idx]));
    };

    const claimXP = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/career-xp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ careerId: career.id, xp: career.xpReward }),
            });
            if (res.ok) setXpClaimed(true);
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    const levelColors = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' };
    const levelLabels = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Lanjutan' };

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Back */}
            <Link href="/karier" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#64748b', textDecoration: 'none', marginBottom: 24 }}>
                ← Kembali ke Career Explorer
            </Link>

            {/* Hero */}
            <div style={{
                background: career.gradient,
                borderRadius: 28, padding: 32, color: 'white', marginBottom: 24,
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>{career.emoji}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {career.jurusan.map(j => (
                            <span key={j} style={{ fontSize: 9, fontWeight: 900, background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>{j}</span>
                        ))}
                        <span style={{ fontSize: 9, fontWeight: 900, background: career.demandColor, color: 'white', padding: '3px 10px', borderRadius: 20 }}>
                            🔥 {career.demandLevel}
                        </span>
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6, lineHeight: 1.2 }}>
                        {career.title}
                    </h1>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{career.subtitle}</div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 14, backdropFilter: 'blur(4px)' }}>
                            <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.7, marginBottom: 2 }}>KISARAN GAJI</div>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{career.salaryRange}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 14, backdropFilter: 'blur(4px)' }}>
                            <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.7, marginBottom: 2 }}>XP REWARD</div>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>+{career.xpReward} XP</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div style={{
                background: 'white', borderRadius: 20, padding: 24,
                border: '1px solid #e5e7eb', marginBottom: 16,
            }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>📋 Tentang Karier Ini</h2>
                <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, fontWeight: 500 }}>{career.description}</div>
            </div>

            {/* What You Do */}
            <div style={{
                background: 'white', borderRadius: 20, padding: 24,
                border: '1px solid #e5e7eb', marginBottom: 16,
            }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>💼 Yang Kamu Kerjakan</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {career.whatYouDo.map((task, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#334155', lineHeight: 1.6, fontWeight: 500 }}>
                            <span style={{ width: 22, height: 22, borderRadius: 6, background: career.accentColor + '15', color: career.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                            {task}
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills Needed */}
            <div style={{
                background: 'white', borderRadius: 20, padding: 24,
                border: '1px solid #e5e7eb', marginBottom: 16,
            }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>🛠️ Skills yang Dibutuhkan</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {career.skillsNeeded.slice(0, showAllSkills ? undefined : 3).map((skill, i) => (
                        <div key={i} style={{
                            background: '#f8fafc', borderRadius: 14, padding: '14px 16px',
                            border: '1px solid #f1f5f9',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{skill.name}</span>
                                <span style={{
                                    fontSize: 9, fontWeight: 800,
                                    color: levelColors[skill.level],
                                    background: levelColors[skill.level] + '15',
                                    padding: '2px 8px', borderRadius: 6,
                                }}>{levelLabels[skill.level]}</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{skill.description}</div>
                        </div>
                    ))}
                    {career.skillsNeeded.length > 3 && (
                        <button onClick={() => setShowAllSkills(!showAllSkills)} style={{
                            background: 'none', border: 'none', color: career.accentColor,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '8px 0'
                        }}>
                            {showAllSkills ? '▲ Sembunyikan' : `▼ Lihat semua ${career.skillsNeeded.length} skills`}
                        </button>
                    )}
                </div>
            </div>

            {/* Tech Facts — THE MAIN XP FEATURE */}
            <div style={{
                background: `linear-gradient(135deg, ${career.accentColor}08, ${career.accentColor}04)`,
                borderRadius: 20, padding: 24,
                border: `1px solid ${career.accentColor}20`, marginBottom: 16,
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>🧠 Fakta Menarik Teknologi</h2>
                    <span style={{ fontSize: 10, fontWeight: 800, color: career.accentColor }}>
                        {factsRead.size}/{career.techFacts.length} dibaca
                    </span>
                </div>

                {/* Fact dots */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {career.techFacts.map((_, i) => (
                        <button key={i} onClick={() => readFact(i)} style={{
                            flex: 1, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                            background: factsRead.has(i) ? '#10b981' : i === currentFact ? career.accentColor : '#e5e7eb',
                            transition: 'all 0.3s',
                        }} />
                    ))}
                </div>

                {/* Current Fact */}
                <div style={{
                    background: 'white', borderRadius: 16, padding: 20,
                    border: '1px solid #e5e7eb', minHeight: 100,
                    position: 'relative',
                }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: career.accentColor, letterSpacing: '0.1em', marginBottom: 8 }}>
                        FAKTA #{currentFact + 1}
                    </div>
                    <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.8, fontWeight: 600 }}>
                        {career.techFacts[currentFact].fact}
                    </div>
                    {!factsRead.has(currentFact) && (
                        <div style={{
                            position: 'absolute', top: 12, right: 12,
                            fontSize: 8, fontWeight: 800, color: '#f59e0b',
                            background: '#fef3c7', padding: '2px 8px', borderRadius: 4,
                        }}>NEW</div>
                    )}
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                        onClick={() => readFact(Math.max(0, currentFact - 1))}
                        disabled={currentFact === 0}
                        style={{
                            flex: 1, padding: '10px', background: '#f1f5f9', border: 'none',
                            borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#64748b',
                            cursor: currentFact === 0 ? 'not-allowed' : 'pointer',
                            opacity: currentFact === 0 ? 0.4 : 1,
                        }}
                    >← Sebelumnya</button>
                    <button
                        onClick={() => readFact(Math.min(career.techFacts.length - 1, currentFact + 1))}
                        disabled={currentFact === career.techFacts.length - 1}
                        style={{
                            flex: 1, padding: '10px', background: career.accentColor, border: 'none',
                            borderRadius: 10, fontSize: 12, fontWeight: 700, color: 'white',
                            cursor: currentFact === career.techFacts.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: currentFact === career.techFacts.length - 1 ? 0.6 : 1,
                        }}
                    >Fakta Berikutnya →</button>
                </div>
            </div>

            {/* Real Companies */}
            <div style={{
                background: 'white', borderRadius: 20, padding: 24,
                border: '1px solid #e5e7eb', marginBottom: 16,
            }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>🏢 Perusahaan yang Merekrut</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {career.realCompanies.map(c => (
                        <span key={c} style={{
                            background: '#f8fafc', border: '1px solid #e5e7eb',
                            padding: '8px 16px', borderRadius: 12, fontSize: 12,
                            fontWeight: 700, color: '#334155'
                        }}>{c}</span>
                    ))}
                </div>
            </div>

            {/* Learning Path */}
            <div style={{
                background: 'white', borderRadius: 20, padding: 24,
                border: '1px solid #e5e7eb', marginBottom: 24,
            }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>🗺️ Learning Path</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {career.learningPath.map((step, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                                    background: career.accentColor, color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 800
                                }}>{i + 1}</div>
                                {i < career.learningPath.length - 1 && (
                                    <div style={{ width: 2, height: 24, background: '#e5e7eb' }} />
                                )}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', paddingTop: 4, lineHeight: 1.5 }}>{step}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Claim XP Button */}
            {allFactsRead && !xpClaimed && (
                <button
                    onClick={claimXP}
                    disabled={saving}
                    style={{
                        width: '100%', padding: '18px 24px',
                        background: `linear-gradient(135deg, ${career.accentColor}, ${career.accentColor}cc)`,
                        color: 'white', border: 'none', borderRadius: 16, fontSize: 16,
                        fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
                        boxShadow: `0 10px 30px -4px ${career.accentColor}50`,
                        opacity: saving ? 0.7 : 1,
                    }}
                >
                    {saving ? 'Menyimpan...' : `🎉 Klaim +${career.xpReward} XP — Semua Fakta Dibaca!`}
                </button>
            )}

            {xpClaimed && (
                <div style={{
                    width: '100%', padding: '18px 24px', textAlign: 'center',
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: 16, fontSize: 15, fontWeight: 800, color: '#065f46',
                }}>
                    ✅ +{career.xpReward} XP telah diklaim untuk karier ini!
                </div>
            )}

            {!allFactsRead && (
                <div style={{
                    width: '100%', padding: '14px 24px', textAlign: 'center',
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: 16, fontSize: 13, fontWeight: 700, color: '#92400e',
                }}>
                    💡 Baca semua {career.techFacts.length} fakta teknologi untuk mendapatkan +{career.xpReward} XP
                </div>
            )}
        </div>
    );
}
