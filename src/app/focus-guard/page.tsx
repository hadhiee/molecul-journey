"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { stringToUUID } from "@/lib/ids";

type MoleType = "DISTRACTION" | "FOCUS";

interface ActiveMole {
    id: number;
    type: MoleType;
    emoji: string;
    expiresAt: number;
}

const DISTRACTION_EMOJIS = ["📱", "🎮", "🤬", "😴", "💬", "🤡"];
const FOCUS_EMOJIS = ["📖", "💻", "💡", "🛡️", "🎯", "🎓"];

const GAME_DURATION = 30; // seconds

export default function FocusGuardGame() {
    const { data: session } = useSession();

    const [gameState, setGameState] = useState<"START" | "PLAYING" | "RESULT">("START");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [moles, setMoles] = useState<(ActiveMole | null)[]>(Array(9).fill(null));
    const [strikes, setStrikes] = useState(0); // If you miss a distraction or hit a focus

    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const idCounter = useRef(0);

    const startGame = () => {
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setStrikes(0);
        setMoles(Array(9).fill(null));
        setGameState("PLAYING");
    };

    const endGame = useCallback(() => {
        setGameState("RESULT");
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);

        // Fireworks for good score
        if (score > 100) {
            triggerFireworks();
        }
    }, [score]);

    // Save Score Incrementally
    const savedScoreRef = useRef(0);
    useEffect(() => {
        if (gameState === "PLAYING") {
            const diff = score - savedScoreRef.current;
            if (diff > 0 && session?.user?.email) {
                supabase.from("user_progress").insert({
                    user_email: session.user.email,
                    mission_id: stringToUUID("FOCUS_GUARD"),
                    score: diff,
                    choice_label: "FOCUS_GAME"
                }).then(() => { });
                savedScoreRef.current = score;
            }
        } else if (gameState === "START") {
            savedScoreRef.current = 0;
        }
    }, [gameState, score, session]);

    // Timer Loop
    useEffect(() => {
        if (gameState === "PLAYING") {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState, endGame]);

    // Mole Spawning Loop
    useEffect(() => {
        if (gameState !== "PLAYING") return;

        gameLoopRef.current = setInterval(() => {
            setMoles(currentMoles => {
                const newMoles = [...currentMoles];

                // Clear expired moles
                const now = Date.now();
                for (let i = 0; i < 9; i++) {
                    if (newMoles[i] && now > newMoles[i]!.expiresAt) {
                        // Penalty if missed a distraction
                        if (newMoles[i]!.type === "DISTRACTION") {
                            setStrikes(s => s + 1);
                        }
                        newMoles[i] = null;
                    }
                }

                // Chance to spawn new mole
                if (Math.random() > 0.4) {
                    const emptyIndices = newMoles.map((m, i) => m === null ? i : -1).filter(i => i !== -1);
                    if (emptyIndices.length > 0) {
                        const randomHole = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

                        // 70% chance Distraction (to whack), 30% Focus (to avoid)
                        const isDistraction = Math.random() < 0.7;

                        const emojiList = isDistraction ? DISTRACTION_EMOJIS : FOCUS_EMOJIS;
                        const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];

                        newMoles[randomHole] = {
                            id: idCounter.current++,
                            type: isDistraction ? "DISTRACTION" : "FOCUS",
                            emoji,
                            expiresAt: Date.now() + 1200 + Math.random() * 800 // Stay visible for 1.2 to 2 seconds
                        };
                    }
                }

                return newMoles;
            });
        }, 600); // Frequency of mole logic

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [gameState]);

    const handleWhack = (index: number) => {
        if (gameState !== "PLAYING") return;

        const mole = moles[index];
        if (!mole) return;

        if (mole.type === "DISTRACTION") {
            // Correct hit
            setScore(s => s + 20);
            createFloatingText("+20", "score-float-good");
        } else {
            // Wrong hit! Hit a good habit!
            setScore(s => Math.max(0, s - 10));
            setStrikes(s => s + 1);
            createFloatingText("-10", "score-float-bad");
        }

        // Remove mole
        setMoles(currentMoles => {
            const newMoles = [...currentMoles];
            newMoles[index] = null;
            return newMoles;
        });
    };

    const createFloatingText = (text: string, className: string) => {
        // Simple DOM manipulation indicator
        const el = document.createElement("div");
        el.className = `floating-score ${className}`;
        el.innerText = text;
        el.style.left = `50%`;
        el.style.top = `50%`;

        const container = document.getElementById("game-arena");
        if (container) {
            container.appendChild(el);
            setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el) }, 800);
        }
    };

    const triggerFireworks = () => {
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
        function randomInRange(min: number, max: number) { return Math.random() * (max - min) + min; }

        const interval: any = setInterval(function () {
            const timeRemaining = animationEnd - Date.now();
            if (timeRemaining <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeRemaining / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    return (
        <div style={{ width: "100vw", height: "100vh", background: "#f8fafc", userSelect: "none", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
            {/* Nav */}
            <div style={{ position: "absolute", top: 24, left: 24, zIndex: 50 }}>
                <a href="/" style={{ background: "white", padding: "12px 20px", borderRadius: 16, fontWeight: 800, color: "#e11d48", textDecoration: "none", boxShadow: "0 4px 12px rgba(225,29,72,0.15)", border: "2px solid #fff1f2" }}>
                    ← Keluar
                </a>
            </div>

            {/* SCREEN: START */}
            {gameState === "START" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 40, background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "white" }}>
                    <div style={{ fontSize: 96, marginBottom: 24, animation: "bounceSoft 2s infinite" }}>🎯</div>
                    <h1 style={{ fontSize: "clamp(32px, 8vw, 64px)", fontWeight: 900, marginBottom: 12, letterSpacing: "-0.02em" }}>FOCUS GUARD</h1>
                    <p style={{ color: "#94a3b8", fontSize: "clamp(14px, 4vw, 18px)", maxWidth: 500, textAlign: "center", marginBottom: 40, lineHeight: 1.6 }}>
                        Lindungi fokus belajarmu! <b>Basmi</b> segala jenis distraksi (HP genggam📱, Toksik🤬, Tidur😴), namun <b>JANGAN</b> hantam buku📖, ide💡, dan pembelajaran.
                    </p>
                    <button
                        onClick={startGame}
                        style={{ background: "#e11d48", color: "white", border: "none", padding: "20px 56px", borderRadius: 24, fontSize: 20, fontWeight: 900, cursor: "pointer", boxShadow: "0 12px 32px rgba(225,29,72,0.4)" }}
                    >
                        MULAI BERJAGA 🛡️
                    </button>
                </div>
            )}

            {/* SCREEN: PLAYING */}
            {gameState === "PLAYING" && (
                <div id="game-arena" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% 10%, #fff 0%, #cbd5e1 100%)" }}>

                    {/* Header HUD */}
                    <div style={{ position: "absolute", top: 24, width: "100%", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
                        <div style={{ display: "flex", gap: 16 }}>
                            <div className="hud-box" style={{ color: "#e11d48" }}>
                                <div className="label">WAKTU</div>
                                <div className="value">{timeLeft}s</div>
                            </div>
                            <div className="hud-box" style={{ color: "#10b981" }}>
                                <div className="label">SKOR XP</div>
                                <div className="value">{score}</div>
                            </div>
                        </div>
                    </div>

                    {/* Arena */}
                    <div className="game-grid">
                        {moles.map((mole, i) => (
                            <div
                                key={i}
                                className="hole"
                                onClick={() => handleWhack(i)}
                            >
                                <div className="hole-darkness"></div>
                                {mole && (
                                    <div className={`mole-entity ${mole.type === 'DISTRACTION' ? 'target' : 'friend'} animate-pop`}>
                                        {mole.emoji}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ position: "absolute", bottom: 40, fontWeight: 800, color: "#64748b", background: "white", padding: "10px 24px", borderRadius: 20, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                        Kesalahan: <span style={{ color: strikes > 0 ? "#e11d48" : "inherit" }}>{strikes}</span>
                    </div>
                </div>
            )}

            {/* SCREEN: RESULT */}
            {gameState === "RESULT" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 40, background: "rgba(15,23,42,0.95)", color: "white", backdropFilter: "blur(10px)" }}>
                    <div style={{ fontSize: 96, marginBottom: 16 }}>{score > 100 ? "🏆" : "😅"}</div>
                    <h2 style={{ fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 900, marginBottom: 8 }}>{score > 100 ? "FOKUS TERJAGA!" : "FOKUS BOCOR!"}</h2>
                    <p style={{ color: "#cbd5e1", fontSize: "16px", marginBottom: 32 }}>
                        Kamu mendapatkan <b>{score} XP</b> | Kesalahan: {strikes}
                    </p>

                    <div style={{ display: "flex", gap: 16 }}>
                        <button
                            onClick={startGame}
                            style={{ background: "white", color: "#0f172a", border: "none", padding: "18px 40px", borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: "pointer" }}
                        >
                            <span style={{ fontSize: 20, verticalAlign: "middle", marginRight: 8 }}>🔄</span> Main Lagi
                        </button>
                        <a href="/" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "18px 40px", borderRadius: 16, fontSize: 16, fontWeight: 800, textDecoration: "none", display: "inline-block" }}>
                            Beranda
                        </a>
                    </div>
                </div>
            )}

            {/* GLOBAL CSS */}
            <style>{`
                @keyframes bounceSoft {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes popUp {
                    0% { transform: translateY(100%) scale(0.5); opacity: 0; }
                    60% { transform: translateY(-10%) scale(1.1); opacity: 1; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }

                .hud-box {
                    background: white;
                    padding: 12px 24px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 8px 20px -5px rgba(0,0,0,0.1);
                    min-width: 140px;
                }
                .label { font-size: 11px; font-weight: 800; letter-spacing: 0.1em; opacity: 0.7; }
                .value { font-size: 28px; font-weight: 900; line-height: 1.1; }

                .game-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    width: 100%;
                    max-width: 480px;
                    padding: 20px;
                }

                .hole {
                    position: relative;
                    aspect-ratio: 1;
                    cursor: crosshair;
                    overflow: hidden;
                    border-radius: 28px;
                    border: 8px solid white;
                    background: #f1f5f9;
                    box-shadow: 
                        inset 0 16px 20px rgba(0,0,0,0.1),
                        0 8px 16px -4px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    -webkit-tap-highlight-color: transparent;
                }
                .hole-darkness {
                    position: absolute;
                    bottom: -20%;
                    width: 80%;
                    height: 50%;
                    background: rgba(0,0,0,0.2);
                    border-radius: 50%;
                    filter: blur(8px);
                }

                .mole-entity {
                    font-size: clamp(48px, 12vw, 84px);
                    line-height: 1;
                    margin-bottom: 8px;
                    position: relative;
                    z-index: 2;
                    user-select: none;
                    filter: drop-shadow(0 8px 8px rgba(0,0,0,0.3));
                    transition: transform 0.1s;
                }
                .mole-entity:active {
                    transform: scale(0.8) translateY(10%);
                }

                .animate-pop {
                    animation: popUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .target { /* Red aura for bad things */
                    filter: drop-shadow(0 8px 16px rgba(225,29,72,0.6));
                }
                .friend { /* Green/Blue aura for good things */
                    filter: drop-shadow(0 8px 16px rgba(16,185,129,0.6));
                }

                .floating-score {
                    position: absolute;
                    transform: translate(-50%, -50%);
                    font-size: 32px;
                    font-weight: 900;
                    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    pointer-events: none;
                    animation: floatUpData 0.8s forwards ease-out;
                    z-index: 100;
                }
                .score-float-good { color: #10b981; }
                .score-float-bad { color: #e11d48; }

                @keyframes floatUpData {
                    0% { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
                    20% { opacity: 1; transform: translate(-50%, -20px) scale(1.2); }
                    100% { opacity: 0; transform: translate(-50%, -60px) scale(1); }
                }

                @media (max-width: 500px) {
                    .game-grid { gap: 12px; }
                    .hole { border-width: 6px; border-radius: 20px; }
                }
            `}</style>
        </div>
    );
}
