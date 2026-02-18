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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Brighter ambient
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 2);
        spotLight.position.set(0, 15, 5);
        spotLight.angle = Math.PI / 4;
        spotLight.castShadow = true;
        scene.add(spotLight);

        // Add specific light for the enemy area
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

            // Body - Higher emissive for enemy to make them "glow" and be visible
            const bodyGeo = new THREE.CapsuleGeometry(0.6, 1, 4, 8);
            const bodyMat = new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: isEnemy ? 0.5 : 0.2 // Higher glow for enemy
            });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 1.2;
            body.castShadow = true;
            group.add(body);

            // Head
            const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
            const head = new THREE.Mesh(headGeo, bodyMat);
            head.position.y = 2.4;
            group.add(head);

            // Arms
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
        enemy.group.position.set(0, 0, -3.5); // Slightly further back
        enemy.group.rotation.y = Math.PI;
        scene.add(enemy.group);

        // Battle Logic
        let isAttacking = false;
        let enemyAttackCooldown = 0;

        const spawnHitPopup = () => {
            const text = ATTITUDE_VALUES[Math.floor(Math.random() * ATTITUDE_VALUES.length)];
            const id = popupIdCounter.current++;
            // Random position around the center-top of the screen
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

            // Damage logic
            if (isPlayer) {
                spawnHitPopup(); // Show attitude value on hit
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

        const handleInteraction = (e: MouseEvent) => {
            if (gameState === "PLAYING") punch(player, true);
        };

        window.addEventListener('mousedown', handleInteraction);

        // Loop
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // Punch Animation
            [player, enemy].forEach(f => {
                [f.leftArm, f.rightArm].forEach(arm => {
                    if (arm.userData.punching) {
                        arm.position.z = THREE.MathUtils.lerp(arm.position.z, 2.5, 0.4);
                    } else {
                        arm.position.z = THREE.MathUtils.lerp(arm.position.z, 0.5, 0.2);
                    }
                });
            });

            // Enemy AI
            if (gameState === "PLAYING") {
                enemyAttackCooldown++;
                if (enemyAttackCooldown > 50) { // Faster enemy
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
            cancelAnimationFrame(animationId);
            renderer.dispose();
            if (containerRef.current) containerRef.current.innerHTML = "";
        };
    }, [gameState]);

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#0a0a0f", fontFamily: "Inter, sans-serif" }}>

            {gameState === "AVATAR" && (
                <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(10,10,15,0.95)" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>3D Combat Training</div>
                    <h2 style={{ fontSize: 48, fontWeight: 900, color: "white", marginBottom: 8, textAlign: "center" }}>ATTITUDE FIGHTER</h2>
                    <p style={{ color: "#94a3b8", marginBottom: 48, textAlign: "center", maxWidth: 400 }}>Kalahkan manifestasi buruk dan raih nilai ATTITUDE dalam setiap pukulan!</p>

                    <div style={{ display: "flex", gap: 24, marginBottom: 64 }}>
                        {AVATARS.map(avatar => (
                            <div
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar)}
                                style={{
                                    background: selectedAvatar.id === avatar.id ? "white" : "rgba(255,255,255,0.05)",
                                    padding: "32px", borderRadius: 32, border: `2px solid ${selectedAvatar.id === avatar.id ? "white" : "transparent"}`,
                                    cursor: "pointer", transition: "all 0.3s", textAlign: "center", width: 220, position: "relative",
                                    boxShadow: selectedAvatar.id === avatar.id ? "0 20px 40px rgba(255,255,255,0.1)" : "none"
                                }}
                            >
                                <div style={{ fontSize: 72, marginBottom: 16 }}>{avatar.icon}</div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: selectedAvatar.id === avatar.id ? "#0a0a10" : "white" }}>{avatar.name}</div>
                                <div style={{ fontSize: 13, color: selectedAvatar.id === avatar.id ? "#64748b" : "#94a3b8", marginTop: 8 }}>Power: {avatar.power}</div>
                                {selectedAvatar.id === avatar.id && (
                                    <div style={{ position: "absolute", top: -12, right: -12, background: "#10b981", color: "white", padding: "4px 12px", borderRadius: 99, fontSize: 10, fontWeight: 800 }}>SELECTED</div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setGameState("PLAYING")}
                        style={{ background: "#e11d48", color: "white", border: "none", padding: "22px 72px", borderRadius: 24, fontSize: 20, fontWeight: 900, cursor: "pointer", boxShadow: "0 12px 32px rgba(225,29,72,0.4)" }}
                    >
                        MULAI BERTARUNG 🥊
                    </button>

                    <Link href="/" style={{ marginTop: 32, color: "#94a3b8", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>← KEMBALI KE BERANDA</Link>
                </div>
            )}

            {gameState === "PLAYING" && (
                <>
                    {/* HUD */}
                    <div style={{ position: "absolute", top: 40, left: 40, width: 320 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "flex-end" }}>
                            <div style={{ color: "white" }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase" }}>Player</div>
                                <div style={{ fontSize: 18, fontWeight: 900 }}>{selectedAvatar.name}</div>
                            </div>
                            <span style={{ color: "white", fontSize: 24, fontWeight: 900 }}>{Math.ceil(playerHp)}</span>
                        </div>
                        <div style={{ height: 14, background: "rgba(255,255,255,0.1)", borderRadius: 7, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <div style={{ width: `${playerHp}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #10b981)", transition: "width 0.2s" }} />
                        </div>
                    </div>

                    <div style={{ position: "absolute", top: 40, right: 40, width: 320, textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "flex-end" }}>
                            <span style={{ color: "#e11d48", fontSize: 24, fontWeight: 900 }}>{Math.ceil(enemyHp)}</span>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 800, color: "#e11d48", textTransform: "uppercase" }}>Target</div>
                                <div style={{ fontSize: 18, fontWeight: 900 }}>ANTI-ATTITUDE</div>
                            </div>
                        </div>
                        <div style={{ height: 14, background: "rgba(255,255,255,0.1)", borderRadius: 7, overflow: "hidden", direction: "rtl", border: "1px solid rgba(225,29,72,0.2)" }}>
                            <div style={{ width: `${enemyHp}%`, height: "100%", background: "linear-gradient(90deg, #e11d48, #9f1239)", transition: "width 0.2s" }} />
                        </div>
                    </div>

                    <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
                        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em" }}>Combat Score</div>
                        <div style={{ color: "white", fontSize: 40, fontWeight: 900 }}>{playerScore}</div>
                    </div>

                    {/* Hit Popups */}
                    {hitPopups.map(popup => (
                        <div
                            key={popup.id}
                            style={{
                                position: "absolute",
                                left: `${popup.x}%`,
                                top: `${popup.y}%`,
                                color: "#10b981",
                                fontWeight: 900,
                                fontSize: 24,
                                textShadow: "0 0 20px rgba(16,185,129,0.8)",
                                pointerEvents: "none",
                                animation: "popupFade 1s forwards",
                                zIndex: 50,
                                textAlign: "center",
                                transform: "translate(-50%, -50%)"
                            }}
                        >
                            +ATTITUDE<br />
                            <span style={{ fontSize: 14, color: "white" }}>{popup.text}</span>
                        </div>
                    ))}

                    <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", color: "white", pointerEvents: "none" }}>
                        <div style={{ background: "rgba(10,10,15,0.8)", display: "inline-block", padding: "14px 32px", borderRadius: 99, fontSize: 14, fontWeight: 700, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                            Klik untuk Menghancurkan Kebiasaan Buruk! 🥊🔥
                        </div>
                    </div>
                </>
            )}

            {gameState === "RESULT" && (
                <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.95)", color: "white" }}>
                    <div style={{ fontSize: 120, marginBottom: 24, animation: "bounce 2s infinite" }}>{winner === "PLAYER" ? "🥇" : "🚫"}</div>
                    <h2 style={{ fontSize: 56, fontWeight: 900, marginBottom: 12, textAlign: "center" }}>{winner === "PLAYER" ? "MISI SELESAI!" : "COBA LAGI!"}</h2>
                    <p style={{ color: "#94a3b8", marginBottom: 48, maxWidth: 540, textAlign: "center", fontSize: 18, lineHeight: 1.6 }}>
                        {winner === "PLAYER"
                            ? `Luar biasa! Kamu telah melumpuhkan Anti-hero dan mempraktikkan nilai ATTITUDE dengan sempurna.`
                            : `Jangan biarkan pengaruh negatif menang. Fokuskan kembali nilai-nilai karaktermu dan kembali bertanding!`}
                    </p>

                    <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))", padding: "40px 80px", borderRadius: 40, marginBottom: 64, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 64px -12px rgba(0,0,0,0.5)" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", opacity: 0.6, letterSpacing: "0.1em", marginBottom: 12 }}>Combat Experience Gained</div>
                        <div style={{ fontSize: 72, fontWeight: 900, color: winner === "PLAYER" ? "#10b981" : "#e11d48", textShadow: "0 0 30px rgba(0,0,0,0.5)" }}>{playerScore} XP</div>
                    </div>

                    <div style={{ display: "flex", gap: 20 }}>
                        <button
                            onClick={() => { setGameState("AVATAR"); setPlayerHp(100); setEnemyHp(100); setPlayerScore(0); }}
                            style={{ background: "white", color: "#0a0a0f", border: "none", padding: "22px 56px", borderRadius: 24, fontSize: 18, fontWeight: 900, cursor: "pointer", transition: "transform 0.2s" }}
                        >
                            MAIN LAGI
                        </button>
                        <Link href="/" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "22px 56px", borderRadius: 24, fontSize: 18, fontWeight: 900, textDecoration: "none", backdropFilter: "blur(10px)" }}>
                            KE BERANDA
                        </Link>
                    </div>
                </div>
            )}

            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

            <style>{`
                @keyframes popupFade {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    20% { transform: translate(-50%, -80%) scale(1.1); opacity: 1; }
                    100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
}
