"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// --- Assets ---
const BG_URL = "https://images.unsplash.com/photo-1552072092-7f9b854618e7?q=80&w=2600&auto=format&fit=crop"; // Empty Gym Room
const GLOVE_URL = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Oncoming%20Fist%20Medium-Light%20Skin%20Tone.png";
const ENEMY_URL = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Angry%20Face%20with%20Horns.png";

const AVATARS = [
    { id: "hero-rpl", name: "Inno-Bot", color: "#3b82f6", power: 85, icon: "🤖" },
    { id: "hero-tkj", name: "Net-Guard", color: "#10b981", power: 90, icon: "🛡️" },
    { id: "hero-dkv", name: "Art-Strike", color: "#e11d48", power: 80, icon: "🎨" },
];

const ANTI_HEROES = [
    { name: "Distraction Shadow", factor: "T - Turn Off Distractions", color: "#475569", icon: "📵" },
    { name: "Toxic Speaker", factor: "T - Talk Politely", color: "#334155", icon: "🙊" },
    { name: "Lone Blamer", factor: "E - Eager to Collaborate", color: "#1e293b", icon: "👤" },
];

const ATTITUDE_VALUES = [
    "Act Respectfully", "Talk Politely", "Turn Off Distractions",
    "Involve Actively", "Think Solutions", "Use Tech Wisely",
    "Dare to Ask", "Eager to Collaborate"
];

// --- 2D Sub-components ---

function Glove2D({ side, isPunching }: { side: "left" | "right", isPunching: boolean }) {
    return (
        <img
            src={GLOVE_URL}
            alt="Glove"
            style={{
                position: "absolute",
                bottom: "10%",
                [side]: "10%",
                width: "min(40vw, 220px)",
                transition: "transform 0.1s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
                transform: isPunching
                    ? `scale(${side === 'left' ? '-1.1, 1.1' : '1.1, 1.1'}) translateY(-150px) rotate(${side === 'left' ? '15deg' : '-15deg'})`
                    : `scale(${side === 'left' ? '-1, 1' : '1, 1'})`,
                zIndex: 20,
                pointerEvents: "none",
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))"
            }}
        />
    );
}

