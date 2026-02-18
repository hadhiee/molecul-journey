"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SYSTEM_IDS } from "@/lib/ids";
import Link from "next/link";
import { LEVELS, ATTITUDE_META, getGrade, type AttitudeScores, type Location, type Scenario, type Choice, type Level } from "./data";

export default function JourneyMap() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // --- STATE MANAGEMENT ---
    const [phase, setPhase] = useState<"intro" | "avatarSelect" | "levelSelect" | "map" | "scenario" | "feedback" | "levelComplete" | "result">("intro");
    const [character, setCharacter] = useState<"boy" | "girl">("boy");

    // Game State
    const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]);
    const [completedLevels, setCompletedLevels] = useState<number[]>([]);
    const [visited, setVisited] = useState<string[]>([]);
    const [scores, setScores] = useState<AttitudeScores>({ respect: 5, communication: 5, focus: 5, teamwork: 5, discipline: 5 });
    const [log, setLog] = useState<{ loc: string; emoji: string; choice: string; quality: string; level: number }[]>([]);

    // Interaction State
    const [curLoc, setCurLoc] = useState<Location | null>(null);
    const [curScenario, setCurScenario] = useState<Scenario | null>(null);
    const [selChoice, setSelChoice] = useState<Choice | null>(null);

    // Animation State
    const [playerPos, setPlayerPos] = useState({ x: 50, y: 95 });
    const [moving, setMoving] = useState(false);

    // --- AUTH CHECK ---
    useEffect(() => { if (status === "unauthenticated") router.push("/auth/signin"); }, [status, router]);

    // --- LOGIC HELPER ---
    const getAvatarEmoji = () => character === "girl" ? "👩‍🎓" : "🧑‍🎓";

    const getAvail = (): Location[] => {
        if (visited.length === 0) return [currentLevel.locations[0]];
        const avail: Location[] = [];
        currentLevel.paths.forEach(p => {
            if (visited.includes(p.from) && !visited.includes(p.to)) {
                const l = currentLevel.locations.find(x => x.id === p.to);
                if (l) avail.push(l);
            }
        });
        return avail;
    };

    const moveTo = (loc: Location & { x?: number, y?: number }) => {
        setMoving(true);
        // Use provided x/y if logical positions are overridden by visual layout
        setPlayerPos({ x: loc.x, y: loc.y });

        setTimeout(() => {
            setMoving(false);
            setCurLoc(loc);
            const s = loc.scenarios[Math.floor(Math.random() * loc.scenarios.length)];
            setCurScenario(s);
            setPhase("scenario");
        }, 800); // Increased timing for smoother walk
    };

    const choose = (c: Choice) => {
        setSelChoice(c);
        const ns = { ...scores };
        Object.entries(c.effects).forEach(([k, v]) => {
            ns[k as keyof AttitudeScores] = Math.max(0, Math.min(20, (ns[k as keyof AttitudeScores] || 0) + (v || 0)));
        });
        setScores(ns);
        setLog(p => [...p, { loc: curLoc?.name || "", emoji: curLoc?.emoji || "", choice: c.text, quality: c.quality, level: currentLevel.id }]);
        setVisited(p => [...p, curLoc?.id || ""]);
        setPhase("feedback");
    };

    const afterFeedback = () => {
        setSelChoice(null); setCurScenario(null);
        const allVisited = visited.length >= currentLevel.locations.length;
        if (allVisited) {
            setCompletedLevels(p => [...p, currentLevel.id]);
            const nextLvl = LEVELS.find(l => l.id === currentLevel.id + 1);
            if (nextLvl) { setPhase("levelComplete"); }
            else { finishAll(); }
        } else {
            setPhase("map");
        }
    };

    const goNextLevel = () => {
        const next = LEVELS.find(l => l.id === currentLevel.id + 1);
        if (next) { setCurrentLevel(next); setVisited([]); setPlayerPos({ x: 50, y: 95 }); setPhase("map"); }
    };

    const finishAll = async () => {
        setPhase("result");
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        if (session?.user?.email) {
            await supabase.from("user_progress").insert({ user_email: session.user.email, mission_id: SYSTEM_IDS.JOURNEY_MAP, score: total * 10, choice_label: "JOURNEY_MAP" });
        }
    };

    const reset = () => {
        setPhase("intro"); setCharacter("boy"); setCompletedLevels([]); setVisited([]); setCurLoc(null); setCurScenario(null); setSelChoice(null);
        setScores({ respect: 5, communication: 5, focus: 5, teamwork: 5, discipline: 5 }); setLog([]); setPlayerPos({ x: 50, y: 95 });
        setCurrentLevel(LEVELS[0]);
    };

    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    // --- RENDER HELPERS ---
    const getLocationStyle = (index: number, total: number) => {
        // Dynamic Zigzag Pattern for Map
        const isLeft = index % 2 === 0;
        const x = isLeft ? 30 : 70;
        const y = 85 - (index / (total - 1)) * 65; // Draw from bottom (85%) to top (20%)
        return { x, y };
    };

    // ===== INTRO =====
    if (phase === "intro") {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#fefce8,#ecfccb,#d9f99d)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', sans-serif" }}>
                <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}} @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}`}</style>
                <div style={{ textAlign: 'center', maxWidth: 440, width: '100%' }}>
                    <div style={{ fontSize: 64, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🗺️</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#65a30d', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>Moklet Journey</div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1a2e05', letterSpacing: '-0.02em', marginBottom: 12 }}>Peta Petualangan</h1>
                    <p style={{ fontSize: 14, color: '#4d7c0f', lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>
                        Jelajahi <strong>16 lokasi</strong> di <strong>5 level</strong>!<br />Tunjukkan budaya ATTITUDE-mu.
                    </p>
                    <button onClick={() => setPhase("avatarSelect")} style={{ width: '100%', padding: 20, border: 'none', borderRadius: 20, background: 'linear-gradient(135deg,#65a30d,#4d7c0f)', color: 'white', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 10px 30px -5px rgba(101,163,13,0.5)', animation: 'pulse 2s infinite' }}>
                        🚀 Mulai Misi
                    </button>
                    <Link href="/" style={{ display: 'block', marginTop: 20, fontSize: 13, color: '#65a30d', textDecoration: 'none', fontWeight: 600 }}>← Kembali ke Dashboard</Link>
                </div>
            </div>
        );
    }

    // ===== AVATAR SELECT =====
    if (phase === "avatarSelect") {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#ecfccb,#d9f99d)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', sans-serif" }}>
                <div style={{ textAlign: 'center', width: '100%', maxWidth: 400 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1a2e05', marginBottom: 8 }}>Pilih Karaktermu</h2>
                    <p style={{ color: '#4d7c0f', marginBottom: 32, fontWeight: 600 }}>Siapakah yang akan menjelajahi sekolah?</p>

                    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 40 }}>
                        <div
                            onClick={() => { setCharacter("boy"); setCurrentLevel(LEVELS[0]); setVisited([]); setPlayerPos({ x: 50, y: 95 }); setPhase("map"); }}
                            style={{ background: 'white', padding: 24, borderRadius: 24, cursor: 'pointer', border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transition: 'transform 0.2s', width: 140 }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ fontSize: 64, marginBottom: 12 }}>🧑‍🎓</div>
                            <div style={{ fontWeight: 800, color: '#1a2e05', fontSize: 16 }}>Siswa</div>
                        </div>

                        <div
                            onClick={() => { setCharacter("girl"); setCurrentLevel(LEVELS[0]); setVisited([]); setPlayerPos({ x: 50, y: 95 }); setPhase("map"); }}
                            style={{ background: 'white', padding: 24, borderRadius: 24, cursor: 'pointer', border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transition: 'transform 0.2s', width: 140 }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ fontSize: 64, marginBottom: 12 }}>👩‍🎓</div>
                            <div style={{ fontWeight: 800, color: '#1a2e05', fontSize: 16 }}>Siswi</div>
                        </div>
                    </div>

                    <button onClick={() => setPhase("intro")} style={{ background: 'transparent', border: 'none', color: '#65a30d', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>← Kembali</button>
                </div>
            </div>
        );
    }

    // ===== MAP =====
    if (phase === "map") {
        const avail = getAvail();
        const allDone = visited.length >= currentLevel.locations.length;

        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f0fdf4,#dcfce7, #bbf7d0)', padding: '20px 0', fontFamily: "'Inter', sans-serif" }}>
                <style>{`
                    @keyframes bounce { 0%, 100% { transform: translate(-50%, -50%) translateY(0); } 50% { transform: translate(-50%, -50%) translateY(-10px); } }
                    @keyframes glow { 0%, 100% { box-shadow: 0 0 15px rgba(101,163,13,0.4); transform: translate(-50%, -50%) scale(1); } 50% { box-shadow: 0 0 30px rgba(101,163,13,0.8); transform: translate(-50%, -50%) scale(1.1); } }
                    @keyframes walk { 0% { transform: translate(-50%, -60%) rotate(-5deg); } 50% { transform: translate(-50%, -70%) rotate(5deg); } 100% { transform: translate(-50%, -60%) rotate(-5deg); } }
                    @keyframes floatCloud { 0% { transform: translateX(0); } 100% { transform: translateX(50px); } }
                `}</style>

                <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', height: '90vh' }}>

                    {/* Header */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.5)', marginBottom: 20 }}>
                        <Link href="/" style={{ fontSize: 18, color: '#4d7c0f', textDecoration: 'none', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ecfccb', borderRadius: 10 }}>←</Link>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#65a30d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>LEVEL {currentLevel.id}</div>
                            <div style={{ fontSize: 15, fontWeight: 900, color: '#1a2e05' }}>{currentLevel.title}</div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: 8 }}>{visited.length}/{currentLevel.locations.length}</div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 24, justifyContent: 'center' }}>
                        {ATTITUDE_META.map(a => (
                            <div key={a.key} style={{ background: 'white', borderRadius: 10, padding: '4px 8px', textAlign: 'center', minWidth: 50, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                                <div style={{ fontSize: 14 }}>{a.icon}</div>
                                <div style={{ fontSize: 11, fontWeight: 900, color: a.color }}>{scores[a.key as keyof AttitudeScores]}</div>
                            </div>
                        ))}
                    </div>

                    {/* Map Area */}
                    <div style={{ flex: 1, position: 'relative', borderRadius: 24, background: 'linear-gradient(180deg, #86efac 0%, #4ade80 100%)', border: '4px solid #bbf7d0', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        {/* Deco */}
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(circle at 10px 10px, white 2px, transparent 0)', backgroundSize: '30px 30px' }} />
                        <div style={{ position: 'absolute', top: 20, left: '10%', fontSize: 24, opacity: 0.6, animation: 'floatCloud 10s infinite alternate linear' }}>☁️</div>
                        <div style={{ position: 'absolute', bottom: 40, left: 20, fontSize: 20, opacity: 0.4 }}>🌳</div>

                        {/* Path Lines */}
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                            {currentLevel.locations.map((loc, i) => {
                                if (i === 0) return null;
                                const p1 = getLocationStyle(i - 1, currentLevel.locations.length);
                                const p2 = getLocationStyle(i, currentLevel.locations.length);
                                const isVisitedPath = visited.includes(currentLevel.locations[i - 1].id);
                                return (
                                    <line key={i} x1={`${p1.x}%`} y1={`${p1.y}%`} x2={`${p2.x}%`} y2={`${p2.y}%`} stroke={isVisitedPath ? "white" : "rgba(255,255,255,0.4)"} strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" />
                                );
                            })}
                        </svg>

                        {/* Nodes */}
                        {currentLevel.locations.map((loc, i) => {
                            const pos = getLocationStyle(i, currentLevel.locations.length);
                            const iv = visited.includes(loc.id);
                            const ia = avail.some(a => a.id === loc.id);
                            return (
                                <div key={loc.id} onClick={() => ia && !moving ? moveTo({ ...loc, x: pos.x, y: pos.y }) : null}
                                    style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', zIndex: ia ? 10 : 5, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: ia && !moving ? 'pointer' : 'default', animation: ia && !moving ? 'bounce 2s ease-in-out infinite' : 'none' }}>
                                    <div style={{ width: ia ? 60 : 50, height: ia ? 60 : 50, borderRadius: 20, background: iv ? '#bbf7d0' : ia ? 'white' : 'rgba(255,255,255,0.6)', border: ia ? `4px solid ${loc.color}` : `3px solid ${iv ? '#86efac' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: ia ? 28 : 20, boxShadow: ia ? '0 10px 25px -5px rgba(0,0,0,0.2)' : 'none', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', animation: ia ? 'glow 2s infinite' : 'none', opacity: iv ? 0.8 : 1 }}>
                                        {iv ? '✅' : loc.emoji}
                                    </div>
                                    <div style={{ marginTop: 8, padding: '4px 10px', background: 'rgba(255,255,255,0.9)', borderRadius: 12, fontSize: 11, fontWeight: 800, color: '#1a2e05', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>{loc.name}</div>
                                </div>
                            );
                        })}

                        {/* Player */}
                        <div style={{ position: 'absolute', left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: 'translate(-50%, -50%)', zIndex: 20, transition: moving ? 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none', pointerEvents: 'none' }}>
                            <div style={{ fontSize: 48, filter: 'drop-shadow(0 8px 4px rgba(0,0,0,0.2))', animation: moving ? 'walk 0.4s linear infinite' : 'bounce 3s ease-in-out infinite' }}>{getAvatarEmoji()}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 20, textAlign: 'center', height: 40 }}>
                        {allDone ? (
                            <button onClick={() => { setCompletedLevels(p => [...p, currentLevel.id]); const next = LEVELS.find(l => l.id === currentLevel.id + 1); if (next) setPhase("levelComplete"); else finishAll(); }} style={{ width: '100%', padding: 14, border: 'none', borderRadius: 16, background: `linear-gradient(135deg,${currentLevel.color}, #166534)`, color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                ✅ Level Selesai! Lanjut →
                            </button>
                        ) : (
                            <div style={{ fontSize: 13, color: '#4d7c0f', fontWeight: 600, background: 'rgba(255,255,255,0.5)', display: 'inline-block', padding: '8px 16px', borderRadius: 20 }}>
                                {moving ? 'Sedang berjalan...' : 'Tap lokasi yang menyala!'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ===== SCENARIO, FEEDBACK, LEVEL COMPLETE, RESULT (Simplified for brevity, ensuring logic exists) =====
    // Re-using the same simplified logical blocks but ensuring variable names match new state
    if (phase === "scenario" && curScenario && curLoc) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f0fdf4,#ecfccb)', padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ maxWidth: 500, width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ fontSize: 40 }}>{curLoc.emoji}</div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a2e05' }}>{curLoc.name}</div>
                            <div style={{ fontSize: 12, color: '#15803d', fontWeight: 700 }}>{curScenario.category}</div>
                        </div>
                    </div>
                    <div style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', lineHeight: 1.6 }}>{curScenario.situation}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {curScenario.choices.map((c, i) => (
                            <button key={i} onClick={() => choose(c)} style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: 600, color: '#1f2937', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                                <span style={{ marginRight: 8, fontWeight: 800, color: curLoc.color }}>{String.fromCharCode(65 + i)}</span> {c.text}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (phase === "feedback" && selChoice) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f0fdf4,#ecfccb)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>{selChoice.quality === "best" ? "🌟" : selChoice.quality === "good" ? "👍" : "😬"}</div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1a2e05', marginBottom: 12 }}>{selChoice.quality === "best" ? "Luar Biasa!" : "Keputusan Menarik"}</h2>
                    <div style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{selChoice.feedback}</p>
                    </div>
                    <button onClick={afterFeedback} style={{ width: '100%', padding: 16, background: '#16a34a', color: 'white', border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Lanjutkan</button>
                </div>
            </div>
        );
    }

    if (phase === "levelComplete") {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#fefce8,#ecfccb)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1a2e05', marginBottom: 8 }}>Level {currentLevel.id} Selesai!</h2>
                    <p style={{ fontSize: 14, color: '#4d7c0f', marginBottom: 24 }}>{currentLevel.title}</p>
                    <button onClick={goNextLevel} style={{ width: '100%', padding: 16, background: '#ca8a04', color: 'white', border: 'none', borderRadius: 16, fontWeight: 800, cursor: 'pointer' }}>Level Berikutnya →</button>
                </div>
            </div>
        );
    }

    if (phase === "result") {
        const g = getGrade(total);
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#fefce8,#ecfccb)', padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>{g.emoji}</div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a2e05' }}>{g.title}</h1>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#15803d', margin: '20px 0' }}>{total * 10} XP</div>
                <button onClick={reset} style={{ padding: '16px 32px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 16, fontWeight: 800, cursor: 'pointer' }}>Main Lagi</button>
            </div>
        );
    }

    return null;
}
