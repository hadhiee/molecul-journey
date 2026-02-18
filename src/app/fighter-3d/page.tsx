"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image, Text, Sparkles } from "@react-three/drei";
import Link from "next/link";
import * as THREE from "three";

// --- Assets ---
const BG_URL = "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff";
const GLOVE_URL = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Oncoming%20Fist%20Medium-Light%20Skin%20Tone.png";
const ENEMY_URL = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Angry%20Face%20with%20Horns.png";

const AVATARS = [
    { id: "hero-rpl", name: "Inno-Bot", color: 0x3b82f6, power: 85, icon: "🤖" },
    { id: "hero-tkj", name: "Net-Guard", color: 0x10b981, power: 90, icon: "🛡️" },
    { id: "hero-dkv", name: "Art-Strike", color: 0xe11d48, power: 80, icon: "🎨" },
];

const ANTI_HEROES = [
    { name: "Distraction Shadow", factor: "T - Turn Off Distractions", color: 0x475569, icon: "📵" },
    { name: "Toxic Speaker", factor: "T - Talk Politely", color: 0x334155, icon: "🙊" },
    { name: "Lone Blamer", factor: "E - Eager to Collaborate", color: 0x1e293b, icon: "👤" },
];

const ATTITUDE_VALUES = [
    "Act Respectfully", "Talk Politely", "Turn Off Distractions",
    "Involve Actively", "Think Solutions", "Use Tech Wisely",
    "Dare to Ask", "Eager to Collaborate"
];

// --- Sub-components ---

function Glove({ position, isPunching, side }: { position: [number, number, number], isPunching: boolean, side: "left" | "right" }) {
    const ref = useRef<THREE.Group>(null!);

    useFrame((state, delta) => {
        if (!ref.current) return;
        const targetZ = isPunching ? -1 : 2; // Forward / Back
        // Faster punch, slower return
        const speed = isPunching ? 20 : 5;
        ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, delta * speed);

        // Slight bobbing
        ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    });

    return (
        <group ref={ref} position={[position[0], position[1], 2]}>
            <Image
                url={GLOVE_URL}
                transparent
                scale={[1.5, 1.5]}
                scale-x={side === "left" ? -1.5 : 1.5} // Flip left glove
                toneMapped={false}
            />
        </group>
    );
}

// --- 3D Environment ---

function BoxingRing() {
    return (
        <group position={[0, -2.5, -2]}>
            {/* Floor Canvas */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
            {/* Ring Platform */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[12, 12]} />
                <meshStandardMaterial color="#475569" roughness={0.5} />
            </mesh>
            {/* Inner Ring (Blue Canvas) */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>

            {/* Posts */}
            <mesh position={[-5, 2, -5]} castShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial color="#ef4444" /></mesh>
            <mesh position={[5, 2, -5]} castShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial color="#3b82f6" /></mesh>
            <mesh position={[-5, 2, 5]} castShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial color="#3b82f6" /></mesh>
            <mesh position={[5, 2, 5]} castShadow><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial color="#ef4444" /></mesh>

            {/* Ropes */}
            {[1.2, 2.4, 3.6].map((y, i) => (
                <group key={i} position={[0, y - 1, 0]}>
                    {/* Horizontal Ropes */}
                    <mesh position={[0, 0, -5]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 10]} /><meshStandardMaterial color="white" /></mesh>
                    <mesh position={[0, 0, 5]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 10]} /><meshStandardMaterial color="white" /></mesh>
                    <mesh position={[-5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.04, 0.04, 10]} /><meshStandardMaterial color="white" /></mesh>
                    <mesh position={[5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.04, 0.04, 10]} /><meshStandardMaterial color="white" /></mesh>
                </group>
            ))}
        </group>
    );
}

function Enemy({ isHit, color }: { isHit: boolean, color: number }) {
    const ref = useRef<THREE.Group>(null!);

    useFrame((state) => {
        if (!ref.current) return;
        // Idle Animation
        ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;

        // Hit Shake
        if (isHit) {
            ref.current.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.1;
            ref.current.scale.setScalar(1.1); // Bulge on hit
        } else {
            ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, 0, 0.1);
            ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
    });

    return (
        <group ref={ref} position={[0, 0, -3]}>
            <Image
                url={ENEMY_URL}
                transparent
                scale={[3.5, 3.5]}
                toneMapped={false}
                color={isHit ? "#ff0000" : "white"} // Flash red
            />
        </group>
    );
}

function ArenaScene({
    gameState,
    lastPunchTime,
    punchSide,
    enemyHitTime,
    onEnemyTurn
}: any) {
    const isLeftPunching = (Date.now() - lastPunchTime < 150) && punchSide === "left";
    const isRightPunching = (Date.now() - lastPunchTime < 150) && punchSide === "right";
    const isEnemyHit = (Date.now() - enemyHitTime < 200);

    // Enemy AI Loop
    const cooldownRef = useRef(0);
    useFrame(() => {
        if (gameState === "PLAYING") {
            cooldownRef.current++;
            if (cooldownRef.current > 60) { // Approx 1 sec
                onEnemyTurn();
                cooldownRef.current = 0;
            }
        }
    });

    return (
        <>
            <ambientLight intensity={0.4} />
            <spotLight position={[0, 10, 5]} angle={0.5} penumbra={1} intensity={2} castShadow />
            <pointLight position={[0, 5, 0]} intensity={1.5} color="#e2e8f0" />

            {/* Distant Stadium Background */}
            <Image
                url={BG_URL}
                scale={[40, 20]}
                position={[0, 5, -15]}
                transparent
                opacity={0.5}
                color="#222"
                toneMapped={false}
            />

            <BoxingRing />

            <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color="#fff" />

            {/* Enemy */}
            <Enemy isHit={isEnemyHit} color={0xffffff} />

            {/* Player Gloves (FPP) */}
            <Glove position={[-1.2, -1.5, 0]} isPunching={isLeftPunching} side="left" />
            <Glove position={[1.2, -1.5, 0]} isPunching={isRightPunching} side="right" />

            <fog attach="fog" args={['#0a0a0f', 2, 18]} />
        </>
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

    const handleEnemyAttack = () => {
        if (gameState !== "PLAYING") return;

        // Enemy punches back
        setPlayerHp(hp => {
            const newHp = Math.max(0, hp - 5); // Constant damage
            if (newHp <= 0) {
                setWinner("ENEMY");
                setGameState("RESULT");
            }
            return newHp;
        });
    };

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
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Graphics by Fluent Emoji & Unsplash</div>
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

            {/* --- 3D Scene --- */}
            <div style={{ width: "100%", height: "100%", cursor: "crosshair" }}>
                <Canvas
                    shadows
                    camera={{ position: [0, 0, 5], fov: 60 }}
                    onClick={handlePunch} // Handle clicks on canvas
                >
                    <React.Suspense fallback={null}>
                        <ArenaScene
                            gameState={gameState}
                            lastPunchTime={lastPunchTime}
                            punchSide={punchSide}
                            enemyHitTime={enemyHitTime}
                            onEnemyTurn={handleEnemyAttack}
                        />
                    </React.Suspense>
                </Canvas>
            </div>

            {/* --- Styles --- */}
            <style>{`
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
                    pointer-events: none; /* Let clicks pass through to Canvas */
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
