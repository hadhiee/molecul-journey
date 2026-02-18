"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { stringToUUID } from "@/lib/ids";
import Link from "next/link";

const VALUES = ["A", "T", "T", "I", "T", "U", "D", "E"];
const VALUE_COLORS = ["#e11d48", "#f59e0b", "#8b5cf6", "#3b82f6", "#22c55e", "#ec4899", "#06b6d4", "#f97316"];
const GROUND_Y_RATIO = 0.8; // Lower ground to give more sky space

const AVATARS = [
    { id: "moklet", name: "Siswa Moklet", body: "#1e1b4b", head: "#ffd4b5", glow: "#e11d48", trail: "#e11d48", emoji: "👦" },
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
        logicalWidth: 600, // Default fallback
        logicalHeight: 400, // Default fallback
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


        // groundY is set by resizeCanvas, do not overwrite with wrong logic
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
                mission_id: stringToUUID("RUNNER"),
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
            if (canvas) {
                const dpr = window.devicePixelRatio || 1;
                // Force full window size for maximum visibility
                const displayW = window.innerWidth;
                const displayH = window.innerHeight;

                canvas.width = displayW * dpr;
                canvas.height = displayH * dpr;

                canvas.style.width = `${displayW}px`;
                canvas.style.height = `${displayH}px`;

                // Scale logic: Keep game logic 1:1 but zoom out slightly on small screens
                // We'll use a base scale derived from width
                const baseScale = Math.min(1, displayW / 600); // Scale down if width < 600

                ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
                ctx.scale(dpr * baseScale, dpr * baseScale);

                // Adjust ground Y based on logical height (displayH / baseScale)
                const logicalH = displayH / baseScale;
                const logicalW = displayW / baseScale;
                gameRef.current.groundY = logicalH * GROUND_Y_RATIO;
                gameRef.current.logicalWidth = logicalW;
                gameRef.current.logicalHeight = logicalH;
            }
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        let rafId: number;

        const gameLoop = () => {
            const g = gameRef.current;
            // Logical Dimensions (Scaled)
            const W = g.logicalWidth;
            const H = g.logicalHeight;
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

            // Uniform Details (ONLY for Moklet Student)
            if (avatar.id === "moklet") {
                // White Shirt (Seragam)
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(-8, -bh / 2 + 10);
                ctx.lineTo(8, -bh / 2 + 10);
                ctx.lineTo(0, -bh / 2 + 28);
                ctx.fill();

                // Red Tie (Dasi)
                ctx.fillStyle = "#e11d48";
                ctx.beginPath();
                ctx.moveTo(-2.5, -bh / 2 + 10);
                ctx.lineTo(2.5, -bh / 2 + 10);
                ctx.lineTo(2.5, -bh / 2 + 22);
                ctx.lineTo(0, -bh / 2 + 26);
                ctx.lineTo(-2.5, -bh / 2 + 22);
                ctx.fill();

                // Blazer Lapels
                ctx.strokeStyle = "rgba(255,255,255,0.1)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-8, -bh / 2 + 10);
                ctx.lineTo(-4, -bh / 2 + 22);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(8, -bh / 2 + 10);
                ctx.lineTo(4, -bh / 2 + 22);
                ctx.stroke();
            }

            // Head
            ctx.beginPath();
            ctx.arc(0, -bh / 2 + 8, 11, 0, Math.PI * 2);
            ctx.fillStyle = avatar.head;
            ctx.fill();

            // Topi SMA (School Hat)
            if (avatar.id === "moklet") {
                ctx.fillStyle = "#64748b"; // Gray Top
                ctx.beginPath();
                ctx.moveTo(-11, -bh / 2 + 2);
                ctx.quadraticCurveTo(0, -bh / 2 - 12, 11, -bh / 2 + 2);
                ctx.fill();

                ctx.fillStyle = "white"; // White Front
                ctx.beginPath();
                ctx.rect(-11, -bh / 2 + 2, 22, 6);
                ctx.fill();

                ctx.fillStyle = "#475569"; // Visor
                ctx.beginPath();
                ctx.roundRect(8, -bh / 2 + 4, 8, 4, 2);
                ctx.fill();
            }

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
                ctx.strokeStyle = avatar.id === "moklet" ? "#1e1b4b" : avatar.body;
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
        <div style={{ height: '100svh', width: '100vw', background: '#0f0f1e', position: 'relative', overflow: 'hidden' }}>

            {/* Canvas (Full Screen Background) */}
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onTouchStart={(e) => { e.preventDefault(); handleCanvasClick(); }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', touchAction: 'none', zIndex: 0 }}
            />

            {/* Top Bar (Overlay) */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(15,15,30,0.9), transparent)', zIndex: 20 }}>
                <Link href="/" style={{ fontSize: 12, fontWeight: 700, color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                    <span style={{ fontSize: 14 }}>←</span> Keluar
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
                    <span style={{ fontSize: 14 }}>🏆</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#f59e0b' }}>{highScore}</span>
                </div>
            </div>

            {/* Menu Overlay */}
            {gameState === "menu" && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 30,
                    background: 'rgba(5,5,16,0.85)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    padding: 24,
                }}>
                    <div style={{ transform: 'scale(1.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 80, height: 80, background: `linear-gradient(135deg, ${currentAvatar.body}, ${currentAvatar.trail})`, borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, boxShadow: `0 0 40px ${currentAvatar.glow}66`, marginBottom: 24 }}>
                            {currentAvatar.emoji}
                        </div>

                        <h2 style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 8, textAlign: 'center' }}>MOKLET RUNNER</h2>

                        {/* Avatar Selector */}
                        <div style={{ width: '100vw', maxWidth: 400, margin: '24px 0' }}>
                            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '10px 20px', justifyContent: 'flex-start', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                                <div style={{ width: 10 }} /> {/* Spacer */}
                                {AVATARS.map((av, i) => (
                                    <div
                                        key={av.id}
                                        onClick={(e) => { e.stopPropagation(); setSelectedAvatar(i); }}
                                        style={{
                                            flexShrink: 0,
                                            width: 60, height: 70,
                                            borderRadius: 16,
                                            background: selectedAvatar === i ? `${av.body}44` : 'rgba(255,255,255,0.05)',
                                            border: selectedAvatar === i ? `2px solid ${av.body}` : '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            transform: selectedAvatar === i ? 'scale(1.1)' : 'scale(1)',
                                            boxShadow: selectedAvatar === i ? `0 10px 25px -5px ${av.glow}66` : 'none',
                                        }}
                                    >
                                        <span style={{ fontSize: 24, marginBottom: 2 }}>{av.emoji}</span>
                                    </div>
                                ))}
                                <div style={{ width: 10 }} />
                            </div>
                            <div style={{ textAlign: 'center', color: 'white', fontWeight: 700, fontSize: 14, marginTop: 8 }}>{currentAvatar.name}</div>
                        </div>

                        <div
                            onClick={(e) => { e.stopPropagation(); startGame(); }}
                            style={{
                                background: 'white',
                                color: '#0f0f1e',
                                padding: '16px 56px', borderRadius: 99,
                                fontSize: 18, fontWeight: 900,
                                letterSpacing: '1px', cursor: 'pointer',
                                boxShadow: '0 0 30px rgba(255,255,255,0.3)',
                                display: 'flex', alignItems: 'center', gap: 8
                            }}
                        >
                            MAIN SEKARANG
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over Overlay */}
            {gameState === "over" && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 30,
                    background: 'rgba(15,15,30,0.95)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(5px)',
                    padding: 24
                }}>
                    <div style={{ fontSize: 64, marginBottom: 16, animation: 'bounce 1s infinite' }}>💥</div>
                    <h2 style={{ fontSize: 40, fontWeight: 900, color: 'white', marginBottom: 8 }}>Game Over!</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, margin: '32px 0' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>SKOR</div>
                            <div style={{ fontSize: 40, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{score}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>HURUF</div>
                            <div style={{ fontSize: 40, fontWeight: 900, color: '#3b82f6', lineHeight: 1 }}>{collected}</div>
                        </div>
                    </div>

                    <div
                        onClick={(e) => { e.stopPropagation(); startGame(); }}
                        style={{
                            background: '#e11d48',
                            color: 'white',
                            padding: '16px 48px', borderRadius: 99,
                            fontSize: 16, fontWeight: 900,
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(225,29,72,0.4)',
                        }}
                    >
                        COBA LAGI
                    </div>
                </div>
            )}

            {/* Bottom Controls (Overlay) */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '24px',
                background: 'linear-gradient(to top, rgba(15,15,30,0.8), transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                zIndex: 20,
                pointerEvents: 'none'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.7 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.2)' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'white', fontWeight: 600, textShadow: '0 1px 2px black' }}>Tap Lompat</span>
                </div>
            </div>
        </div>
    );

}
