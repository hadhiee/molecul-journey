"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// === TYPES ===
interface Impact { attitude?: Record<string, number>; akhlak?: Record<string, number>; bisa?: Record<string, number>; codes?: Record<string, number>; }
interface Choice { id: string; label: string; impact: Impact; feedback: string; }
interface Scenario { id: number; chapter: number; title: string; context: string; choices: Choice[]; tags: any; }

const CHAPTER_TITLES = [
    "Early Days: Masa Adaptasi", "Team Dynamics: Konflik & Solusi", "Academic Integrity: Ujian Mental", "Communication Skills: Berbicara Efektif",
    "Leadership Beginnings: Memimpin Diri", "Tech Ethics: Bijak Digital", "Problem Solving: Kreatif & Kritis", "Emotional Intelligence: Empati",
    "Professionalism: Sikap Kerja", "The Moklet Way: Budaya Paripurna"
];

// === VISUAL COMPONENT ===
const ScenarioVisuals = ({ scenario, emotion }: { scenario: Scenario; emotion: "neutral" | "happy" | "tense" | "thinking" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef(0);

    const drawScene = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
        // Clear
        ctx.clearRect(0, 0, width, height);

        // Context analysis
        const text = (scenario.context + scenario.title).toLowerCase();
        let bgType = "classroom";
        if (text.includes("lab") || text.includes("koding") || text.includes("error") || text.includes("bug")) bgType = "lab";
        else if (text.includes("kantin") || text.includes("makan") || text.includes("ngobrol")) bgType = "canteen";
        else if (text.includes("lapangan") || text.includes("olahraga") || text.includes("bola")) bgType = "field";
        else if (text.includes("chat") || text.includes("grup") || text.includes("online") || text.includes("hp")) bgType = "cyber";

        // --- BACKGROUND ---
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        if (bgType === "lab") { grad.addColorStop(0, "#0f172a"); grad.addColorStop(1, "#1e293b"); }
        else if (bgType === "canteen") { grad.addColorStop(0, "#fff7ed"); grad.addColorStop(1, "#ffedd5"); }
        else if (bgType === "field") { grad.addColorStop(0, "#bae6fd"); grad.addColorStop(1, "#f0fdf4"); } // Sky blue to grass green
        else if (bgType === "cyber") { grad.addColorStop(0, "#2e1065"); grad.addColorStop(1, "#4c1d95"); }
        else { grad.addColorStop(0, "#f8fafc"); grad.addColorStop(1, "#cbd5e1"); }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // --- ANIMATED PROPS ---
        ctx.save();
        if (bgType === "classroom") {
            // Blackboard
            ctx.fillStyle = "#334155";
            ctx.fillRect(40, 40, width - 80, 100);
            ctx.strokeStyle = "#475569"; ctx.lineWidth = 6;
            ctx.strokeRect(40, 40, width - 80, 100);
            // Chalk text (static)
            ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(60, 70); ctx.lineTo(160, 70); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(60, 90); ctx.lineTo(220, 90); ctx.stroke();
            // Clock
            ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(width - 60, 30, 16, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#333"; ctx.lineWidth = 2; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(width - 60, 30);
            const secAngle = (frame * 0.05) % (Math.PI * 2);
            ctx.lineTo(width - 60 + Math.sin(secAngle) * 10, 30 - Math.cos(secAngle) * 10);
            ctx.stroke();
        }
        else if (bgType === "lab") {
            // Screens
            for (let i = 0; i < 3; i++) {
                const x = 50 + i * 110;
                const scroll = (frame * 2 + i * 30) % 60;
                ctx.fillStyle = "#0ea5e9";
                ctx.fillRect(x, 100, 90, 60); // Bezel
                ctx.fillStyle = "#0c4a6e";
                ctx.fillRect(x + 4, 104, 82, 52); // Screen
                // Code lines
                ctx.fillStyle = "#4ade80";
                for (let j = 0; j < 4; j++) {
                    const yLine = 104 + ((j * 12 + scroll) % 52);
                    if (yLine < 152) ctx.fillRect(x + 8, yLine, 40 + Math.random() * 20, 4);
                }
            }
        }
        else if (bgType === "field") {
            // Clouds
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            const cloudX = (frame * 0.5) % (width + 100) - 50;
            ctx.beginPath(); ctx.arc(cloudX, 50, 20, 0, Math.PI * 2);
            ctx.arc(cloudX + 25, 45, 25, 0, Math.PI * 2);
            ctx.arc(cloudX + 50, 50, 18, 0, Math.PI * 2);
            ctx.fill();
            // Grass
            ctx.fillStyle = "#22c55e";
            ctx.fillRect(0, height - 40, width, 40);
            for (let i = 0; i < width; i += 10) {
                ctx.beginPath(); ctx.moveTo(i, height - 40); ctx.lineTo(i + 5 + Math.sin(frame * 0.1 + i) * 2, height - 50); ctx.lineTo(i + 10, height - 40); ctx.fill();
            }
        }
        else if (bgType === "cyber") {
            // Connection lines
            ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const x = (frame * 2 + i * 80) % width;
                ctx.moveTo(x, 0); ctx.lineTo(x - 50, height);
            }
            ctx.stroke();
            // Chat bubbles
            const float = Math.sin(frame * 0.05) * 5;
            ctx.fillStyle = "white";
            ctx.beginPath(); ctx.roundRect(40, 50 + float, 140, 40, 10); ctx.fill();
            ctx.fillStyle = "#3b82f6";
            ctx.beginPath(); ctx.roundRect(width - 160, 110 - float, 140, 40, 10); ctx.fill();
        }
        else if (bgType === "canteen") {
            // Steam
            ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 3;
            const steamX = 80; const steamY = 160;
            ctx.beginPath();
            const offset = (frame * 0.1) % Math.PI * 2;
            ctx.moveTo(steamX, steamY);
            ctx.bezierCurveTo(steamX + 5, steamY - 20, steamX - 5, steamY - 40, steamX + Math.sin(offset) * 5, steamY - 60);
            ctx.stroke();
        }
        ctx.restore();

        // --- CHARACTER AVATAR (Animated with Physics) ---
        const cx = width / 2;
        // Base vertical position
        let cy = height;

        // Animation States Logic
        const enterProgress = Math.min(1, frame * 0.05); // Slide up effect over 20 frames
        const slideUp = (1 - Math.pow(enterProgress, 2)) * 100; // Quadratic ease-out

        // Idle Sway (Thinking/Neutral)
        const sway = Math.sin(frame * 0.03) * 5;

        // Happy Bounce
        const bounce = emotion === "happy" ? Math.abs(Math.sin(frame * 0.2)) * 20 : 0;

        // Tense Shake
        const shake = emotion === "tense" ? (Math.random() - 0.5) * 6 : 0;

        // Apply animations to position
        cy = cy + slideUp - bounce;
        const currentCx = cx + sway + shake;

        // Breathing (Chest expansion)
        const breath = Math.sin(frame * 0.05) * 2;
        const blinking = Math.sin(frame * 0.1) > 0.98;

        let skinColor = "#fca5a5";
        let shirtColor = "#3b82f6";

        if (emotion === "tense") { skinColor = "#fecaca"; shirtColor = "#1e293b"; }
        if (emotion === "happy") { skinColor = "#fcd34d"; shirtColor = "#22c55e"; }
        if (emotion === "thinking") { skinColor = "#c084fc"; shirtColor = "#6366f1"; }

        // Body
        ctx.fillStyle = shirtColor;
        ctx.beginPath();
        ctx.moveTo(currentCx - 60, cy);
        ctx.quadraticCurveTo(currentCx - 50, cy - 100 + breath, currentCx, cy - 110 + breath);
        ctx.quadraticCurveTo(currentCx + 50, cy - 100 + breath, currentCx + 60, cy);
        ctx.fill();

        // Head
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(currentCx, cy - 160 + breath, 50, 0, Math.PI * 2);
        ctx.fill();

        // Hair (Basic)
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(currentCx, cy - 165 + breath, 52, Math.PI, 0); // Top hair
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#1e293b";
        if (emotion === "happy") {
            ctx.beginPath(); ctx.arc(currentCx - 18, cy - 165 + breath, 5, Math.PI, 0); ctx.stroke(); // ^ ^
            ctx.beginPath(); ctx.arc(currentCx + 18, cy - 165 + breath, 5, Math.PI, 0); ctx.stroke();
        } else if (emotion === "tense") {
            ctx.beginPath(); ctx.moveTo(currentCx - 25, cy - 175 + breath); ctx.lineTo(currentCx - 10, cy - 165 + breath); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(currentCx + 25, cy - 175 + breath); ctx.lineTo(currentCx + 10, cy - 165 + breath); ctx.stroke();
            if (!blinking) {
                ctx.beginPath(); ctx.arc(currentCx - 18, cy - 160 + breath, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(currentCx + 18, cy - 160 + breath, 3, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.beginPath(); ctx.moveTo(currentCx - 22, cy - 160 + breath); ctx.lineTo(currentCx - 14, cy - 160 + breath); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(currentCx + 14, cy - 160 + breath); ctx.lineTo(currentCx + 22, cy - 160 + breath); ctx.stroke();
            }
        } else {
            // Neutral / Thinking
            if (!blinking) {
                ctx.beginPath(); ctx.arc(currentCx - 18, cy - 165 + breath, 5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(currentCx + 18, cy - 165 + breath, 5, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.beginPath(); ctx.moveTo(currentCx - 23, cy - 165 + breath); ctx.lineTo(currentCx - 13, cy - 165 + breath); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(currentCx + 13, cy - 165 + breath); ctx.lineTo(currentCx + 23, cy - 165 + breath); ctx.stroke();
            }
        }

        // Mouth
        ctx.beginPath();
        if (emotion === "happy") ctx.arc(currentCx, cy - 145 + breath, 12, 0, Math.PI);
        else if (emotion === "tense") {
            const mouthShake = Math.sin(frame * 0.8) * 2;
            ctx.moveTo(currentCx - 10 + mouthShake, cy - 140 + breath); ctx.lineTo(currentCx + 10 + mouthShake, cy - 140 + breath);
        }
        else ctx.arc(currentCx, cy - 140 + breath, 6, 0, Math.PI); // Small mouth
        ctx.stroke();

    }, [scenario, emotion]);

    useEffect(() => {
        let animationId: number;
        const animate = () => {
            frameRef.current++;
            const canvas = canvasRef.current;
            if (canvas) {
                drawScene(canvas.getContext("2d")!, canvas.width, canvas.height, frameRef.current);
            }
            animationId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationId);
    }, [drawScene]);

    return <canvas ref={canvasRef} width={400} height={260} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

// === MAIN PAGE ===
export default function SimulationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentChapter, setCurrentChapter] = useState(1);
    const [chapterScenarios, setChapterScenarios] = useState<Scenario[]>([]);
    const [qIndex, setQIndex] = useState(0); // Index within chapter (0-3)
    const [gameState, setGameState] = useState<"chapterSelect" | "intro" | "playing" | "feedback" | "chapterSummary" | "end">("chapterSelect");
    const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);

    // Stats
    const [score, setScore] = useState(0);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => { if (status === "unauthenticated") router.push("/auth/signin"); }, [status, router]);

    useEffect(() => {
        async function init() {
            const { data } = await supabase.from("scenarios").select("*").order('id', { ascending: true });
            if (data) setScenarios(data);
            setLoading(false);
        }
        init();
    }, []);

    const startChapter = (chapterNum: number) => {
        const relevant = scenarios.filter(s => s.chapter === chapterNum).slice(0, 4); // Take max 4 per chapter
        // If not categorized by chapter in standard way, simulate slice
        // Fallback: If chapter data is messy, just slice by index
        const fallbackSlice = scenarios.slice((chapterNum - 1) * 4, chapterNum * 4);

        setChapterScenarios(relevant.length >= 3 ? relevant : fallbackSlice);
        setCurrentChapter(chapterNum);
        setQIndex(0);
        setGameState("intro");
    };

    const currentScenario = chapterScenarios[qIndex];

    const handleChoice = (c: Choice) => {
        setSelectedChoice(c);
        setGameState("feedback");

        // Calc stats
        let pts = 0;
        const ns = { ...stats };
        if (c.impact) {
            Object.values(c.impact).forEach(cat => {
                if (typeof cat === 'object') Object.entries(cat).forEach(([k, v]) => { pts += v as number; ns[k] = (ns[k] || 0) + (v as number) });
            });
        }
        setScore(s => s + pts);
        setStats(ns);
        setHistory(h => [...h, { s: currentScenario.title, c: c.label, f: c.feedback, ch: currentChapter }]);

        if (session?.user?.email) {
            supabase.from("user_progress").insert({ user_email: session.user.email, mission_id: currentScenario.id, score: pts * 10, choice_label: c.id }).then(() => { });
        }
    };

    const nextQ = () => {
        setSelectedChoice(null);
        if (qIndex < chapterScenarios.length - 1) {
            setQIndex(q => q + 1);
            setGameState("playing");
        } else {
            setGameState("chapterSummary");
        }
    };

    // === RENDERING ===
    if (loading) return <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', paddingBottom: 40 }}>
            {/* Background */}
            <div style={{ position: 'fixed', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #000 100%)', zIndex: 0 }} />

            {/* Top Bar with Back Button Logic */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {gameState === "chapterSelect" ? (
                        <Link href="/" style={{ textDecoration: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>
                            ←
                        </Link>
                    ) : (
                        <button
                            onClick={() => setGameState("chapterSelect")}
                            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                        >
                            ←
                        </button>
                    )}
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#60a5fa' }}>Moklet Simulation</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>⭐ {score} XP</div>
            </div>

            <div style={{ position: 'relative', zIndex: 10, maxWidth: 640, margin: '0 auto', padding: 20 }}>

                {/* CHAPTER SELECT */}
                {gameState === "chapterSelect" && (
                    <div>
                        <div style={{ textAlign: 'center', margin: '40px 0' }}>
                            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Pilih Chapter</h1>
                            <p style={{ color: '#94a3b8' }}>10 Bab Pembentukan Karakter</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => startChapter(i + 1)}
                                    style={{
                                        padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'linear-gradient(135deg, rgba(30,41,59,0.6), rgba(15,23,42,0.8))',
                                        color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{i + 1}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{CHAPTER_TITLES[i] || `Chapter ${i + 1}`}</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>4 Skenario</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* INTRO TO CHAPTER */}
                {gameState === "intro" && (
                    <div style={{ textAlign: 'center', paddingTop: 60, animation: 'fadeIn 0.5s' }}>
                        <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#60a5fa' }}>Chapter {currentChapter}</h2>
                        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '16px 0 32px' }}>{CHAPTER_TITLES[currentChapter - 1]}</h1>
                        <div style={{ width: 80, height: 4, background: '#3b82f6', margin: '0 auto 40px' }} />
                        <button onClick={() => setGameState("playing")} style={{ padding: '16px 40px', borderRadius: 99, background: 'white', color: '#0f172a', fontWeight: 800, border: 'none', cursor: 'pointer' }}>MULAI</button>
                    </div>
                )}

                {/* PLAYING / FEEDBACK */}
                {(gameState === "playing" || gameState === "feedback") && currentScenario && (
                    <div>
                        {/* Visual Scene */}
                        <div style={{ height: 240, borderRadius: 24, overflow: 'hidden', marginBottom: 20, border: '1px solid rgba(255,255,255,0.1)', position: 'relative', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}>
                            <ScenarioVisuals
                                scenario={currentScenario}
                                emotion={gameState === "feedback" ? (Object.values(selectedChoice?.impact.attitude || {}).some(v => v > 0) ? "happy" : "tense") : "neutral"}
                            />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(to top, rgba(15,23,42,0.9), transparent)' }}>
                                <div style={{ display: 'inline-block', padding: '4px 10px', background: '#3b82f6', borderRadius: 4, fontSize: 10, fontWeight: 800, marginBottom: 4 }}>Soal {qIndex + 1}/4</div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{currentScenario.title}</h3>
                            </div>
                        </div>

                        {/* Context */}
                        <div style={{ background: 'rgba(30,41,59,0.5)', padding: 20, borderRadius: 16, marginBottom: 24, borderLeft: '4px solid #60a5fa' }}>
                            <p style={{ lineHeight: 1.6, fontSize: 15, color: '#e2e8f0' }}>{currentScenario.context}</p>
                        </div>

                        {/* Choices */}
                        <div style={{ display: 'grid', gap: 12 }}>
                            {currentScenario.choices.map((c, i) => (
                                <button
                                    key={i}
                                    disabled={gameState === "feedback"}
                                    onClick={() => handleChoice(c)}
                                    style={{
                                        textAlign: 'left', padding: 18, borderRadius: 14,
                                        background: selectedChoice?.id === c.id ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                                        border: selectedChoice?.id === c.id ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                                        color: selectedChoice?.id === c.id ? 'white' : '#cbd5e1',
                                        cursor: gameState === "playing" ? 'pointer' : 'default',
                                        opacity: (gameState === "feedback" && selectedChoice?.id !== c.id) ? 0.4 : 1
                                    }}
                                >
                                    <strong style={{ opacity: 0.6 }}>{String.fromCharCode(65 + i)}. </strong> {c.label}
                                </button>
                            ))}
                        </div>

                        {/* Feedback Overlay */}
                        {gameState === "feedback" && selectedChoice && (
                            <div style={{ marginTop: 24, padding: 20, background: '#1e293b', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', animation: 'slideUp 0.3s' }}>
                                <div style={{ fontWeight: 800, color: '#fbbf24', marginBottom: 8, fontSize: 12, textTransform: 'uppercase' }}>Feedback</div>
                                <p style={{ marginBottom: 16 }}>{selectedChoice.feedback}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                    {Object.entries(selectedChoice.impact.attitude || {}).map(([k, v]) => (
                                        <span key={k} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 4, background: (v as number) > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: (v as number) > 0 ? '#4ade80' : '#f87171' }}>{k.replace('ATT_', '')} {(v as number) > 0 ? '+' : ''}{v as number}</span>
                                    ))}
                                </div>
                                <button onClick={nextQ} style={{ width: '100%', padding: 14, background: 'white', color: 'black', fontWeight: 800, border: 'none', borderRadius: 12, cursor: 'pointer' }}>LANJUT &rarr;</button>
                            </div>
                        )}

                        <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
                    </div>
                )}

                {/* CHAPTER SUMMARY */}
                {gameState === "chapterSummary" && (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 60 }}>🎉</div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Chapter {currentChapter} Selesai!</h2>
                        <div style={{ color: '#94a3b8', marginBottom: 32 }}>Sekarang kamu lebih paham tentang: <br /><strong style={{ color: 'white' }}>{CHAPTER_TITLES[currentChapter - 1]}</strong></div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button onClick={() => setGameState("chapterSelect")} style={{ padding: '14px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Pilih Chapter Lain</button>
                            {currentChapter < 10 && (
                                <button onClick={() => startChapter(currentChapter + 1)} style={{ padding: '14px 24px', borderRadius: 12, background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Chapter Selanjutnya &rarr;</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
