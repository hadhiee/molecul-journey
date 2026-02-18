"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Link from "next/link";

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

interface HitPopup {
    id: number;
    text: string;
    x: number;
    y: number;
}

export default function Fighter3DGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [gameState, setGameState] = useState<"AVATAR" | "PLAYING" | "RESULT">("AVATAR");
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [playerHp, setPlayerHp] = useState(100);
    const [enemyHp, setEnemyHp] = useState(100);
    const [playerScore, setPlayerScore] = useState(0);
    const [winner, setWinner] = useState<"PLAYER" | "ENEMY" | null>(null);
    const [hitPopups, setHitPopups] = useState<HitPopup[]>([]);
    const popupIdCounter = useRef(0);

    useEffect(() => {
        if (!containerRef.current || gameState !== "PLAYING") return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f);
        scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 4, 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.target.set(0, 2, 0);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 2);
        spotLight.position.set(0, 15, 5);
        spotLight.angle = Math.PI / 4;
        spotLight.castShadow = true;
        scene.add(spotLight);

        const enemyLight = new THREE.PointLight(0xffffff, 1, 15);
        enemyLight.position.set(0, 5, -5);
        scene.add(enemyLight);

        // Arena
        const ringGeo = new THREE.CylinderGeometry(8, 8, 1, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = -0.5;
        ring.receiveShadow = true;
        scene.add(ring);

        // Character Creation Utility
        const createFighter = (color: number, isEnemy = false) => {
            const group = new THREE.Group();
            const bodyGeo = new THREE.CapsuleGeometry(0.6, 1, 4, 8);
            const bodyMat = new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: isEnemy ? 0.5 : 0.2
            });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 1.2;
            body.castShadow = true;
            group.add(body);

            const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
            const head = new THREE.Mesh(headGeo, bodyMat);
            head.position.y = 2.4;
            group.add(head);

            const armGeo = new THREE.BoxGeometry(0.3, 0.3, 1.2);
            const leftArm = new THREE.Mesh(armGeo, bodyMat);
            leftArm.position.set(-0.8, 1.8, 0.5);
            group.add(leftArm);

            const rightArm = new THREE.Mesh(armGeo, bodyMat);
            rightArm.position.set(0.8, 1.8, 0.5);
            group.add(rightArm);

            return { group, leftArm, rightArm };
        };

        const player = createFighter(selectedAvatar.color);
        player.group.position.set(0, 0, 3);
        scene.add(player.group);

        const enemyData = ANTI_HEROES[Math.floor(Math.random() * ANTI_HEROES.length)];
        const enemy = createFighter(enemyData.color, true);
        enemy.group.position.set(0, 0, -3.5);
        enemy.group.rotation.y = Math.PI;
        scene.add(enemy.group);

        // Battle Logic
        let isAttacking = false;
        let enemyAttackCooldown = 0;

        const spawnHitPopup = () => {
            const text = ATTITUDE_VALUES[Math.floor(Math.random() * ATTITUDE_VALUES.length)];
            const id = popupIdCounter.current++;
            const x = 50 + (Math.random() * 20 - 10);
            const y = 40 + (Math.random() * 20 - 10);
            setHitPopups(prev => [...prev, { id, text, x, y }]);
            setTimeout(() => {
                setHitPopups(prev => prev.filter(p => p.id !== id));
            }, 1000);
        };

        const punch = (fighterArms: any, isPlayer: boolean) => {
            if (isPlayer && isAttacking) return;
            if (isPlayer) isAttacking = true;

            const arm = Math.random() > 0.5 ? fighterArms.leftArm : fighterArms.rightArm;
            arm.userData.punching = true;

            if (isPlayer) {
                spawnHitPopup();
                setEnemyHp(hp => {
                    const newHp = Math.max(0, hp - (selectedAvatar.power / 10));
                    if (newHp === 0 && gameState === "PLAYING") {
                        setWinner("PLAYER");
                        setGameState("RESULT");
                    }
                    return newHp;
                });
                setPlayerScore(s => s + 100);
            } else {
                setPlayerHp(hp => {
                    const newHp = Math.max(0, hp - 8);
                    if (newHp === 0 && gameState === "PLAYING") {
                        setWinner("ENEMY");
                        setGameState("RESULT");
                    }
                    return newHp;
                });
            }

            setTimeout(() => {
                arm.userData.punching = false;
                if (isPlayer) isAttacking = false;
            }, 200);
        };

        const handleInteraction = () => {
            if (gameState === "PLAYING") punch(player, true);
        };

        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', (e) => {
            if (gameState === "PLAYING") {
                e.preventDefault();
                punch(player, true);
            }
        });

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            [player, enemy].forEach(f => {
                [f.leftArm, f.rightArm].forEach(arm => {
                    if (arm.userData.punching) {
                        arm.position.z = THREE.MathUtils.lerp(arm.position.z, 2.5, 0.4);
                    } else {
                        arm.position.z = THREE.MathUtils.lerp(arm.position.z, 0.5, 0.2);
                    }
                });
            });

            if (gameState === "PLAYING") {
                enemyAttackCooldown++;
                if (enemyAttackCooldown > 50) {
                    punch(enemy, false);
                    enemyAttackCooldown = 0;
                }
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            if (containerRef.current) containerRef.current.innerHTML = "";
        };
    }, [gameState]);

    return (
        <div style={{ position: "relative", width: "100svw", height: "100svh", overflow: "hidden", background: "#0a0a0f", fontFamily: "Inter, sans-serif" }}>

            {gameState === "AVATAR" && (
                <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(10,10,15,0.95)", padding: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>3D Combat Training</div>
                    <h2 style={{ fontSize: "clamp(24px, 8vw, 48px)", fontWeight: 900, color: "white", marginBottom: 8, textAlign: "center" }}>ATTITUDE FIGHTER</h2>
                    <p style={{ color: "#94a3b8", marginBottom: 32, textAlign: "center", maxWidth: 400, fontSize: 13 }}>Kalahkan manifestasi buruk dan raih nilai ATTITUDE dalam setiap pukulan!</p>

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
                                <span className="entity-name">TARGET</span>
                            </div>
                            <div className="hp-bar-bg rtl">
                                <div style={{ width: `${enemyHp}%`, height: "100%", background: "linear-gradient(90deg, #e11d48, #9f1239)" }} />
                            </div>
                        </div>
                    </div>

                    {/* Hit Popups */}
                    {hitPopups.map(popup => (
                        <div key={popup.id} className="hit-popup" style={{ left: `${popup.x}%`, top: `${popup.y}%` }}>
                            +ATTITUDE<br />
                            <span style={{ fontSize: "0.6em", color: "white" }}>{popup.text}</span>
                        </div>
                    ))}

                    <div className="combat-instruction">
                        <div className="instruction-badge">
                            Tap Layar untuk Memukul! 🥊
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
                            onClick={() => { setGameState("AVATAR"); setPlayerHp(100); setEnemyHp(100); setPlayerScore(0); }}
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

            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

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
                }
                .hp-block {
                    flex: 1;
                    max-width: 200px;
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
                    color: #10b981;
                    font-weight: 900;
                    font-size: clamp(16px, 5vw, 24px);
                    text-shadow: 0 0 10px rgba(16,185,129,0.8);
                    pointer-events: none;
                    animation: popupFade 1s forwards;
                    z-index: 50;
                    textAlign: center;
                    transform: translate(-50%, -50%);
                }
                .combat-instruction {
                    position: absolute;
                    bottom: 32px;
                    width: 100%;
                    text-align: center;
                    pointer-events: none;
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
                    20% { transform: translate(-50%, -80%) scale(1.1); opacity: 1; }
                    100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
