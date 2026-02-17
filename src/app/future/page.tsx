"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect } from "react";

const PHASES = [
    {
        title: "Fase 1: Masa Sekolah",
        subtitle: "Kamu masih di SMK. Bagaimana kamu menghabiskan waktumu?",
        emoji: "🎒",
        color: "#3b82f6",
    },
    {
        title: "Fase 2: Setelah Lulus",
        subtitle: "Ijazah di tangan. Mau ke mana selanjutnya?",
        emoji: "🎓",
        color: "#8b5cf6",
    },
    {
        title: "Fase 3: Awal Karir",
        subtitle: "Tahun pertama di dunia nyata. Prioritasmu?",
        emoji: "💼",
        color: "#f59e0b",
    },
    {
        title: "Fase 4: Lima Tahun Ke Depan",
        subtitle: "Kamu sudah punya pengalaman. Investasi besar apa?",
        emoji: "🚀",
        color: "#22c55e",
    },
];

const STATS = [
    { key: "tech", label: "Technical Skill", icon: "💻", desc: "Kemampuan teknis & coding" },
    { key: "soft", label: "Soft Skill", icon: "🗣️", desc: "Komunikasi, leadership, teamwork" },
    { key: "network", label: "Networking", icon: "🤝", desc: "Koneksi & relasi profesional" },
    { key: "portfolio", label: "Portfolio", icon: "📂", desc: "Karya nyata & project" },
    { key: "health", label: "Kesehatan", icon: "💪", desc: "Fisik, mental, work-life balance" },
];

const SCENARIOS: {
    phase: number;
    text: string;
    options: { label: string; effects: Record<string, number> }[];
}[] = [
        // Phase 0 - School
        {
            phase: 0,
            text: "Ada kompetisi hackathon nasional minggu depan, tapi bertabrakan dengan turnamen futsal sekolahmu.",
            options: [
                { label: "Ikut hackathon, all-in coding!", effects: { tech: 4, portfolio: 3, health: -1 } },
                { label: "Ikut futsal, jaga kesehatan & persahabatan", effects: { health: 3, soft: 2, network: 1 } },
                { label: "Bagi waktu: latihan pagi, coding malam", effects: { tech: 2, health: 1, soft: 1, portfolio: 1 } },
            ]
        },
        {
            phase: 0,
            text: "Guru menawarkan kamu memimpin project kerja sama dengan perusahaan lokal. Jadwalmu sudah padat.",
            options: [
                { label: "Terima! Networking langsung dengan industri", effects: { network: 4, soft: 3, health: -2 } },
                { label: "Tolak halus, fokus kuatkan skill dulu", effects: { tech: 3, portfolio: 2 } },
                { label: "Delegasikan tugas tim, jadi coordinator", effects: { soft: 4, network: 2, portfolio: 1 } },
            ]
        },
        // Phase 1 - After Graduation
        {
            phase: 1,
            text: "Kamu diterima di kampus top, tapi juga dapat tawaran kerja remote dari startup.",
            options: [
                { label: "Kuliah dulu, perkuat fondasi ilmu", effects: { tech: 2, network: 3, soft: 2 } },
                { label: "Kerja di startup, belajar sambil jalan", effects: { tech: 3, portfolio: 3, health: -1 } },
                { label: "Kuliah + freelance malam hari", effects: { tech: 3, portfolio: 2, network: 1, health: -2 } },
            ]
        },
        {
            phase: 1,
            text: "Temanmu mengajak membangun startup bersama. Modal terbatas tapi ideanya brilian.",
            options: [
                { label: "Full commit! Ini momen 'now or never'", effects: { portfolio: 4, network: 2, health: -2 } },
                { label: "Gabung part-time, jaga stabilitas", effects: { portfolio: 2, network: 2, soft: 1 } },
                { label: "Tolak, fokus membangun skill mandiri dulu", effects: { tech: 4, portfolio: 1 } },
            ]
        },
        // Phase 2 - Early Career
        {
            phase: 2,
            text: "Perusahaan menawarkan promosi jadi team lead, tapi kamu masih ingin deep dive di coding.",
            options: [
                { label: "Ambil promosi, saatnya leveling up!", effects: { soft: 4, network: 3, tech: -1 } },
                { label: "Tetap di jalur teknis, jadi expert", effects: { tech: 5, portfolio: 2 } },
                { label: "Negosiasi: lead tapi tetap hands-on", effects: { soft: 2, tech: 2, network: 2, portfolio: 1 } },
            ]
        },
        {
            phase: 2,
            text: "Kamu burnout. Tubuh dan mentalmu butuh istirahat, tapi ada deadline besar.",
            options: [
                { label: "Push through, deadline lebih penting", effects: { portfolio: 3, tech: 1, health: -4 } },
                { label: "Ambil cuti, kesehatan nomor satu", effects: { health: 5, soft: 1, tech: -1 } },
                { label: "Minta bantuan tim, delegasikan beban", effects: { soft: 3, network: 2, health: 1 } },
            ]
        },
        // Phase 3 - Five Years Later
        {
            phase: 3,
            text: "Kamu punya tabungan cukup. Mau dipakai untuk apa?",
            options: [
                { label: "Bangun startup sendiri!", effects: { portfolio: 5, network: 3, health: -2 } },
                { label: "S2 di luar negeri, expand wawasan", effects: { tech: 3, network: 4, soft: 2 } },
                { label: "Investasi real estate & passive income", effects: { health: 3, network: 2, soft: 1 } },
            ]
        },
        {
            phase: 3,
            text: "Kamu dijanjikan posisi CTO di perusahaan besar, tapi harus pindah kota dan tinggalkan komunitasmu.",
            options: [
                { label: "Terima! Peluang besar, harus berani", effects: { tech: 3, network: 4, soft: 2, health: -1 } },
                { label: "Tolak, bangun bisnis sendiri di kampung halaman", effects: { portfolio: 4, soft: 2, health: 2, network: 1 } },
                { label: "Negosiasi remote, pertahankan akar", effects: { tech: 2, soft: 3, health: 3, network: 2 } },
            ]
        }
    ];