function Enemy2D({ isHit, name }: { isHit: boolean, name: string }) {
    return (
        <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${isHit ? 1.15 : 1})`,
            transition: "transform 0.05s",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            justifyContent: "center"
        }}>
            <img
                src={ENEMY_URL}
                alt="Enemy"
                style={{
                    width: "min(60vw, 350px)",
                    filter: isHit ? "brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5) drop-shadow(0 0 30px red)" : "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
                    animation: isHit ? "shake 0.2s" : "float 3s infinite ease-in-out",
                    transition: "filter 0.1s"
                }}
            />
            <div style={{
                marginTop: 20,
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "8px 16px",
                borderRadius: 99,
                fontWeight: 800,
                fontSize: "clamp(12px, 4vw, 16px)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(4px)"
            }}>
                {name}
            </div>
        </div>
    );
}

// --- Main Component ---

export default function FighterPage() {
    // Game State
    const [gameState, setGameState] = useState<"AVATAR" | "PLAYING" | "RESULT">("AVATAR");
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [enemyData, setEnemyData] = useState(ANTI_HEROES[0]);

    // Combat State
    const [playerHp, setPlayerHp] = useState(100);
    const [enemyHp, setEnemyHp] = useState(100);
    const [playerScore, setPlayerScore] = useState(0);
    const [winner, setWinner] = useState<"PLAYER" | "ENEMY" | null>(null);

    // Visual State
    const [lastPunchTime, setLastPunchTime] = useState(0);
    const [enemyHitTime, setEnemyHitTime] = useState(0);
    const [punchSide, setPunchSide] = useState<"left" | "right">("right");
    const [hitPopups, setHitPopups] = useState<{ id: number, text: string, x: number, y: number }[]>([]);
    const popupIdCounter = useRef(0);

    // Helpers
    const isLeftPunching = (Date.now() - lastPunchTime < 150) && punchSide === "left";
    const isRightPunching = (Date.now() - lastPunchTime < 150) && punchSide === "right";
    const isEnemyHit = (Date.now() - enemyHitTime < 200);

    // Logic
    const spawnHitPopup = () => {
        const text = ATTITUDE_VALUES[Math.floor(Math.random() * ATTITUDE_VALUES.length)];
        const id = popupIdCounter.current++;
        const x = 50 + (Math.random() * 40 - 20); // Center-ish
        const y = 40 + (Math.random() * 20 - 10);
        setHitPopups(prev => [...prev, { id, text, x, y }]);
        setTimeout(() => setHitPopups(prev => prev.filter(p => p.id !== id)), 800);
    };

    const handlePunch = () => {
        if (gameState !== "PLAYING") return;

        // Cooldown check (visual)
        if (Date.now() - lastPunchTime < 200) return;

        // Visuals
        setLastPunchTime(Date.now());
        setPunchSide(prev => prev === "left" ? "right" : "left");
        setEnemyHitTime(Date.now()); // Flash enemy immediately
        spawnHitPopup();

        // Logic
        setEnemyHp(hp => {
            // Damage calculation based on avatar power
            const dmg = selectedAvatar.power / 8;
            const newHp = Math.max(0, hp - dmg);
            if (newHp <= 0) {
                setWinner("PLAYER");
                setGameState("RESULT");
                setPlayerScore(s => s + 500); // Bonus
            }
            return newHp;
        });
        setPlayerScore(s => s + 50);
    };

    // Enemy AI Loop using setInterval (Pure React)
    useEffect(() => {
        if (gameState !== "PLAYING") return;

        const interval = setInterval(() => {
            setPlayerHp(hp => {
                const newHp = Math.max(0, hp - 5);
                if (newHp <= 0) {
                    setWinner("ENEMY");
                    setGameState("RESULT");
                }
                return newHp;
            });
            // Visual feedback for player getting hit could go here (e.g. screen shake)
        }, 1500);

        return () => clearInterval(interval);
    }, [gameState]);

    // Reset Enemy on Start
    useEffect(() => {
        if (gameState === "PLAYING") {
            setEnemyData(ANTI_HEROES[Math.floor(Math.random() * ANTI_HEROES.length)]);
            setPlayerHp(100);
            setEnemyHp(100);
            setPlayerScore(0);
            setHitPopups([]);
        }
    }, [gameState]);

    // Cleanup popups
    useEffect(() => {
        if (gameState !== "PLAYING") setHitPopups([]);
    }, [gameState]);

    return (
        <div style={{ position: "relative", width: "100svw", height: "100svh", overflow: "hidden", background: "#0a0a0f", fontFamily: "Inter, sans-serif" }}>

            {/* --- UI Overlays --- */}

            {gameState === "AVATAR" && (
                <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(10,10,15,0.95)", padding: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>Combat Training</div>
                    <h2 style={{ fontSize: "clamp(24px, 8vw, 48px)", fontWeight: 900, color: "white", marginBottom: 8, textAlign: "center" }}>ATTITUDE FIGHTER</h2>
                    <p style={{ color: "#94a3b8", marginBottom: 32, textAlign: "center", maxWidth: 400, fontSize: 13 }}>Kalahkan manifestasi buruk secara REAL di atas ring!</p>

                    <div className="avatar-grid">
                        {AVATARS.map(avatar => (
                            <div
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`avatar-card ${selectedAvatar.id === avatar.id ? 'active' : ''}`}
                            >
                                <div style={{ fontSize: "clamp(40px, 10vw, 72px)", marginBottom: 12 }}>{avatar.icon}</div>
                                <div style={{ fontSize: 18, fontWeight: 900, color: selectedAvatar.id === avatar.id ? "#0a0a10" : "white" }}>{avatar.name}</div>
                                <div style={{ fontSize: 11, color: selectedAvatar.id === avatar.id ? "#64748b" : "#94a3b8", marginTop: 4 }}>Power: {avatar.power}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setGameState("PLAYING")}
                        style={{ background: "#e11d48", color: "white", border: "none", padding: "18px 56px", borderRadius: 24, fontSize: 18, fontWeight: 900, cursor: "pointer", boxShadow: "0 12px 32px rgba(225,29,72,0.4)", marginTop: 40 }}
                    >
                        MULAI BERTARUNG 🥊
                    </button>

                    <Link href="/" style={{ marginTop: 24, color: "#94a3b8", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>← BERANDA</Link>
                </div>
            )}

            {gameState === "PLAYING" && (
                <>
                    {/* Top HUD */}
                    <div className="hud-container top">
                        <div className="hp-block player">
                            <div className="hp-info">
                                <span className="entity-name">{selectedAvatar.name}</span>
                                <span className="hp-value">{Math.ceil(playerHp)}</span>
                            </div>
                            <div className="hp-bar-bg">
                                <div style={{ width: `${playerHp}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #10b981)" }} />
                            </div>
                        </div>

                        <div className="score-block">
                            <div className="score-label">SCORE</div>
                            <div className="score-value">{playerScore}</div>
                        </div>

                        <div className="hp-block enemy">
                            <div className="hp-info">
                                <span className="hp-value">{Math.ceil(enemyHp)}</span>
                                <span className="entity-name">{enemyData.name}</span>
                            </div>
                            <div className="hp-bar-bg rtl">
                                <div style={{ width: `${enemyHp}%`, height: "100%", background: "linear-gradient(90deg, #e11d48, #9f1239)" }} />
                            </div>
                        </div>
                    </div>

                    {/* Hit Popups are HTML overlay */}
                    {hitPopups.map(popup => (
                        <div key={popup.id} className="hit-popup" style={{ left: `${popup.x}%`, top: `${popup.y}%` }}>
                            +ATTITUDE<br />
                            <span style={{ fontSize: "0.6em", color: "white" }}>{popup.text}</span>
                        </div>
                    ))}

                    <div className="combat-instruction">
                        <div className="instruction-badge">
                            Tap Screen to Punch! 🥊
                        </div>
                    </div>
                </>
            )}

            {gameState === "RESULT" && (
                <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.95)", color: "white", padding: 24 }}>
                    <div style={{ fontSize: "clamp(64px, 20vw, 120px)", marginBottom: 16, animation: "bounce 2s infinite" }}>{winner === "PLAYER" ? "🥇" : "🚫"}</div>
                    <h2 style={{ fontSize: "clamp(24px, 8vw, 56px)", fontWeight: 900, marginBottom: 8, textAlign: "center" }}>{winner === "PLAYER" ? "MISI SELESAI!" : "COBA LAGI!"}</h2>
                    <p style={{ color: "#94a3b8", marginBottom: 32, maxWidth: 540, textAlign: "center", fontSize: "clamp(13px, 4vw, 18px)", lineHeight: 1.6 }}>
                        {winner === "PLAYER"
                            ? `Luar biasa! Kamu telah melumpuhkan Anti-hero dengan nilai ATTITUDE!`
                            : `Jangan biarkan pengaruh negatif menang. Fokuskan nilai karaktermu!`}
                    </p>

                    <div className="result-card">
                        <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", opacity: 0.6, marginBottom: 8 }}>Combat XP Gained</div>
                        <div style={{ fontSize: "clamp(48px, 12vw, 72px)", fontWeight: 900, color: winner === "PLAYER" ? "#10b981" : "#e11d48" }}>{playerScore} XP</div>
                    </div>

                    <div className="result-buttons">
                        <button
                            onClick={() => { setGameState("AVATAR"); }}
                            className="btn-replay"
                        >
                            MAIN LAGI
                        </button>
                        <Link href="/" className="btn-home">
                            BERANDA
                        </Link>
                    </div>
                </div>
            )}

            {/* --- 2D Arena --- */}
            <div
                onClick={handlePunch}
                className="arena-2d"
                style={{
                    width: "100%", height: "100%",
                    position: "relative",
                    backgroundImage: `url(${BG_URL})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    cursor: "crosshair",
                    overflow: "hidden"
                }}
            >
                {/* Overlay Darkness */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />

                {gameState === "PLAYING" && (
                    <>
                        <Enemy2D isHit={isEnemyHit} name={enemyData.name} />
                        <Glove2D side="left" isPunching={isLeftPunching} />
                        <Glove2D side="right" isPunching={isRightPunching} />
                    </>
                )}
            </div>

            {/* --- Styles --- */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) scale(1.05); }
                    50% { transform: translateY(-15px) scale(1); }
                }
                @keyframes shake {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    25% { transform: translate(-55%, -50%) rotate(-5deg); }
                    75% { transform: translate(-45%, -50%) rotate(5deg); }
                    100% { transform: translate(-50%, -50%) rotate(0deg); }
                }

                .avatar-grid {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    justify-content: center;
                    width: 100%;
                    max-width: 800px;
                }
                .avatar-card {
                    background: rgba(255,255,255,0.05);
                    padding: 24px;
                    border-radius: 24px;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: center;
                    width: 160px;
                    flex: 1 1 160px;
                }
                .avatar-card.active {
                    background: white;
                    border-color: white;
                    box-shadow: 0 10px 20px rgba(255,255,255,0.1);
                }
                .hud-container {
                    position: absolute;
                    width: 100%;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 10;
                    pointer-events: none;
                }
                .hp-block {
                    flex: 1;
                    max-width: 200px;
                    background: rgba(0,0,0,0.5);
                    padding: 8px;
                    border-radius: 8px;
                }
                .score-block {
                    text-align: center;
                    margin: 0 10px;
                }
                .hp-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                    font-size: 11px;
                    font-weight: 900;
                    color: white;
                }
                .hp-bar-bg {
                    height: 10px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 5px;
                    overflow: hidden;
                }
                .hp-bar-bg.rtl { direction: rtl; }
                .score-label { color: #94a3b8; font-size: 9px; font-weight: 800; }
                .score-value { color: white; font-size: 24px; font-weight: 900; }
                .hit-popup {
                    position: absolute;
                    color: #facc15;
                    font-weight: 900;
                    font-size: clamp(16px, 5vw, 24px);
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    pointer-events: none;
                    animation: popupFade 0.8s forwards;
                    z-index: 50;
                    text-align: center;
                    transform: translate(-50%, -50%);
                }
                .combat-instruction {
                    position: absolute;
                    bottom: 32px;
                    width: 100%;
                    text-align: center;
                    pointer-events: none;
                    z-index: 10;
                }
                .instruction-badge {
                    background: rgba(10,10,15,0.8);
                    display: inline-block;
                    padding: 10px 24px;
                    border-radius: 99px;
                    font-size: 12px;
                    font-weight: 700;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .result-card {
                    background: rgba(255,255,255,0.05);
                    padding: 24px 40px;
                    border-radius: 24px;
                    margin-bottom: 32px;
                    text-align: center;
                }
                .result-buttons {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                    max-width: 400px;
                }
                .result-buttons > * {
                    flex: 1;
                    padding: 16px;
                    border-radius: 16px;
                    font-weight: 900;
                    text-align: center;
                    font-size: 14px;
                }
                .btn-replay { background: white; color: #0a0a0f; border: none; cursor: pointer; }
                .btn-home { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); text-decoration: none; }

                @media (max-width: 600px) {
                    .avatar-grid { gap: 10px; }
                    .avatar-card { padding: 16px; width: 140px; flex: 1 1 140px; }
                    .hud-container { padding: 10px; }
                    .hp-block { max-width: 120px; }
                    .score-value { font-size: 18px; }
                    .entity-name { display: none; }
                }

                @keyframes popupFade {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    20% { transform: translate(-50%, -100%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -200%) scale(1); opacity: 0; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
