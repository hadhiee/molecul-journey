
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

// --- 8 ATTITUDE Values (from seed_attitude_values.sql) ---
const ATTITUDE_VALUES = [
    { code: "ATT_A", name: "Act Respectfully", emoji: "🤝", color: "#f43f5e", short: "Respect" },
    { code: "ATT_TP", name: "Talk Politely", emoji: "💬", color: "#8b5cf6", short: "Polite" },
    { code: "ATT_TOD", name: "Turn Off Distraction", emoji: "🎯", color: "#0ea5e9", short: "Focus" },
    { code: "ATT_IA", name: "Involve Actively", emoji: "🙋", color: "#22c55e", short: "Active" },
    { code: "ATT_TS", name: "Think Solutions", emoji: "💡", color: "#f59e0b", short: "Solution" },
    { code: "ATT_UTW", name: "Use Tech Wisely", emoji: "🖥️", color: "#6366f1", short: "Tech" },
    { code: "ATT_DA", name: "Dare to Ask", emoji: "❓", color: "#ec4899", short: "Ask" },
    { code: "ATT_ETC", name: "Eager to Collaborate", emoji: "🤜", color: "#14b8a6", short: "Collab" },
];

// --- Game Constants ---
const GRID_SIZE = 20;
const INITIAL_SPEED = 150; // ms per tick
const SPEED_INCREASE = 3; // ms faster per food eaten
const MIN_SPEED = 60;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };
type FoodItem = Position & { attitude: typeof ATTITUDE_VALUES[number]; points: number };

function randomAttitude() {
    return ATTITUDE_VALUES[Math.floor(Math.random() * ATTITUDE_VALUES.length)];
}