function getProfile(stats: Record<string, number>) {
    const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    const top = sorted[0][0];
    const second = sorted[1][0];

    const profiles: Record<string, { title: string; emoji: string; desc: string; badge: string }> = {
        "tech": { title: "Tech Visionary", emoji: "🧠", desc: "Kamu adalah master teknologi! Skill codingmu luar biasa dan portofoliomu mengesankan. Perusahaan besar mengincarmu.", badge: "Inovator Digital" },
        "soft": { title: "People Leader", emoji: "👑", desc: "Kamu tipe pemimpin natural! Kemampuan komunikasi dan leadershipmu membuka banyak pintu karir di level eksekutif.", badge: "Pemimpin Inspiratif" },
        "network": { title: "Connected Strategist", emoji: "🌐", desc: "Koneksimu luas dan kuat! Kamu selalu tahu orang yang tepat. Bisnismu berjalan karena relasi yang kamu bangun.", badge: "Master Networking" },
        "portfolio": { title: "Builder & Creator", emoji: "🔨", desc: "Kamu pembuat! Portofoliomu berbicara lebih keras dari CV. Startup atau proyek besarmu akan mengubah industri.", badge: "Kreator Produktif" },
        "health": { title: "Balanced Achiever", emoji: "⚖️", desc: "Kamu paham bahwa kesuksesan butuh keseimbangan. Karirmu stabil dan kesehatanmu terjaga untuk marathon jangka panjang.", badge: "Hidup Seimbang" },
    };

    return {
        ...profiles[top],
        topStat: top,
        secondStat: second,
        total: Object.values(stats).reduce((a, b) => a + b, 0),
    };
}

