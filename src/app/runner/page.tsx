"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const VALUES = ["A", "T", "T", "I", "T", "U", "D", "E"];
const VALUE_COLORS = ["#e11d48", "#f59e0b", "#8b5cf6", "#3b82f6", "#22c55e", "#ec4899", "#06b6d4", "#f97316"];
const GROUND_Y = 0.75;

const AVATARS = [
    { id: "ninja", name: "Ninja", body: "#8b5cf6", head: "#c4b5fd", glow: "#8b5cf6", trail: "#6366f1", emoji: "🥷" },
    { id: "fire", name: "Api", body: "#ef4444", head: "#fca5a5", glow: "#ef4444", trail: "#f97316", emoji: "🔥" },
    { id: "ice", name: "Es", body: "#06b6d4", head: "#a5f3fc", glow: "#06b6d4", trail: "#22d3ee", emoji: "❄️" },
    { id: "gold", name: "Emas", body: "#f59e0b", head: "#fde68a", glow: "#f59e0b", trail: "#eab308", emoji: "⭐" },
    { id: "toxic", name: "Toxic", body: "#22c55e", head: "#bbf7d0", glow: "#22c55e", trail: "#4ade80", emoji: "☢️" },
    { id: "pink", name: "Sakura", body: "#ec4899", head: "#fbcfe8", glow: "#ec4899", trail: "#f472b6", emoji: "🌸" },
];

interface Particle {
    x: number; y: number; vx: number; vy: number; life: number; color: string; size: number;
}

