
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { stringToUUID } from "@/lib/ids";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Game Constants & Shapes ---
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 28; // px

const TETROMINOS = {
    I: { shape: [[1, 1, 1, 1]], color: "#06b6d4", type: "I" }, // Cyan
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: "#3b82f6", type: "J" }, // Blue
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: "#f97316", type: "L" }, // Orange
    O: { shape: [[1, 1], [1, 1]], color: "#eab308", type: "O" }, // Yellow
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: "#22c55e", type: "S" }, // Green
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: "#a855f7", type: "T" }, // Purple
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "#ef4444", type: "Z" }, // Red
};

const CULTURE_VALUES = [
    "Disiplin Waktu", "Jujur & Amanah", "Kerja Keras", "Kreatif",
    "Mandiri", "Rasa Ingin Tahu", "Semangat Kebangsaan", "Cinta Tanah Air",
    "Menghargai Prestasi", "Bersahabat/Komunikatif", "Cinta Damai",
    "Gemar Membaca", "Peduli Lingkungan", "Peduli Sosial", "Tanggung Jawab"
];

// --- Helper Functions ---
const createGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const randomTetromino = () => {
    const keys = Object.keys(TETROMINOS);
    const key = keys[Math.floor(Math.random() * keys.length)] as keyof typeof TETROMINOS;
    return TETROMINOS[key];
};