export default function FutureArchitect() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [stats, setStats] = useState<Record<string, number>>({ tech: 5, soft: 5, network: 5, portfolio: 5, health: 5 });
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showEffect, setShowEffect] = useState(false);
    const [lastEffects, setLastEffects] = useState<Record<string, number>>({});
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        if (authStatus === "unauthenticated") router.push("/auth/signin");
    }, [authStatus, router]);

    const phaseScenarios = SCENARIOS.filter(s => s.phase === currentPhase);
    const scenario = phaseScenarios[currentScenarioIndex % phaseScenarios.length];
    const phaseInfo = PHASES[currentPhase];

    const handleChoice = (optionIndex: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(optionIndex);

        const option = scenario.options[optionIndex];
        setLastEffects(option.effects);
        setHistory(prev => [...prev, option.label]);

        // Apply effects
        const newStats = { ...stats };
        Object.entries(option.effects).forEach(([key, val]) => {
            newStats[key] = Math.max(0, Math.min(30, (newStats[key] || 0) + val));
        });
        setStats(newStats);
        setShowEffect(true);

        setTimeout(() => {
            setShowEffect(false);
            setSelectedOption(null);

            // Move to next scenario or phase
            const nextIdx = currentScenarioIndex + 1;
            const remaining = phaseScenarios.filter((_, i) => i > currentScenarioIndex % phaseScenarios.length);

            if (remaining.length > 0) {
                setCurrentScenarioIndex(nextIdx);
            } else if (currentPhase < 3) {
                setCurrentPhase(currentPhase + 1);
                setCurrentScenarioIndex(0);
            } else {
                // Game finished
                saveAndFinish(newStats);
            }
        }, 1800);
    };

    const saveAndFinish = async (finalStats: Record<string, number>) => {
        setPhase("result");
        if (session?.user?.email) {
            const total = Object.values(finalStats).reduce((a, b) => a + b, 0);
            await supabase.from("user_progress").insert({
                user_email: session.user.email,
                mission_id: null,
                score: total * 10,
                choice_label: "FUTURE_ARCHITECT"
            });
        }
    };

    const startGame = () => {
        setPhase("playing");
        setCurrentPhase(0);
        setCurrentScenarioIndex(0);
        setStats({ tech: 5, soft: 5, network: 5, portfolio: 5, health: 5 });
        setHistory([]);
        setSelectedOption(null);
    };

    const totalProgress = currentPhase * 2 + (currentScenarioIndex % 2);
    const maxProgress = 8;

    // ========== INTRO ==========
    if (phase === "intro") {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        `}</style>
                <div style={{ textAlign: 'center' as const, maxWidth: 440, width: '100%' }}>
                    <div style={{ fontSize: 72, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🏗️</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase' as const, letterSpacing: '0.2em', marginBottom: 8 }}>Strategy Game</div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: 8 }}>
                        Arsitek Masa Depan
                    </h1>
                    <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 32 }}>
                        Buat keputusan strategis di <strong style={{ color: 'white' }}>4 fase kehidupan</strong>.<br />
                        Alokasikan energimu dengan bijak — setiap pilihan punya konsekuensi!
                    </p>

                    {/* Stats Preview */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 32, animation: 'fadeUp 0.6s ease 0.2s both' }}>
                        {STATS.map(stat => (
                            <div key={stat.key} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 4px', textAlign: 'center' as const }}>
                                <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                                <div style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const }}>{stat.label.split(' ')[0]}</div>
                            </div>
                        ))}
                    </div>

                    {/* Phases Preview */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32, animation: 'fadeUp 0.6s ease 0.4s both' }}>
                        {PHASES.map((p, i) => (
                            <div key={i} style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: `${p.color}22`, border: `1px solid ${p.color}44`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                            }}>
                                {p.emoji}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={startGame}
                        style={{
                            width: '100%', padding: 20, border: 'none', borderRadius: 18,
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            color: 'white', fontSize: 16, fontWeight: 900,
                            textTransform: 'uppercase' as const, letterSpacing: '0.2em',
                            cursor: 'pointer',
                            boxShadow: '0 12px 32px -4px rgba(139,92,246,0.5)',
                            animation: 'pulse 2s ease-in-out infinite',
                        }}
                    >
                        🎮 Mulai Strategi
                    </button>

                    <Link href="/" style={{ display: 'block', marginTop: 20, fontSize: 12, color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                        ← Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // ========== RESULT ==========
    if (phase === "result") {
        const profile = getProfile(stats);
        const maxStat = Math.max(...Object.values(stats));

        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)', padding: 24 }}>
                <style>{`
          @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); } 50% { box-shadow: 0 0 40px rgba(139,92,246,0.6); } }
        `}</style>
                <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' as const }}>
                    <div style={{ fontSize: 64, marginBottom: 8, animation: 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>{profile.emoji}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 4 }}>Profil Masa Depanmu</div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 4, animation: 'slideUp 0.5s ease 0.2s both' }}>{profile.title}</h1>
                    <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', fontSize: 10, fontWeight: 800, color: 'white', padding: '5px 14px', borderRadius: 99, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 20, animation: 'slideUp 0.5s ease 0.3s both' }}>
                        🏆 {profile.badge}
                    </span>

                    <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 28, animation: 'slideUp 0.5s ease 0.4s both' }}>
                        {profile.desc}
                    </p>

                    {/* Stat Bars */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, marginBottom: 20, textAlign: 'left' as const, animation: 'slideUp 0.5s ease 0.5s both' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 16 }}>Distribusi Skill</div>
                        {STATS.map(stat => {
                            const val = stats[stat.key] || 0;
                            const pct = maxStat > 0 ? (val / 30) * 100 : 0;
                            const barColor = stat.key === profile.topStat ? '#8b5cf6' : stat.key === profile.secondStat ? '#6366f1' : '#334155';
                            return (
                                <div key={stat.key} style={{ marginBottom: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{stat.icon} {stat.label}</span>
                                        <span style={{ fontSize: 14, fontWeight: 900, color: barColor === '#334155' ? '#94a3b8' : barColor, fontFamily: "'Courier New', monospace" }}>{val}</span>
                                    </div>
                                    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99, transition: 'width 1s ease', boxShadow: barColor !== '#334155' ? `0 0 10px ${barColor}66` : 'none' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Total Score */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, marginBottom: 20, animation: 'slideUp 0.5s ease 0.6s both, glow 3s ease-in-out infinite' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 6 }}>Skor Strategi</div>
                        <div style={{ fontSize: 40, fontWeight: 900, color: 'white', fontFamily: "'Courier New', monospace" }}>{profile.total * 10}</div>
                        <div style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700 }}>Strategy XP</div>
                    </div>

                    {/* Timeline */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, marginBottom: 28, textAlign: 'left' as const, animation: 'slideUp 0.5s ease 0.7s both' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 14 }}>Jejak Keputusanmu</div>
                        {history.map((h, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                                <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: 8, background: `${PHASES[Math.floor(i / 2)]?.color || '#6366f1'}22`, border: `1px solid ${PHASES[Math.floor(i / 2)]?.color || '#6366f1'}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: PHASES[Math.floor(i / 2)]?.color || '#6366f1' }}>{i + 1}</div>
                                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, fontWeight: 500 }}>{h}</div>
                            </div>
                        ))}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                        <button onClick={() => { setPhase("intro"); }} style={{
                            width: '100%', padding: 18, border: 'none', borderRadius: 16,
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white',
                            fontSize: 13, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.15em',
                            cursor: 'pointer', boxShadow: '0 8px 20px -4px rgba(139,92,246,0.4)',
                        }}>
                            🔄 Coba Strategi Lain
                        </button>
                        <Link href="/" style={{
                            display: 'block', textAlign: 'center' as const, padding: 16, borderRadius: 14,
                            background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: 12, fontWeight: 800,
                            textTransform: 'uppercase' as const, letterSpacing: '0.1em', textDecoration: 'none',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            Halaman Utama
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ========== PLAYING ==========
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)', padding: '24px 16px' }}>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes effectPop { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-20px) scale(1.2); opacity: 0; } }
      `}</style>
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
                {/* Progress bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Link href="/" style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                        ← Keluar
                    </Link>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{session?.user?.name?.split(" ")[0]}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa' }}>FASE {currentPhase + 1}/4</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: 20, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(totalProgress / maxProgress) * 100}%`, background: 'linear-gradient(90deg, #8b5cf6, #6366f1)', borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>

                {/* Phase Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 16,
                        background: `${phaseInfo.color}22`, border: `1px solid ${phaseInfo.color}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                    }}>
                        {phaseInfo.emoji}
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{phaseInfo.title}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{phaseInfo.subtitle}</div>
                    </div>
                </div>

                {/* Stats Mini Bar */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
                    {STATS.map(stat => (
                        <div key={stat.key} style={{ flex: 1, textAlign: 'center' as const, position: 'relative' }}>
                            <div style={{ fontSize: 14 }}>{stat.icon}</div>
                            <div style={{ fontSize: 12, fontWeight: 900, color: 'white', fontFamily: "'Courier New', monospace" }}>{stats[stat.key]}</div>
                            {showEffect && lastEffects[stat.key] && (
                                <div style={{
                                    position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                                    fontSize: 12, fontWeight: 900,
                                    color: lastEffects[stat.key] > 0 ? '#22c55e' : '#ef4444',
                                    animation: 'effectPop 1.5s ease forwards',
                                }}>
                                    {lastEffects[stat.key] > 0 ? '+' : ''}{lastEffects[stat.key]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Scenario Card */}
                <div key={`${currentPhase}-${currentScenarioIndex}`} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20, padding: 24, marginBottom: 20, animation: 'fadeIn 0.5s ease',
                }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: phaseInfo.color, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 10 }}>
                        ⚡ Situasi
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.6 }}>
                        {scenario.text}
                    </p>
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                    {scenario.options.map((option, i) => {
                        const isSelected = selectedOption === i;
                        return (
                            <div
                                key={i}
                                onClick={() => handleChoice(i)}
                                style={{
                                    background: isSelected ? `${phaseInfo.color}22` : 'rgba(255,255,255,0.04)',
                                    border: isSelected ? `2px solid ${phaseInfo.color}` : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 16, padding: 18,
                                    cursor: selectedOption === null ? 'pointer' : 'default',
                                    transition: 'all 0.3s',
                                    opacity: selectedOption !== null && !isSelected ? 0.3 : 1,
                                    animation: `fadeIn 0.4s ease ${0.1 * i}s both`,
                                }}
                            >
                                <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? 'white' : '#cbd5e1', lineHeight: 1.5, marginBottom: isSelected ? 10 : 0 }}>
                                    {option.label}
                                </div>
                                {isSelected && (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, animation: 'popIn 0.3s ease' }}>
                                        {Object.entries(option.effects).map(([key, val]) => (
                                            <span key={key} style={{
                                                fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                                                background: val > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                                color: val > 0 ? '#22c55e' : '#ef4444',
                                                border: `1px solid ${val > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                            }}>
                                                {STATS.find(s => s.key === key)?.icon} {val > 0 ? '+' : ''}{val}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