export default function MokletRunner() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<"menu" | "playing" | "over">("menu");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [collected, setCollected] = useState(0);
    const [selectedAvatar, setSelectedAvatar] = useState(0);

    const gameRef = useRef({
        running: false,
        player: { x: 80, y: 0, vy: 0, jumping: false, doubleJump: false, width: 32, height: 40, rotation: 0 },
        obstacles: [] as { x: number; width: number; height: number; type: string }[],
        coins: [] as { x: number; y: number; value: string; color: string; collected: boolean; scale: number }[],
        particles: [] as Particle[],
        bgStars: [] as { x: number; y: number; size: number; speed: number; alpha: number }[],
        // 3 parallax building layers: far (slow), mid, near (fast)
        buildingsFar: [] as { x: number; w: number; h: number; windows: boolean[][]; hasAntenna: boolean; antennaH: number }[],
        buildingsMid: [] as { x: number; w: number; h: number; windows: boolean[][]; hasAntenna: boolean; antennaH: number }[],
        buildingsNear: [] as { x: number; w: number; h: number; windows: boolean[][]; hasAntenna: boolean; antennaH: number }[],
        speed: 4,
        distance: 0,
        score: 0,
        collected: 0,
        groundY: 0,
        frameCount: 0,
        lastObstacle: 0,
        lastCoin: 0,
        avatarIndex: 0,
    });

    useEffect(() => {
        if (status === "unauthenticated") router.push("/auth/signin");
    }, [status, router]);

    // Helper to generate a row of buildings
    const generateBuildings = (count: number, maxW: number, minH: number, maxH: number) => {
        const buildings = [];
        let x = 0;
        for (let i = 0; i < count; i++) {
            const w = 20 + Math.random() * maxW;
            const h = minH + Math.random() * (maxH - minH);
            const cols = Math.floor(w / 8);
            const rows = Math.floor(h / 10);
            const windows: boolean[][] = [];
            for (let r = 0; r < rows; r++) {
                const row: boolean[] = [];
                for (let c = 0; c < cols; c++) row.push(Math.random() > 0.4);
                windows.push(row);
            }
            buildings.push({ x, w, h, windows, hasAntenna: Math.random() > 0.6, antennaH: 8 + Math.random() * 16 });
            x += w + 2 + Math.random() * 6;
        }
        return buildings;
    };

    useEffect(() => {
        const stars = [];
        for (let i = 0; i < 60; i++) {
            stars.push({
                x: Math.random() * 1000,
                y: Math.random() * 600,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                alpha: Math.random() * 0.6 + 0.2,
            });
        }
        gameRef.current.bgStars = stars;
        gameRef.current.buildingsFar = generateBuildings(25, 30, 40, 120);
        gameRef.current.buildingsMid = generateBuildings(20, 40, 50, 140);
        gameRef.current.buildingsNear = generateBuildings(18, 35, 30, 80);
    }, []);

    const jump = useCallback(() => {
        const g = gameRef.current;
        if (!g.running) return;
        const avatar = AVATARS[g.avatarIndex];
        if (!g.player.jumping) {
            g.player.vy = -11;
            g.player.jumping = true;
            g.player.doubleJump = false;
        } else if (!g.player.doubleJump) {
            g.player.vy = -9;
            g.player.doubleJump = true;
            for (let i = 0; i < 6; i++) {
                g.particles.push({
                    x: g.player.x + g.player.width / 2,
                    y: g.player.y + g.player.height,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 2 + 1,
                    life: 20, color: avatar.glow, size: 3,
                });
            }
        }
    }, []);

    const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
        const g = gameRef.current;
        for (let i = 0; i < count; i++) {
            g.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30 + Math.random() * 20,
                color,
                size: 2 + Math.random() * 3,
            });
        }
    }, []);

    const startGame = useCallback(() => {
        const g = gameRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        g.groundY = canvas.height * GROUND_Y;
        g.player = { x: 80, y: g.groundY - 40, vy: 0, jumping: false, doubleJump: false, width: 32, height: 40, rotation: 0 };
        g.obstacles = [];
        g.coins = [];
        g.particles = [];
        g.speed = 4;
        g.distance = 0;
        g.score = 0;
        g.collected = 0;
        g.frameCount = 0;
        g.lastObstacle = 0;
        g.lastCoin = 0;
        g.avatarIndex = selectedAvatar;
        g.running = true;

        setGameState("playing");
        setScore(0);
        setCollected(0);
    }, [selectedAvatar]);

    const endGame = useCallback(async () => {
        const g = gameRef.current;
        g.running = false;
        const finalScore = g.score;
        setScore(finalScore);
        setGameState("over");

        if (finalScore > highScore) setHighScore(finalScore);

        if (session?.user?.email && finalScore > 0) {
            await supabase.from("user_progress").insert({
                user_email: session.user.email,
                mission_id: null,
                score: finalScore,
                choice_label: "RUNNER"
            });
        }
    }, [highScore, session]);

    // Game loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = Math.min(parent.clientWidth, 600);
                canvas.height = Math.min(window.innerHeight - 200, 400);
                gameRef.current.groundY = canvas.height * GROUND_Y;
            }
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        let rafId: number;

        const gameLoop = () => {
            const g = gameRef.current;
            const W = canvas.width;
            const H = canvas.height;
            const avatar = AVATARS[g.avatarIndex] || AVATARS[0];

            // === BACKGROUND: Night Sky ===
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, "#050510");
            grad.addColorStop(0.3, "#0a0a20");
            grad.addColorStop(0.6, "#12102e");
            grad.addColorStop(1, "#1a1040");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Moon
            ctx.save();
            ctx.beginPath();
            ctx.arc(W - 60, 50, 22, 0, Math.PI * 2);
            ctx.fillStyle = "#fef9c3";
            ctx.shadowColor = "#fef9c3";
            ctx.shadowBlur = 40;
            ctx.fill();
            ctx.restore();

            // Stars
            g.bgStars.forEach(s => {
                if (g.running) s.x -= s.speed;
                if (s.x < 0) { s.x = W; s.y = Math.random() * H * 0.4; }
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.alpha * (0.6 + Math.sin(g.frameCount * 0.02 + s.x) * 0.4)})`;
                ctx.fill();
            });

            // === DRAW BUILDING LAYERS ===
            const drawBuildingLayer = (
                buildings: typeof g.buildingsFar,
                scrollSpeed: number,
                bodyColor: string,
                edgeColor: string,
                windowOnColor: string,
                windowOffColor: string,
                opacity: number,
                yOffset: number
            ) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                const totalW = buildings.reduce((sum, b) => sum + b.w + 6, 0);
                const scrollX = g.running ? (g.frameCount * scrollSpeed) % totalW : 0;

                buildings.forEach(b => {
                    const bx = b.x - scrollX;
                    // Wrap around
                    let drawX = bx % totalW;
                    if (drawX < -b.w - 10) drawX += totalW;
                    if (drawX > W + 10) { return; }

                    const by = g.groundY - b.h + yOffset;

                    // Building body
                    ctx.fillStyle = bodyColor;
                    ctx.fillRect(drawX, by, b.w, b.h - yOffset);

                    // Building edge/outline
                    ctx.strokeStyle = edgeColor;
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(drawX, by, b.w, b.h - yOffset);

                    // Antenna
                    if (b.hasAntenna) {
                        ctx.strokeStyle = edgeColor;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(drawX + b.w / 2, by);
                        ctx.lineTo(drawX + b.w / 2, by - b.antennaH);
                        ctx.stroke();
                        // Antenna light (blinks)
                        if (Math.sin(g.frameCount * 0.05 + b.x) > 0) {
                            ctx.beginPath();
                            ctx.arc(drawX + b.w / 2, by - b.antennaH, 2, 0, Math.PI * 2);
                            ctx.fillStyle = "#ef4444";
                            ctx.fill();
                        }
                    }

                    // Windows
                    const winW = 4, winH = 5, padX = 4, padY = 5;
                    const startX = drawX + padX;
                    const startY = by + padY + 3;
                    b.windows.forEach((row, ri) => {
                        row.forEach((lit, ci) => {
                            const wx = startX + ci * (winW + 3);
                            const wy = startY + ri * (winH + padY);
                            if (wx > drawX && wx + winW < drawX + b.w && wy > by && wy + winH < g.groundY) {
                                ctx.fillStyle = lit ? windowOnColor : windowOffColor;
                                ctx.fillRect(wx, wy, winW, winH);
                            }
                        });
                    });
                });
                ctx.restore();
            };

            // Far layer - large buildings, slow scroll, dim
            drawBuildingLayer(g.buildingsFar, g.speed * 0.15, "#0d0d1a", "#1a1a3322", "#f59e0b22", "#0a0a1500", 0.5, 0);
            // Mid layer - medium buildings, medium scroll
            drawBuildingLayer(g.buildingsMid, g.speed * 0.35, "#111128", "#2a2a5533", "#f59e0b44", "#0f0f2000", 0.7, 10);
            // Near layer - shorter buildings, fast scroll, bright
            drawBuildingLayer(g.buildingsNear, g.speed * 0.6, "#161638", "#3333aa33", "#fbbf2488", "#12122200", 0.85, 20);

            // === Neon horizon glow ===
            const horizonGlow = ctx.createLinearGradient(0, g.groundY - 20, 0, g.groundY);
            horizonGlow.addColorStop(0, "transparent");
            horizonGlow.addColorStop(1, `${avatar.glow}15`);
            ctx.fillStyle = horizonGlow;
            ctx.fillRect(0, g.groundY - 20, W, 20);

            // Ground surface
            ctx.fillStyle = "#0c0c1e";
            ctx.fillRect(0, g.groundY, W, H - g.groundY);

            // Road lines
            ctx.strokeStyle = avatar.glow;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, g.groundY);
            ctx.lineTo(W, g.groundY);
            ctx.stroke();

            // Road grid
            ctx.strokeStyle = `${avatar.glow}18`;
            ctx.lineWidth = 1;
            const gridOffset = g.running ? (g.frameCount * g.speed) % 40 : 0;
            for (let gx = -gridOffset; gx < W; gx += 40) {
                ctx.beginPath();
                ctx.moveTo(gx, g.groundY);
                ctx.lineTo(gx, H);
                ctx.stroke();
            }
            // Horizontal road line
            ctx.strokeStyle = `${avatar.glow}12`;
            ctx.beginPath();
            ctx.moveTo(0, g.groundY + (H - g.groundY) / 2);
            ctx.lineTo(W, g.groundY + (H - g.groundY) / 2);
            ctx.stroke();

            if (!g.running) {
                rafId = requestAnimationFrame(gameLoop);
                return;
            }

            g.frameCount++;
            g.distance += g.speed;
            g.speed = 4 + Math.floor(g.distance / 500) * 0.3;
            g.score = Math.floor(g.distance / 10) + g.collected * 50;
            setScore(g.score);

            // === SPAWN OBSTACLES ===
            if (g.frameCount - g.lastObstacle > 80 + Math.random() * 60) {
                const type = Math.random() > 0.5 ? "spike" : "block";
                const h = type === "spike" ? 24 + Math.random() * 16 : 28 + Math.random() * 20;
                g.obstacles.push({ x: W + 20, width: type === "spike" ? 16 : 24 + Math.random() * 12, height: h, type });
                g.lastObstacle = g.frameCount;
            }

            // === SPAWN COINS ===
            if (g.frameCount - g.lastCoin > 60 + Math.random() * 50) {
                const vi = Math.floor(Math.random() * VALUES.length);
                g.coins.push({
                    x: W + 20,
                    y: g.groundY - 60 - Math.random() * 80,
                    value: VALUES[vi],
                    color: VALUE_COLORS[vi],
                    collected: false,
                    scale: 1,
                });
                g.lastCoin = g.frameCount;
            }

            // === UPDATE PLAYER ===
            g.player.vy += 0.55;
            g.player.y += g.player.vy;
            if (g.player.y >= g.groundY - g.player.height) {
                g.player.y = g.groundY - g.player.height;
                g.player.vy = 0;
                g.player.jumping = false;
                g.player.doubleJump = false;
            }
            g.player.rotation = g.player.jumping ? Math.sin(g.frameCount * 0.15) * 0.15 : 0;

            // Trail particles
            if (g.frameCount % 3 === 0) {
                g.particles.push({
                    x: g.player.x,
                    y: g.player.y + g.player.height - 2,
                    vx: -Math.random() * 2,
                    vy: -Math.random() * 0.5,
                    life: 12, color: avatar.trail, size: 2,
                });
            }

            // === DRAW OBSTACLES ===
            g.obstacles = g.obstacles.filter(o => o.x > -50);
            g.obstacles.forEach(o => {
                o.x -= g.speed;
                ctx.save();
                if (o.type === "spike") {
                    ctx.fillStyle = "#ef4444";
                    ctx.beginPath();
                    ctx.moveTo(o.x, g.groundY);
                    ctx.lineTo(o.x + o.width / 2, g.groundY - o.height);
                    ctx.lineTo(o.x + o.width, g.groundY);
                    ctx.closePath();
                    ctx.shadowColor = "#ef4444";
                    ctx.shadowBlur = 8;
                    ctx.fill();
                } else {
                    ctx.fillStyle = "#ef444444";
                    ctx.fillRect(o.x, g.groundY - o.height, o.width, o.height);
                    ctx.strokeStyle = "#ef4444";
                    ctx.lineWidth = 2;
                    ctx.shadowColor = "#ef4444";
                    ctx.shadowBlur = 10;
                    ctx.strokeRect(o.x, g.groundY - o.height, o.width, o.height);
                }
                ctx.restore();

                // Collision
                const px = g.player.x, py = g.player.y, pw = g.player.width, ph = g.player.height;
                const margin = 6;
                if (px + pw - margin > o.x && px + margin < o.x + o.width &&
                    py + ph - margin > g.groundY - o.height) {
                    endGame();
                }
            });

            // === DRAW COINS ===
            g.coins = g.coins.filter(c => c.x > -30 && !c.collected);
            g.coins.forEach(c => {
                c.x -= g.speed;
                const bob = Math.sin(g.frameCount * 0.08 + c.x * 0.01) * 4;

                ctx.beginPath();
                ctx.arc(c.x + 10, c.y + bob + 10, 16, 0, Math.PI * 2);
                ctx.fillStyle = c.color + "22";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(c.x + 10, c.y + bob + 10, 12, 0, Math.PI * 2);
                ctx.fillStyle = c.color + "33";
                ctx.fill();
                ctx.strokeStyle = c.color;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = c.color;
                ctx.font = "bold 12px 'Courier New', monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(c.value, c.x + 10, c.y + bob + 10);

                const dx = (g.player.x + g.player.width / 2) - (c.x + 10);
                const dy = (g.player.y + g.player.height / 2) - (c.y + bob + 10);
                if (Math.sqrt(dx * dx + dy * dy) < 24) {
                    c.collected = true;
                    g.collected++;
                    setCollected(g.collected);
                    spawnParticles(c.x + 10, c.y + bob + 10, c.color, 10);
                }
            });

            // === DRAW PLAYER (with avatar colors) ===
            ctx.save();
            ctx.translate(g.player.x + g.player.width / 2, g.player.y + g.player.height / 2);
            ctx.rotate(g.player.rotation);

            ctx.shadowColor = avatar.glow;
            ctx.shadowBlur = 14;

            // Body
            ctx.fillStyle = avatar.body;
            const bw = g.player.width, bh = g.player.height;
            ctx.beginPath();
            ctx.roundRect(-bw / 2, -bh / 2 + 10, bw, bh - 10, 6);
            ctx.fill();

            // Head
            ctx.beginPath();
            ctx.arc(0, -bh / 2 + 8, 11, 0, Math.PI * 2);
            ctx.fillStyle = avatar.head;
            ctx.fill();

            // Eyes
            ctx.shadowBlur = 0;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(-3, -bh / 2 + 6, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(5, -bh / 2 + 6, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#1e1b4b";
            ctx.beginPath();
            ctx.arc(-2, -bh / 2 + 6, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(6, -bh / 2 + 6, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Smile
            ctx.strokeStyle = "#1e1b4b";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(1, -bh / 2 + 10, 4, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();

            // Running legs animation
            if (!g.player.jumping) {
                const legAnim = Math.sin(g.frameCount * 0.3) * 6;
                ctx.strokeStyle = avatar.body;
                ctx.lineWidth = 4;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(-5, bh / 2 - 2);
                ctx.lineTo(-5 + legAnim, bh / 2 + 8);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(5, bh / 2 - 2);
                ctx.lineTo(5 - legAnim, bh / 2 + 8);
                ctx.stroke();
            }

            ctx.restore();

            // === PARTICLES (FIXED: clamp radius to Math.max(0.1, ...)) ===
            g.particles = g.particles.filter(p => p.life > 0);
            g.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                const alpha = Math.max(0, p.life / 40);
                const radius = Math.max(0.1, p.size * alpha);
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                const hexAlpha = Math.floor(Math.min(1, Math.max(0, alpha)) * 255).toString(16).padStart(2, '0');
                ctx.fillStyle = p.color + hexAlpha;
                ctx.fill();
            });

            // === HUD ===
            ctx.fillStyle = "white";
            ctx.font = "bold 14px 'Courier New', monospace";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(`${g.score}`, 16, 16);
            ctx.fillStyle = "#e11d48";
            ctx.font = "bold 9px sans-serif";
            ctx.fillText("XP", 16 + ctx.measureText(`${g.score}`).width + 4, 18);

            ctx.fillStyle = "#f59e0b";
            ctx.font = "bold 12px 'Courier New', monospace";
            ctx.textAlign = "right";
            ctx.fillText(`✦ ${g.collected}`, W - 16, 16);

            ctx.fillStyle = `${avatar.glow}44`;
            ctx.fillRect(16, H - 16, (g.speed / 10) * (W - 32), 4);
            ctx.fillStyle = avatar.glow;
            ctx.fillRect(16, H - 16, Math.min((g.speed / 10) * (W - 32), W - 32), 4);

            rafId = requestAnimationFrame(gameLoop);
        };

        rafId = requestAnimationFrame(gameLoop);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [endGame, spawnParticles]);

    // Input handlers
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.code === "ArrowUp") {
                e.preventDefault();
                if (gameState === "menu" || gameState === "over") startGame();
                else jump();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [gameState, jump, startGame]);

    const handleCanvasClick = () => {
        if (gameState === "menu" || gameState === "over") startGame();
        else jump();
    };

    if (status === "loading") return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1e', color: '#64748b' }}>
            Memuat...
        </div>
    );

    const currentAvatar = AVATARS[selectedAvatar];

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f1e', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '24px 16px' }}>
            {/* Top Bar */}
            <div style={{ width: '100%', maxWidth: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Link href="/" style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                    ← Keluar
                </Link>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>
                    🏃 Moklet Runner
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>
                    🏆 {highScore}
                </div>
            </div>

            {/* Canvas Container */}
            <div style={{ width: '100%', maxWidth: 600, position: 'relative', borderRadius: 20, overflow: 'hidden', border: `1px solid ${currentAvatar.glow}44`, boxShadow: `0 8px 32px ${currentAvatar.glow}22` }}>
                <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onTouchStart={(e) => { e.preventDefault(); handleCanvasClick(); }}
                    style={{ display: 'block', width: '100%', cursor: 'pointer', touchAction: 'none' }}
                />

                {/* Menu Overlay */}
                {gameState === "menu" && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(15,15,30,0.9)',
                        display: 'flex', flexDirection: 'column' as const,
                        alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(6px)',
                        padding: 20,
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>🏃</div>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 4 }}>Moklet Runner</h2>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16, textAlign: 'center' as const, lineHeight: 1.5 }}>
                            Kumpulkan huruf ATTITUDE! Tap / Space untuk lompat
                        </p>

                        {/* Avatar Selector */}
                        <div style={{ fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 8 }}>
                            Pilih Avatar
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
                            {AVATARS.map((av, i) => (
                                <div
                                    key={av.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedAvatar(i); }}
                                    style={{
                                        width: 48, height: 56, borderRadius: 12,
                                        background: selectedAvatar === i ? `${av.body}33` : 'rgba(255,255,255,0.04)',
                                        border: selectedAvatar === i ? `2px solid ${av.body}` : '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: selectedAvatar === i ? `0 0 16px ${av.glow}44` : 'none',
                                    }}
                                >
                                    <span style={{ fontSize: 18 }}>{av.emoji}</span>
                                    <span style={{ fontSize: 7, fontWeight: 800, color: selectedAvatar === i ? av.body : '#64748b', marginTop: 2 }}>{av.name}</span>
                                </div>
                            ))}
                        </div>

                        <div
                            onClick={(e) => { e.stopPropagation(); startGame(); }}
                            style={{
                                background: `linear-gradient(135deg, ${currentAvatar.body}, ${currentAvatar.trail})`,
                                color: 'white', padding: '12px 28px', borderRadius: 14,
                                fontSize: 13, fontWeight: 800, textTransform: 'uppercase' as const,
                                letterSpacing: '0.15em', cursor: 'pointer',
                                boxShadow: `0 8px 20px ${currentAvatar.glow}55`,
                            }}
                        >
                            🚀 MULAI
                        </div>
                    </div>
                )}

                {/* Game Over Overlay */}
                {gameState === "over" && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(15,15,30,0.92)',
                        display: 'flex', flexDirection: 'column' as const,
                        alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>💥</div>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 4 }}>Game Over!</h2>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16, marginTop: 12 }}>
                            <div style={{ textAlign: 'center' as const }}>
                                <div style={{ fontSize: 24, fontWeight: 900, color: 'white', fontFamily: "'Courier New', monospace" }}>{score}</div>
                                <div style={{ fontSize: 9, color: '#e11d48', fontWeight: 700 }}>XP</div>
                            </div>
                            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                            <div style={{ textAlign: 'center' as const }}>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#f59e0b', fontFamily: "'Courier New', monospace" }}>{collected}</div>
                                <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>ITEMS</div>
                            </div>
                        </div>
                        {score >= highScore && score > 0 && (
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                                🏆 Rekor Baru!
                            </div>
                        )}
                        <div
                            onClick={(e) => { e.stopPropagation(); startGame(); }}
                            style={{
                                background: `linear-gradient(135deg, ${currentAvatar.body}, ${currentAvatar.trail})`,
                                color: 'white', padding: '12px 28px', borderRadius: 14,
                                fontSize: 12, fontWeight: 800, textTransform: 'uppercase' as const,
                                letterSpacing: '0.15em', cursor: 'pointer',
                                boxShadow: `0 8px 20px ${currentAvatar.glow}55`,
                            }}
                        >
                            🔄 MAIN LAGI
                        </div>
                    </div>
                )}
            </div>

            {/* Controls + Avatar info */}
            <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' as const }}>
                <div style={{ background: `${currentAvatar.body}15`, border: `1px solid ${currentAvatar.body}33`, borderRadius: 10, padding: '8px 14px', fontSize: 10, color: currentAvatar.body, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {currentAvatar.emoji} {currentAvatar.name}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                    ⌨️ Space = Lompat
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                    ✌️ 2x = Double Jump
                </div>
            </div>

            {/* ATTITUDE letters */}
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' as const, justifyContent: 'center', maxWidth: 400 }}>
                {VALUES.map((v, i) => (
                    <span key={i} style={{
                        fontSize: 10, fontWeight: 800, color: VALUE_COLORS[i],
                        background: VALUE_COLORS[i] + '15',
                        border: `1px solid ${VALUE_COLORS[i]}33`,
                        padding: '3px 8px', borderRadius: 6,
                    }}>
                        {v}
                    </span>
                ))}
                <span style={{ fontSize: 10, color: '#64748b', alignSelf: 'center', fontWeight: 600 }}>= +50 XP</span>
            </div>
        </div>
    );
}