export default function TetrisPage() {
    const { data: session } = useSession();
    const router = useRouter();

    // Game State
    const [grid, setGrid] = useState(createGrid());
    const [activePiece, setActivePiece] = useState<any>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Grid coords
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [popup, setPopup] = useState<{ text: string, id: number } | null>(null);

    const requestRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);
    const dropCounterRef = useRef<number>(0);
    const dropIntervalRef = useRef<number>(1000); // ms

    // Initial Setup
    useEffect(() => {
        if (!session) return;
    }, [session]);

    const resetGame = () => {
        setGrid(createGrid());
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
        spawnPiece();
        dropIntervalRef.current = 1000;
    };

    const spawnPiece = () => {
        const piece = randomTetromino();
        setActivePiece(piece);
        // Center the piece
        const startX = Math.floor((COLS - piece.shape[0].length) / 2);
        setPosition({ x: startX, y: 0 });

        // Check collision on spawn (Game Over check)
        if (checkCollision(piece.shape, { x: startX, y: 0 }, grid)) {
            setGameOver(true);
            setIsPlaying(false);
            saveScore(score);
        }
    };

    const checkCollision = (shape: number[][], pos: { x: number, y: number }, currentGrid: any[][]) => {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const newY = y + pos.y;
                    const newX = x + pos.x;

                    // Bounds check
                    if (newX < 0 || newX >= COLS || newY >= ROWS) return true;

                    // Occupied check (only if inside grid vertically)
                    if (newY >= 0 && currentGrid[newY][newX] !== 0) return true;
                }
            }
        }
        return false;
    };

    const mergePiece = () => {
        const newGrid = grid.map(row => [...row]);
        activePiece.shape.forEach((row: number[], y: number) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const newY = y + position.y;
                    const newX = x + position.x;
                    if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
                        newGrid[newY][newX] = activePiece.color;
                    }
                }
            });
        });

        // Check for cleared lines
        let clearedLines = 0;
        const sweptGrid = newGrid.reduce((acc, row) => {
            if (row.every(cell => cell !== 0)) {
                clearedLines++;
                acc.unshift(Array(COLS).fill(0)); // Add new empty row at top
            } else {
                acc.push(row);
            }
            return acc;
        }, [] as any[][]);

        setGrid(sweptGrid);

        if (clearedLines > 0) {
            // Calculate Score & Show Popup
            const points = [0, 100, 300, 500, 800][clearedLines] * (Math.floor(score / 500) + 1);
            setScore(prev => prev + points);

            const value = CULTURE_VALUES[Math.floor(Math.random() * CULTURE_VALUES.length)];
            setPopup({ text: `+${points} XP: ${value}!`, id: Date.now() });
            setTimeout(() => setPopup(null), 2000);

            // Speed up
            dropIntervalRef.current = Math.max(100, 1000 - Math.floor(score / 500) * 100);
        } else {
            // Just placing a piece rewards a small amount? Or specifically "placement" popup?
            // User asked: "setiap meletakkan puzzle... ada pop up nilai budaya"
            // Usually Tetris only rewards lines. Let's add small reward for placement too.
            setScore(prev => prev + 10);
            const value = CULTURE_VALUES[Math.floor(Math.random() * CULTURE_VALUES.length)];
            setPopup({ text: value, id: Date.now() });
            setTimeout(() => setPopup(null), 1500);
        }

        spawnPiece();
    };

    const move = useCallback((dir: { x: number, y: number }) => {
        if (!activePiece || gameOver || !isPlaying) return;

        const newPos = { x: position.x + dir.x, y: position.y + dir.y };
        if (!checkCollision(activePiece.shape, newPos, grid)) {
            setPosition(newPos);
        } else {
            // If moving down and hit something, lock piece
            if (dir.y > 0) {
                mergePiece();
            }
        }
    }, [activePiece, position, grid, gameOver, isPlaying]);

    const rotate = useCallback(() => {
        if (!activePiece || gameOver || !isPlaying) return;

        // Rotate matrix
        const newShape = activePiece.shape[0].map((_: any, index: number) =>
            activePiece.shape.map((row: any[]) => row[index]).reverse()
        );

        if (!checkCollision(newShape, position, grid)) {
            setActivePiece({ ...activePiece, shape: newShape });
        }
    }, [activePiece, position, grid, gameOver, isPlaying]);

    // Game Loop
    const update = (time: number) => {
        if (!isPlaying || gameOver) return;

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        dropCounterRef.current += deltaTime;
        if (dropCounterRef.current > dropIntervalRef.current) {
            move({ x: 0, y: 1 });
            dropCounterRef.current = 0;
        }

        requestRef.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, gameOver, move]); // Re-bind loop when move changes

    // Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying || gameOver) return;
            if (e.key === "ArrowLeft") move({ x: -1, y: 0 });
            if (e.key === "ArrowRight") move({ x: 1, y: 0 });
            if (e.key === "ArrowDown") move({ x: 0, y: 1 });
            if (e.key === "ArrowUp") rotate();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying, gameOver, move, rotate]);

    // Save Score
    const saveScore = async (finalScore: number) => {
        if (session?.user?.email && finalScore > 0) {
            await supabase.from("user_progress").insert({
                user_email: session.user.email,
                mission_id: stringToUUID("TETRIS_CULTURE"),
                score: finalScore,
                choice_label: "TETRIS_CULTURE"
            });
        }
    };

    // --- Rendering ---
    // Combine static grid + active piece for render
    const displayGrid = grid.map(row => [...row]);
    if (activePiece && !gameOver) {
        activePiece.shape.forEach((row: number[], y: number) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const drawY = y + position.y;
                    const drawX = x + position.x;
                    if (drawY >= 0 && drawY < ROWS && drawX >= 0 && drawX < COLS) {
                        displayGrid[drawY][drawX] = activePiece.color;
                    }
                }
            });
        });
    }

    if (gameOver) {
        return (
            <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "white" }}>
                <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>Game Over</h1>
                <div style={{ fontSize: 24, marginBottom: 32 }}>Score: {score}</div>
                <button onClick={resetGame} style={{ background: "#e11d48", border: "none", padding: "16px 32px", borderRadius: 12, color: "white", fontWeight: 800, fontSize: 18, cursor: "pointer" }}>Main Lagi</button>
                <Link href="/" style={{ marginTop: 20, color: "#94a3b8", textDecoration: "none" }}>Kembali ke Menu</Link>
            </div>
        )
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 400, marginBottom: 20, alignItems: "center" }}>
                <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontWeight: 700 }}>← Kembali</Link>
                <div style={{ fontSize: 24, fontWeight: 900, color: "white" }}>{score}</div>
            </div>

            {/* Game Board */}
            <div style={{
                position: "relative",
                background: "#1e293b",
                border: "4px solid #334155",
                borderRadius: 8,
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                width: COLS * BLOCK_SIZE + 8,
                height: ROWS * BLOCK_SIZE + 8,
                padding: 4
            }}>
                {displayGrid.flatMap((row, y) => row.map((color, x) => (
                    <div key={`${x}-${y}`} style={{
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                        background: color || "rgba(255,255,255,0.03)",
                        border: color ? "1px solid rgba(0,0,0,0.2)" : "1px solid rgba(255,255,255,0.02)",
                        borderRadius: 2,
                        boxShadow: color ? "inset 0 0 10px rgba(0,0,0,0.2)" : "none"
                    }} />
                )))}

                {/* Start Overlay */}
                {!isPlaying && !gameOver && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.8)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                        <div style={{ fontSize: 64, marginBottom: 10 }}>🏗️</div>
                        <h2 style={{ color: "white", fontWeight: 900, marginBottom: 8 }}>Culture Tetris</h2>
                        <p style={{ color: "#94a3b8", fontSize: 13, maxWidth: 200, textAlign: "center", marginBottom: 24 }}>Susun balok & temukan nilai budaya di setiap langkah!</p>
                        <button onClick={resetGame} style={{ background: "#22c55e", border: "none", padding: "14px 28px", borderRadius: 99, color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 10px 20px rgba(34,197,94,0.3)" }}>START GAME</button>
                    </div>
                )}

                {/* Culture Popup */}
                {popup && (
                    <div className="popup-animation" style={{
                        position: "absolute",
                        top: "30%", left: "50%", transform: "translateX(-50%)",
                        background: "rgba(255,255,255,0.95)",
                        color: "#0f172a",
                        padding: "12px 24px",
                        borderRadius: 16,
                        fontWeight: 800,
                        fontSize: 14,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                        whiteSpace: "nowrap",
                        zIndex: 10,
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: 10, color: "#e11d48", textTransform: "uppercase", marginBottom: 2 }}>NILAI BUDAYA</div>
                        {popup.text}
                    </div>
                )}

                <style>{`
            .popup-animation { animation: popUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            @keyframes popUp {
                from { opacity: 0; transform: translate(-50%, 20px) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, 0) scale(1); }
            }
        `}</style>
            </div>

            {/* Mobile Controls */}
            <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
                <button onPointerDown={() => move({ x: -1, y: 0 })} style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "white", fontSize: 24 }}>←</button>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button onPointerDown={() => rotate()} style={{ width: 60, height: 60, borderRadius: "50%", background: "#e11d48", border: "none", color: "white", fontSize: 24 }}>↻</button>
                    <button onPointerDown={() => move({ x: 0, y: 1 })} style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "white", fontSize: 24 }}>↓</button>
                </div>
                <button onPointerDown={() => move({ x: 1, y: 0 })} style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "white", fontSize: 24 }}>→</button>
            </div>
        </div>
    );
}