function randomPosition(snake: Position[]): Position {
    let pos: Position;
    do {
        pos = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
}

function spawnFood(snake: Position[]): FoodItem {
    const pos = randomPosition(snake);
    const attitude = randomAttitude();
    const points = [25, 50, 75, 100][Math.floor(Math.random() * 4)];
    return { ...pos, attitude, points };
}

// Bonus food (golden) — rare, high XP
function spawnBonusFood(snake: Position[]): FoodItem | null {
    if (Math.random() > 0.3) return null; // 30% chance
    const pos = randomPosition(snake);
    const attitude = randomAttitude();
    return { ...pos, attitude, points: 200 };
}

export default function SnakePage() {
    const { data: session } = useSession();

    // Game state
    const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
    const [direction, setDirection] = useState<Direction>("RIGHT");
    const [food, setFood] = useState<FoodItem>(() => spawnFood([{ x: 10, y: 10 }]));
    const [bonusFood, setBonusFood] = useState<FoodItem | null>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    const [popup, setPopup] = useState<{ text: string; emoji: string; color: string; id: number } | null>(null);
    const [eatenCount, setEatenCount] = useState(0);
    const [combo, setCombo] = useState(0);
    const [lastAttitude, setLastAttitude] = useState<string>("");
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
    const [showAttitudeBoard, setShowAttitudeBoard] = useState(false);
    const [collectedAttitudes, setCollectedAttitudes] = useState<Record<string, number>>({});

    const dirRef = useRef<Direction>("RIGHT");
    const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
    const foodRef = useRef<FoodItem>(food);
    const bonusFoodRef = useRef<FoodItem | null>(null);
    const scoreRef = useRef(0);
    const savedScoreRef = useRef(0);
    const speedRef = useRef(INITIAL_SPEED);
    const gameOverRef = useRef(false);
    const isPlayingRef = useRef(false);
    const tickRef = useRef<NodeJS.Timeout | null>(null);
    const comboRef = useRef(0);
    const lastAttitudeRef = useRef("");
    const bonusTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Keep refs in sync
    useEffect(() => { dirRef.current = direction; }, [direction]);
    useEffect(() => { snakeRef.current = snake; }, [snake]);
    useEffect(() => { foodRef.current = food; }, [food]);
    useEffect(() => { bonusFoodRef.current = bonusFood; }, [bonusFood]);
    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { speedRef.current = speed; }, [speed]);
    useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { comboRef.current = combo; }, [combo]);
    useEffect(() => { lastAttitudeRef.current = lastAttitude; }, [lastAttitude]);

    // Load high score from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("moklet_snake_highscore");
        if (saved) setHighScore(parseInt(saved, 10));
    }, []);

    // --- Game Loop ---
    const gameTick = useCallback(() => {
        if (gameOverRef.current || !isPlayingRef.current) return;

        const currentSnake = [...snakeRef.current];
        const head = { ...currentSnake[0] };
        const dir = dirRef.current;

        // Move head
        if (dir === "UP") head.y -= 1;
        if (dir === "DOWN") head.y += 1;
        if (dir === "LEFT") head.x -= 1;
        if (dir === "RIGHT") head.x += 1;

        // Wall collision (wrap around)
        if (head.x < 0) head.x = GRID_SIZE - 1;
        if (head.x >= GRID_SIZE) head.x = 0;
        if (head.y < 0) head.y = GRID_SIZE - 1;
        if (head.y >= GRID_SIZE) head.y = 0;

        // Self collision
        if (currentSnake.some(s => s.x === head.x && s.y === head.y)) {
            setGameOver(true);
            setIsPlaying(false);
            if (tickRef.current) clearInterval(tickRef.current);
            // Save high score
            const currentScore = scoreRef.current;
            const storedHigh = parseInt(localStorage.getItem("moklet_snake_highscore") || "0", 10);
            if (currentScore > storedHigh) {
                localStorage.setItem("moklet_snake_highscore", currentScore.toString());
                setHighScore(currentScore);
            }
            return;
        }

        const newSnake = [head, ...currentSnake];
        let ate = false;

        // Check regular food
        const currentFood = foodRef.current;
        if (head.x === currentFood.x && head.y === currentFood.y) {
            ate = true;
            const att = currentFood.attitude;
            let comboMultiplier = 1;

            // Combo system: same attitude = combo!
            if (lastAttitudeRef.current === att.code) {
                const newCombo = comboRef.current + 1;
                setCombo(newCombo);
                comboMultiplier = 1 + newCombo * 0.5;
            } else {
                setCombo(0);
            }
            setLastAttitude(att.code);

            const earnedPoints = Math.round(currentFood.points * comboMultiplier);
            setScore(prev => prev + earnedPoints);
            setEatenCount(prev => prev + 1);

            // Track collected attitudes
            setCollectedAttitudes(prev => ({
                ...prev,
                [att.code]: (prev[att.code] || 0) + 1,
            }));

            // Show popup
            const comboText = comboMultiplier > 1 ? ` (COMBO x${comboMultiplier.toFixed(1)})` : "";
            setPopup({
                text: `+${earnedPoints} XP: ${att.name}${comboText}`,
                emoji: att.emoji,
                color: att.color,
                id: Date.now()
            });
            setTimeout(() => setPopup(null), 2000);

            // Spawn particles
            const newParticles = Array.from({ length: 6 }, (_, i) => ({
                id: Date.now() + i,
                x: head.x,
                y: head.y,
                color: att.color,
            }));
            setParticles(prev => [...prev, ...newParticles]);
            setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 600);

            // New food
            const nextFood = spawnFood(newSnake);
            setFood(nextFood);

            // Maybe spawn bonus food
            const bonus = spawnBonusFood(newSnake);
            if (bonus) {
                setBonusFood(bonus);
                // Bonus food disappears after 5 seconds
                if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);
                bonusTimerRef.current = setTimeout(() => setBonusFood(null), 5000);
            }

            // Speed up
            const newSpeed = Math.max(MIN_SPEED, speedRef.current - SPEED_INCREASE);
            setSpeed(newSpeed);

            // Restart interval with new speed
            if (tickRef.current) clearInterval(tickRef.current);
            tickRef.current = setInterval(gameTick, newSpeed);
        }

        // Check bonus food
        const currentBonus = bonusFoodRef.current;
        if (currentBonus && head.x === currentBonus.x && head.y === currentBonus.y) {
            ate = true;
            const att = currentBonus.attitude;
            setScore(prev => prev + currentBonus.points);
            setEatenCount(prev => prev + 1);
            setCollectedAttitudes(prev => ({
                ...prev,
                [att.code]: (prev[att.code] || 0) + 1,
            }));

            setPopup({
                text: `🌟 BONUS +${currentBonus.points} XP: ${att.name}!`,
                emoji: "⭐",
                color: "#f59e0b",
                id: Date.now()
            });
            setTimeout(() => setPopup(null), 2500);

            setBonusFood(null);
            if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);
        }

        if (!ate) {
            newSnake.pop(); // Remove tail if no food eaten
        }

        setSnake(newSnake);
    }, []);

    const startGame = useCallback(() => {
        const initialSnake = [
            { x: 12, y: 10 },
            { x: 11, y: 10 },
            { x: 10, y: 10 },
        ];
        setSnake(initialSnake);
        setDirection("RIGHT");
        setFood(spawnFood(initialSnake));
        setBonusFood(null);
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
        setSpeed(INITIAL_SPEED);
        setEatenCount(0);
        setCombo(0);
        setLastAttitude("");
        setPopup(null);
        setParticles([]);
        setCollectedAttitudes({});
        setShowAttitudeBoard(false);

        dirRef.current = "RIGHT";
        scoreRef.current = 0;
        savedScoreRef.current = 0;
        speedRef.current = INITIAL_SPEED;
        gameOverRef.current = false;
        isPlayingRef.current = true;
        comboRef.current = 0;
        lastAttitudeRef.current = "";

        if (tickRef.current) clearInterval(tickRef.current);
        tickRef.current = setInterval(gameTick, INITIAL_SPEED);
    }, [gameTick]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
            if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);
        };
    }, []);

    // Keyboard controls
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!isPlayingRef.current || gameOverRef.current) return;
            const dir = dirRef.current;
            if ((e.key === "ArrowUp" || e.key === "w") && dir !== "DOWN") setDirection("UP");
            if ((e.key === "ArrowDown" || e.key === "s") && dir !== "UP") setDirection("DOWN");
            if ((e.key === "ArrowLeft" || e.key === "a") && dir !== "RIGHT") setDirection("LEFT");
            if ((e.key === "ArrowRight" || e.key === "d") && dir !== "LEFT") setDirection("RIGHT");
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    // Touch swipe controls
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            const t = e.touches[0];
            touchStartRef.current = { x: t.clientX, y: t.clientY };
        };
        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStartRef.current || !isPlayingRef.current || gameOverRef.current) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - touchStartRef.current.x;
            const dy = t.clientY - touchStartRef.current.y;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) < 20) return; // Too small, ignore

            const dir = dirRef.current;
            if (absDx > absDy) {
                // Horizontal swipe
                if (dx > 0 && dir !== "LEFT") setDirection("RIGHT");
                else if (dx < 0 && dir !== "RIGHT") setDirection("LEFT");
            } else {
                // Vertical swipe
                if (dy > 0 && dir !== "UP") setDirection("DOWN");
                else if (dy < 0 && dir !== "DOWN") setDirection("UP");
            }
            touchStartRef.current = null;
        };
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchend", handleTouchEnd, { passive: true });
        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    // Score saving (same pattern as Tetris)
    const saveScore = async (amount: number) => {
        if (amount > 0 && session?.user?.email) {
            try {
                await supabase.from("user_progress").insert({
                    user_email: session.user.email.toLowerCase(),
                    mission_id: null,
                    score: amount,
                    choice_label: "SNAKE_GAME"
                });
            } catch (e) { }
        }
    };

    const handleExit = async () => {
        if (tickRef.current) clearInterval(tickRef.current);
        const diff = scoreRef.current - savedScoreRef.current;
        if (diff > 0) {
            await saveScore(diff);
            savedScoreRef.current = scoreRef.current;
        }
        window.location.href = "/";
    };

    // Auto-save periodically
    useEffect(() => {
        if (isPlaying || gameOver) {
            const diff = scoreRef.current - savedScoreRef.current;
            if (diff > 0 && session?.user?.email) {
                saveScore(diff).then(() => {
                    savedScoreRef.current = scoreRef.current;
                });
            }
        }
    }, [score, gameOver, session, isPlaying]);

    // Cell size calculation
    const containerSize = Math.min(380, typeof window !== "undefined" ? window.innerWidth - 40 : 380);
    const cellSize = containerSize / GRID_SIZE;

    // --- GAME OVER SCREEN ---
    if (gameOver) {
        const topAttitudes = Object.entries(collectedAttitudes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([code, count]) => ({
                ...ATTITUDE_VALUES.find(a => a.code === code)!,
                count,
            }));

        return (
            <div style={{
                minHeight: "100vh", background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
                display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                color: "white", padding: 20, fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}>
                <div style={{
                    background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)",
                    borderRadius: 32, padding: 32, maxWidth: 380, width: "100%",
                    border: "1px solid rgba(255,255,255,0.1)", textAlign: "center",
                }}>
                    <div style={{ fontSize: 64, marginBottom: 8 }}>🐍</div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 4, letterSpacing: "-0.02em" }}>Game Over!</h1>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
                        Kamu memakan {eatenCount} nilai budaya
                    </div>

                    {/* Score */}
                    <div style={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        borderRadius: 20, padding: "20px 24px", marginBottom: 20,
                    }}>
                        <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.03em" }}>{score}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total XP</div>
                        {score >= highScore && score > 0 && (
                            <div style={{
                                marginTop: 8, fontSize: 11, fontWeight: 800,
                                background: "#f59e0b", color: "#1e293b",
                                display: "inline-block", padding: "3px 12px", borderRadius: 20,
                            }}>🏆 NEW HIGH SCORE!</div>
                        )}
                    </div>

                    {/* Top collected attitudes */}
                    {topAttitudes.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                                Nilai Budaya Terkumpul
                            </div>
                            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                                {topAttitudes.map(att => (
                                    <div key={att.code} style={{
                                        background: `${att.color}22`, border: `1px solid ${att.color}44`,
                                        borderRadius: 14, padding: "8px 14px",
                                        display: "flex", alignItems: "center", gap: 6,
                                    }}>
                                        <span style={{ fontSize: 18 }}>{att.emoji}</span>
                                        <div style={{ textAlign: "left" }}>
                                            <div style={{ fontSize: 11, fontWeight: 800, color: att.color }}>{att.short}</div>
                                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>×{att.count}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={startGame} style={{
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        border: "none", padding: "16px 40px", borderRadius: 99,
                        color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer",
                        boxShadow: "0 10px 25px rgba(34,197,94,0.3)",
                        width: "100%", marginBottom: 12,
                    }}>🔄 Main Lagi</button>

                    <button onClick={handleExit} style={{
                        border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)",
                        padding: "12px 24px", borderRadius: 99,
                        color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13,
                        cursor: "pointer", width: "100%",
                    }}>KUMPULKAN XP & KELUAR</button>
                </div>
            </div>
        );
    }

    // --- MAIN GAME SCREEN ---
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 20,
            position: "relative", overflow: "hidden",
        }}>
            {/* Background glow */}
            <div style={{
                position: "fixed", top: "20%", left: "50%", transform: "translate(-50%, -50%)",
                width: 400, height: 400, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* Header */}
            <div style={{
                display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 400,
                marginBottom: 16, alignItems: "center", position: "relative", zIndex: 10,
            }}>
                <button onClick={handleExit} style={{
                    border: "none", background: "rgba(255,255,255,0.08)",
                    padding: "8px 14px", borderRadius: 12, cursor: "pointer",
                    color: "#94a3b8", fontWeight: 700, fontSize: 11,
                    display: "flex", alignItems: "center", gap: 6,
                    backdropFilter: "blur(10px)",
                }}>← XP & KELUAR</button>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {combo > 0 && (
                        <div className="combo-pulse" style={{
                            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                            padding: "4px 12px", borderRadius: 20,
                            fontSize: 11, fontWeight: 900, color: "white",
                        }}>COMBO ×{(1 + combo * 0.5).toFixed(1)}</div>
                    )}
                    <div style={{
                        background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
                        padding: "8px 16px", borderRadius: 14,
                        display: "flex", alignItems: "center", gap: 8,
                    }}>
                        <span style={{ fontSize: 18 }}>⚡</span>
                        <span style={{ fontSize: 20, fontWeight: 900, color: "white" }}>{score}</span>
                    </div>
                </div>
            </div>

            {/* Sub stats */}
            <div style={{
                display: "flex", gap: 16, marginBottom: 16, fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
            }}>
                <span>🏆 Best: {highScore}</span>
                <span>🐍 Length: {snake.length}</span>
                <span>🍎 Eaten: {eatenCount}</span>
            </div>

            {/* Game Board */}
            <div style={{
                position: "relative",
                width: GRID_SIZE * cellSize + 8,
                height: GRID_SIZE * cellSize + 8,
                background: "rgba(15, 23, 42, 0.8)",
                border: "2px solid rgba(99, 102, 241, 0.3)",
                borderRadius: 16,
                padding: 4,
                boxShadow: "0 0 60px rgba(99,102,241,0.15), inset 0 0 60px rgba(0,0,0,0.3)",
                backdropFilter: "blur(10px)",
            }}>
                {/* Grid lines (subtle) */}
                <svg style={{ position: "absolute", inset: 4, opacity: 0.04, pointerEvents: "none" }}
                    width={GRID_SIZE * cellSize} height={GRID_SIZE * cellSize}>
                    {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
                        <g key={i}>
                            <line x1={i * cellSize} y1={0} x2={i * cellSize} y2={GRID_SIZE * cellSize} stroke="white" strokeWidth="0.5" />
                            <line x1={0} y1={i * cellSize} x2={GRID_SIZE * cellSize} y2={i * cellSize} stroke="white" strokeWidth="0.5" />
                        </g>
                    ))}
                </svg>

                {/* Snake */}
                {snake.map((seg, i) => {
                    const isHead = i === 0;
                    const opacity = 1 - (i / snake.length) * 0.5;
                    return (
                        <div key={`snake-${i}`} style={{
                            position: "absolute",
                            left: 4 + seg.x * cellSize,
                            top: 4 + seg.y * cellSize,
                            width: cellSize - 1,
                            height: cellSize - 1,
                            background: isHead
                                ? "linear-gradient(135deg, #22c55e, #4ade80)"
                                : `rgba(34, 197, 94, ${opacity})`,
                            borderRadius: isHead ? 6 : 4,
                            boxShadow: isHead
                                ? "0 0 12px rgba(34,197,94,0.6), inset 0 0 4px rgba(255,255,255,0.2)"
                                : "none",
                            transition: "all 0.08s linear",
                            zIndex: isHead ? 5 : 3,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {isHead && (
                                <div style={{ fontSize: cellSize * 0.55, lineHeight: 1 }}>
                                    {direction === "UP" ? "😤" : direction === "DOWN" ? "😋" : direction === "LEFT" ? "😏" : "😎"}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Regular Food */}
                <div className="food-bounce" style={{
                    position: "absolute",
                    left: 4 + food.x * cellSize,
                    top: 4 + food.y * cellSize,
                    width: cellSize - 1,
                    height: cellSize - 1,
                    borderRadius: 6,
                    background: `${food.attitude.color}33`,
                    border: `2px solid ${food.attitude.color}88`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 4,
                    boxShadow: `0 0 16px ${food.attitude.color}44`,
                }}>
                    <span style={{ fontSize: cellSize * 0.6, lineHeight: 1 }}>{food.attitude.emoji}</span>
                </div>

                {/* Bonus Food */}
                {bonusFood && (
                    <div className="bonus-glow" style={{
                        position: "absolute",
                        left: 4 + bonusFood.x * cellSize,
                        top: 4 + bonusFood.y * cellSize,
                        width: cellSize - 1,
                        height: cellSize - 1,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 4,
                        boxShadow: "0 0 20px rgba(245,158,11,0.6)",
                    }}>
                        <span style={{ fontSize: cellSize * 0.5, lineHeight: 1 }}>⭐</span>
                    </div>
                )}

                {/* Particles */}
                {particles.map(p => (
                    <div key={p.id} className="particle-burst" style={{
                        position: "absolute",
                        left: 4 + p.x * cellSize + cellSize / 2,
                        top: 4 + p.y * cellSize + cellSize / 2,
                        width: 6, height: 6,
                        borderRadius: "50%",
                        background: p.color,
                        zIndex: 10,
                        pointerEvents: "none",
                    }} />
                ))}

                {/* Popup */}
                {popup && (
                    <div className="popup-animation" style={{
                        position: "absolute",
                        top: "20%", left: "50%", transform: "translateX(-50%)",
                        background: "rgba(15,23,42,0.95)",
                        border: `2px solid ${popup.color}66`,
                        color: "white",
                        padding: "12px 20px",
                        borderRadius: 20,
                        fontWeight: 800,
                        fontSize: 13,
                        boxShadow: `0 10px 30px rgba(0,0,0,0.4), 0 0 20px ${popup.color}33`,
                        whiteSpace: "nowrap",
                        zIndex: 20,
                        textAlign: "center",
                        backdropFilter: "blur(10px)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                            <span style={{ fontSize: 20 }}>{popup.emoji}</span>
                            <div>
                                <div style={{ fontSize: 9, color: popup.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>ATTITUDE VALUE</div>
                                <div style={{ fontSize: 13, fontWeight: 800 }}>{popup.text}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Start Overlay */}
                {!isPlaying && !gameOver && (
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: 12,
                        background: "rgba(15,23,42,0.92)", backdropFilter: "blur(8px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexDirection: "column", zIndex: 30,
                    }}>
                        <div style={{ fontSize: 72, marginBottom: 12 }}>🐍</div>
                        <h2 style={{ color: "white", fontWeight: 900, fontSize: 28, marginBottom: 4, letterSpacing: "-0.02em" }}>Moklet Snake</h2>
                        <p style={{ color: "#94a3b8", fontSize: 13, maxWidth: 260, textAlign: "center", marginBottom: 8, lineHeight: 1.5 }}>
                            Kumpulkan 8 nilai ATTITUDE sambil menghindari ekormu sendiri!
                        </p>
                        <div style={{
                            display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap", justifyContent: "center",
                            maxWidth: 220,
                        }}>
                            {ATTITUDE_VALUES.map(att => (
                                <span key={att.code} style={{
                                    fontSize: 16, background: `${att.color}22`,
                                    borderRadius: 8, padding: "2px 4px",
                                    border: `1px solid ${att.color}33`,
                                }}>{att.emoji}</span>
                            ))}
                        </div>
                        <button onClick={startGame} style={{
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
                            border: "none", padding: "16px 36px", borderRadius: 99,
                            color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer",
                            boxShadow: "0 10px 30px rgba(34,197,94,0.4)",
                        }}>START GAME</button>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 16, fontWeight: 500 }}>
                            Swipe / Arrow keys untuk kontrol
                        </div>
                    </div>
                )}
            </div>

            {/* Current food info */}
            {isPlaying && (
                <div style={{
                    marginTop: 16, display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)",
                    padding: "10px 20px", borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.08)",
                }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Target:</span>
                    <span style={{ fontSize: 20 }}>{food.attitude.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: food.attitude.color }}>{food.attitude.name}</span>
                    <span style={{
                        fontSize: 10, fontWeight: 800, background: `${food.attitude.color}22`,
                        color: food.attitude.color, padding: "3px 10px", borderRadius: 20,
                    }}>+{food.points} XP</span>
                </div>
            )}

            {/* Mobile D-pad controls */}
            {isPlaying && (
                <div style={{ marginTop: 20, position: "relative", width: 180, height: 180 }}>
                    {/* Up */}
                    <button
                        onPointerDown={() => { if (dirRef.current !== "DOWN") setDirection("UP"); }}
                        style={{
                            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                            width: 56, height: 56, borderRadius: 16,
                            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "white", fontSize: 22, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backdropFilter: "blur(10px)",
                        }}
                    >↑</button>
                    {/* Down */}
                    <button
                        onPointerDown={() => { if (dirRef.current !== "UP") setDirection("DOWN"); }}
                        style={{
                            position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                            width: 56, height: 56, borderRadius: 16,
                            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "white", fontSize: 22, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backdropFilter: "blur(10px)",
                        }}
                    >↓</button>
                    {/* Left */}
                    <button
                        onPointerDown={() => { if (dirRef.current !== "RIGHT") setDirection("LEFT"); }}
                        style={{
                            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                            width: 56, height: 56, borderRadius: 16,
                            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "white", fontSize: 22, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backdropFilter: "blur(10px)",
                        }}
                    >←</button>
                    {/* Right */}
                    <button
                        onPointerDown={() => { if (dirRef.current !== "LEFT") setDirection("RIGHT"); }}
                        style={{
                            position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
                            width: 56, height: 56, borderRadius: 16,
                            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "white", fontSize: 22, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backdropFilter: "blur(10px)",
                        }}
                    >→</button>
                    {/* Center dot */}
                    <div style={{
                        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                        width: 40, height: 40, borderRadius: 12,
                        background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18,
                    }}>🐍</div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                .food-bounce {
                    animation: foodBounce 1s ease-in-out infinite;
                }
                @keyframes foodBounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                .bonus-glow {
                    animation: bonusGlow 0.6s ease-in-out infinite alternate;
                }
                @keyframes bonusGlow {
                    from { transform: scale(1) rotate(0deg); box-shadow: 0 0 15px rgba(245,158,11,0.4); }
                    to { transform: scale(1.2) rotate(15deg); box-shadow: 0 0 30px rgba(245,158,11,0.8); }
                }
                .popup-animation {
                    animation: popUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes popUp {
                    from { opacity: 0; transform: translate(-50%, 20px) scale(0.8); }
                    to { opacity: 1; transform: translate(-50%, 0) scale(1); }
                }
                .particle-burst {
                    animation: particleBurst 0.6s ease-out forwards;
                }
                @keyframes particleBurst {
                    from { opacity: 1; transform: scale(1) translate(0, 0); }
                    to { opacity: 0; transform: scale(0) translate(${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 30}px, ${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 30}px); }
                }
                .combo-pulse {
                    animation: comboPulse 0.5s ease-in-out infinite alternate;
                }
                @keyframes comboPulse {
                    from { transform: scale(1); }
                    to { transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
}
