"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { stringToUUID } from "@/lib/ids";
import Link from "next/link";

const ROUNDS = [
    [
        { id: 1, left: "Act", right: "Respectfully" },
        { id: 2, left: "Talk", right: "Politely" },
        { id: 3, left: "Turn Off", right: "Distraction" },
        { id: 4, left: "Involve", right: "Actively" },
        { id: 5, left: "Think", right: "Solutions" },
    ],
    [
        { id: 6, left: "Use Tech", right: "Wisely" },
        { id: 7, left: "Dare to", right: "Ask" },
        { id: 8, left: "Eager to", right: "Collaborate" },
        { id: 10, left: "Growth", right: "Mindset" },
        { id: 11, left: "Problem", right: "Solving" },
    ]
];

export default function CultureConnectPage() {
    const { data: session } = useSession();
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const [leftItems, setLeftItems] = useState<any[]>([]);
    const [rightItems, setRightItems] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]); // { fromId, toId, status: 'correct', color: 'green' }
    const [dragging, setDragging] = useState<{ startId: number, startSide: string, x: number, y: number } | null>(null);
    const [pointsCache, setPointsCache] = useState<Record<string, { x: number, y: number }>>({});

    const containerRef = useRef<HTMLDivElement>(null);

    // Init Round
    useEffect(() => {
        if (currentRound >= ROUNDS.length) {
            if (currentRound > 0) setGameOver(true);
            return;
        }

        const roundData = ROUNDS[currentRound];
        // Shuffle left and right independently
        setLeftItems([...roundData].sort(() => Math.random() - 0.5));
        setRightItems([...roundData].sort(() => Math.random() - 0.5));
        setConnections([]);

        // Wait for render to measure coords
        setTimeout(measurePoints, 100);
    }, [currentRound]);

    // Handle window resize
    useEffect(() => {
        window.addEventListener('resize', measurePoints);
        return () => window.removeEventListener('resize', measurePoints);
    }, [leftItems, rightItems]);

    // Save Score
    useEffect(() => {
        if (gameOver && score > 0 && session?.user?.email) {
            supabase.from("user_progress").insert({
                user_email: session.user.email,
                mission_id: stringToUUID("CULTURE_CONNECT"),
                score: score,
                choice_label: "CONNECT_GAME"
            }).then(() => console.log("Score saved!"));
        }
    }, [gameOver, score, session]);

    const measurePoints = () => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const nodes = document.querySelectorAll('.match-node');
        const newPoints: Record<string, { x: number, y: number }> = {};

        nodes.forEach(node => {
            const rect = node.getBoundingClientRect();
            // Store center of the dot relative to container
            newPoints[node.id] = {
                x: rect.left + rect.width / 2 - containerRect.left,
                y: rect.top + rect.height / 2 - containerRect.top
            };
        });
        setPointsCache(newPoints);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        const target = (e.target as HTMLElement).closest('.match-item');
        if (!target) return;

        const id = parseInt(target.getAttribute('data-id') || '0');
        const side = target.getAttribute('data-side') || 'left';

        // Don't drag if already correctly connected
        if (connections.find(c => (c.fromId === id && side === 'left') || (c.toId === id && side === 'right'))) {
            return;
        }

        const containerRect = containerRef.current!.getBoundingClientRect();
        setDragging({
            startId: id,
            startSide: side,
            x: e.clientX - containerRect.left,
            y: e.clientY - containerRect.top
        });

        target.classList.add('scale-95'); // Visual feedback
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragging) return;
        const containerRect = containerRef.current!.getBoundingClientRect();
        setDragging({
            ...dragging,
            x: e.clientX - containerRect.left,
            y: e.clientY - containerRect.top
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        document.querySelectorAll('.match-item').forEach(i => i.classList.remove('scale-95'));
        if (!dragging) return;

        const targetEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.match-item');

        if (targetEl) {
            const targetId = parseInt(targetEl.getAttribute('data-id') || '0');
            const targetSide = targetEl.getAttribute('data-side') || 'left';

            // Must drop on opposite side
            if (targetSide !== dragging.startSide) {
                // Check if already connected
                if (!connections.find(c => c.fromId === targetId || c.toId === targetId)) {
                    processConnection(dragging.startId, targetId, dragging.startSide);
                }
            }
        }

        setDragging(null);
    };

    const processConnection = (id1: number, id2: number, startSide: string) => {
        const leftId = startSide === 'left' ? id1 : id2;
        const rightId = startSide === 'right' ? id1 : id2;

        const isMatch = leftId === rightId; // Our items have the same ID for pairs

        const newConn = {
            id: Date.now(),
            fromId: leftId,
            toId: rightId,
            status: isMatch ? 'correct' : 'wrong'
        };

        setConnections(prev => [...prev, newConn]);

        if (isMatch) {
            setScore(s => s + 10);

            // Check if round won (all 5 connected)
            const correctCount = connections.filter(c => c.status === 'correct').length + 1;
            if (correctCount === ROUNDS[currentRound].length) {
                setTimeout(() => setCurrentRound(r => r + 1), 1000);
            }
        } else {
            // Remove wrong connection after 1 second
            setTimeout(() => {
                setConnections(prev => prev.filter(c => c.id !== newConn.id));
            }, 800);
        }
    };

    return (
        <div style={{ width: "100vw", height: "100vh", background: "#020617", userSelect: "none" }}>
            {/* Header / UI Layer */}
            <div style={{ position: "absolute", zIndex: 10, pointerEvents: "none", inset: 0, padding: 24, paddingTop: 48 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link href="/" style={{
                        color: "white", textDecoration: "none", fontWeight: 700, pointerEvents: "auto",
                        background: "rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: 99,
                        backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)"
                    }}>
                        ← KEMBALI
                    </Link>
                    <div style={{
                        fontSize: 28, fontWeight: 900, color: "white", textShadow: "0 0 20px #22c55e",
                        background: "rgba(34, 197, 94, 0.2)", padding: "8px 24px", borderRadius: 99,
                        backdropFilter: "blur(4px)", border: "1px solid rgba(34, 197, 94, 0.4)"
                    }}>
                        {score} XP
                    </div>
                </div>
                {!gameOver && (
                    <div style={{ textAlign: "center", marginTop: 20 }}>
                        <h2 style={{ color: "white", fontSize: 24, fontWeight: 800, margin: 0 }}>CULTURE CONNECT</h2>
                        <p style={{ color: "#94a3b8", margin: "5px 0 0 0" }}>Tarik garis untuk menghubungkan nilai yang tepat!</p>
                        <p style={{ color: "#3b82f6", fontWeight: "bold", fontSize: 14 }}>Ronde {currentRound + 1} / {ROUNDS.length}</p>
                    </div>
                )}
            </div>

            {/* Game Canvas */}
            {!gameOver && (
                <div
                    ref={containerRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{
                        position: "absolute", inset: "160px 0 0 0", touchAction: "none",
                        display: "flex", justifyContent: "space-between", padding: "0 10vw"
                    }}
                >
                    {/* SVG Layer for Lines */}
                    <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", width: "100%", height: "100%", zIndex: 0 }}>
                        {/* Render confirmed connections */}
                        {connections.map((c) => {
                            const p1 = pointsCache[`node-left-${c.fromId}`];
                            const p2 = pointsCache[`node-right-${c.toId}`];
                            if (!p1 || !p2) return null;
                            const isCorrect = c.status === 'correct';
                            return (
                                <line
                                    key={c.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                                    stroke={isCorrect ? "#22c55e" : "#ef4444"}
                                    strokeWidth="4" strokeLinecap="round"
                                    style={{
                                        filter: `drop-shadow(0 0 8px ${isCorrect ? "#22c55e" : "#ef4444"})`,
                                        transition: "all 0.3s ease"
                                    }}
                                />
                            );
                        })}

                        {/* Render dragging line */}
                        {dragging && (
                            <line
                                x1={pointsCache[`node-${dragging.startSide}-${dragging.startId}`]?.x || dragging.x}
                                y1={pointsCache[`node-${dragging.startSide}-${dragging.startId}`]?.y || dragging.y}
                                x2={dragging.x}
                                y2={dragging.y}
                                stroke="#3b82f6"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray="8 8"
                            />
                        )}
                    </svg>

                    {/* Left Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2vh", width: "40%", zIndex: 1, justifyContent: "center" }}>
                        {leftItems.map(item => {
                            const isConnected = connections.find(c => c.fromId === item.id && c.status === "correct");
                            const isWrongTarget = connections.find(c => c.fromId === item.id && c.status === "wrong");
                            return (
                                <div key={item.id} className="match-item transition-all" data-id={item.id} data-side="left"
                                    style={{
                                        background: isConnected ? "rgba(34, 197, 94, 0.2)" : isWrongTarget ? "rgba(239, 68, 68, 0.2)" : "rgba(30, 41, 59, 0.8)",
                                        border: `2px solid ${isConnected ? "#22c55e" : isWrongTarget ? "#ef4444" : "#475569"}`,
                                        padding: "15px", borderRadius: 12, cursor: "pointer", position: "relative",
                                        color: "white", fontWeight: 700, textAlign: "center", backdropFilter: "blur(5px)",
                                        boxShadow: isConnected ? "0 0 15px rgba(34, 197, 94, 0.3)" : isWrongTarget ? "0 0 15px rgba(239, 68, 68, 0.3)" : "none",
                                    }}>
                                    {item.left}
                                    {/* Connection Dot */}
                                    <div id={`node-left-${item.id}`} className="match-node" style={{
                                        position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)",
                                        width: 16, height: 16, borderRadius: "50%", background: isConnected ? "#22c55e" : "#cbd5e1",
                                        border: "3px solid #0f172a"
                                    }} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2vh", width: "40%", zIndex: 1, justifyContent: "center" }}>
                        {rightItems.map(item => {
                            const isConnected = connections.find(c => c.toId === item.id && c.status === "correct");
                            const isWrongTarget = connections.find(c => c.toId === item.id && c.status === "wrong");
                            return (
                                <div key={item.id} className="match-item transition-all" data-id={item.id} data-side="right"
                                    style={{
                                        background: isConnected ? "rgba(34, 197, 94, 0.2)" : isWrongTarget ? "rgba(239, 68, 68, 0.2)" : "rgba(30, 41, 59, 0.8)",
                                        border: `2px solid ${isConnected ? "#22c55e" : isWrongTarget ? "#ef4444" : "#475569"}`,
                                        padding: "15px", borderRadius: 12, cursor: "pointer", position: "relative",
                                        color: "white", fontWeight: 700, textAlign: "center", backdropFilter: "blur(5px)",
                                        boxShadow: isConnected ? "0 0 15px rgba(34, 197, 94, 0.3)" : isWrongTarget ? "0 0 15px rgba(239, 68, 68, 0.3)" : "none"
                                    }}>
                                    {item.right}
                                    {/* Connection Dot */}
                                    <div id={`node-right-${item.id}`} className="match-node" style={{
                                        position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)",
                                        width: 16, height: 16, borderRadius: "50%", background: isConnected ? "#22c55e" : "#cbd5e1",
                                        border: "3px solid #0f172a"
                                    }} />
                                </div>
                            );
                        })}
                    </div>

                </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <div style={{
                    position: "absolute", inset: 0, zIndex: 30, background: "rgba(15, 23, 42, 0.9)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                }}>
                    <h1 style={{ color: "#22c55e", fontSize: 48, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>MISI SELESAI!</h1>
                    <div style={{ color: "white", fontSize: 24, marginBottom: 32 }}>Total XP: <span style={{ color: "#22c55e", fontWeight: 800 }}>+{score}</span></div>

                    <button
                        onClick={() => { setScore(0); setCurrentRound(0); setGameOver(false); }}
                        style={{
                            background: "white", color: "#0f172a", border: "none", padding: "16px 40px",
                            borderRadius: 99, fontSize: 16, fontWeight: 800, cursor: "pointer", marginBottom: 16
                        }}
                    >
                        MAIN LAGI
                    </button>
                    <Link href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Kembali ke Dashboard</Link>
                </div>
            )}
        </div>
    );
}
