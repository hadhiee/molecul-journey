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
    { name: "Toxic Speaker", factor: "T - Talk Politely", color: 0x1e293b, icon: "🙊" },
    { name: "Lone Blamer", factor: "E - Eager to Collaborate", color: 0x0f172a, icon: "👤" },
];

export default function Fighter3DGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [gameState, setGameState] = useState<"AVATAR" | "PLAYING" | "RESULT">("AVATAR");
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [playerHp, setPlayerHp] = useState(100);
    const [enemyHp, setEnemyHp] = useState(100);
    const [playerScore, setPlayerScore] = useState(0);
    const [winner, setWinner] = useState<"PLAYER" | "ENEMY" | null>(null);

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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 2);
        spotLight.position.set(0, 15, 5);
        spotLight.angle = Math.PI / 4;
        spotLight.castShadow = true;
        scene.add(spotLight);

        // Arena
        const ringGeo = new THREE.CylinderGeometry(8, 8, 1, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = -0.5;
        ring.receiveShadow = true;
        scene.add(ring);

        const neonGeo = new THREE.RingGeometry(7.8, 8, 32);
        const neonMat = new THREE.MeshBasicMaterial({ color: 0xe11d48, side: THREE.DoubleSide });
        const neon = new THREE.Mesh(neonGeo, neonMat);
        neon.rotation.x = Math.PI / 2;
        neon.position.y = 0.01;
        scene.add(neon);

        // Character Creation Utility
        const createFighter = (color: number, isEnemy = false) => {
            const group = new THREE.Group();

            // Body
            const bodyGeo = new THREE.CapsuleGeometry(0.6, 1, 4, 8);
            const bodyMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
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
            const armGeo = new THREE.BoxGeometry(0.3, 0.3, 1);
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
        enemy.group.position.set(0, 0, -3);
        enemy.group.rotation.y = Math.PI;
        scene.add(enemy.group);

        // Battle Logic
        let isAttacking = false;
        let enemyAttackCooldown = 0;

        const punch = (fighterArms: any, isPlayer: boolean) => {
            if (isPlayer && isAttacking) return;
            if (isPlayer) isAttacking = true;

            const arm = Math.random() > 0.5 ? fighterArms.leftArm : fighterArms.rightArm;
            const originalZ = arm.position.z;

            // Animation via manual lerp in loop or simple state
            arm.userData.punching = true;
            arm.userData.progress = 0;

            // Damage logic
            if (isPlayer) {
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
            punch(player, true);
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
                        arm.position.z = THREE.MathUtils.lerp(arm.position.z, 2, 0.3);
                    } else {
                        arm.position.z = THREE.MathUtils.lerp(arm.position.z, 0.5, 0.2);
                    }
                });
            });

            // Enemy AI
            if (gameState === "PLAYING") {
                enemyAttackCooldown++;
                if (enemyAttackCooldown > 60) {
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
                    <h2 style={{ fontSize: 40, fontWeight: 900, color: "white", marginBottom: 8 }}>PILIH HERO KAMU</h2>
                    <p style={{ color: "#94a3b8", marginBottom: 48 }}>Siapkan dirimu melawan budaya anti-ATTITUDE!</p>

                    <div style={{ display: "flex", gap: 24, marginBottom: 64 }}>
                        {AVATARS.map(avatar => (
                            <div
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar)}
                                style={{
                                    background: selectedAvatar.id === avatar.id ? "white" : "rgba(255,255,255,0.05)",
                                    padding: "32px", borderRadius: 32, border: `2px solid ${selectedAvatar.id === avatar.id ? "white" : "transparent"}`,
                                    cursor: "pointer", transition: "all 0.3s", textAlign: "center", width: 200
                                }}
                            >
                                <div style={{ fontSize: 64, marginBottom: 16 }}>{avatar.icon}</div>
                                <div style={{ fontSize: 20, fontWeight: 900, color: selectedAvatar.id === avatar.id ? "#0a0a10" : "white" }}>{avatar.name}</div>
                                <div style={{ fontSize: 13, color: selectedAvatar.id === avatar.id ? "#64748b" : "#94a3b8", marginTop: 8 }}>Pwr: {avatar.power}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setGameState("PLAYING")}
                        style={{ background: "#e11d48", color: "white", border: "none", padding: "20px 64px", borderRadius: 24, fontSize: 20, fontWeight: 900, cursor: "pointer", boxShadow: "0 12px 32px rgba(225,29,72,0.4)" }}
                    >
                        MASUK ARENA 🥊
                    </button>

                    <Link href="/" style={{ marginTop: 24, color: "#e11d48", fontWeight: 700, textDecoration: "none" }}>← Batal</Link>
                </div>
            )}

            {gameState === "PLAYING" && (
                <>
                    {/* HUD */}
                    <div style={{ position: "absolute", top: 40, left: 40, width: 300 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ color: "white", fontWeight: 900 }}>YOU ({selectedAvatar.name})</span>
                            <span style={{ color: "white", fontWeight: 900 }}>{Math.ceil(playerHp)}%</span>
                        </div>
                        <div style={{ height: 12, background: "rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden" }}>
                            <div style={{ width: `${playerHp}%`, height: "100%", background: "#10b981", transition: "width 0.2s" }} />
                        </div>
                    </div>

                    <div style={{ position: "absolute", top: 40, right: 40, width: 300, textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ color: "#e11d48", fontWeight: 900 }}>{Math.ceil(enemyHp)}%</span>
                            <span style={{ color: "#e11d48", fontWeight: 900 }}>ANTI-ATTITUDE</span>
                        </div>
                        <div style={{ height: 12, background: "rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden", direction: "rtl" }}>
                            <div style={{ width: `${enemyHp}%`, height: "100%", background: "#e11d48", transition: "width 0.2s" }} />
                        </div>
                    </div>

                    <div style={{ position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
                        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>Combat Score</div>
                        <div style={{ color: "white", fontSize: 32, fontWeight: 900 }}>{playerScore}</div>
                    </div>

                    <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", color: "white", pointerEvents: "none" }}>
                        <div style={{ background: "rgba(0,0,0,0.5)", display: "inline-block", padding: "12px 24px", borderRadius: 99, fontSize: 13, fontWeight: 700, backdropFilter: "blur(4px)" }}>
                            Klik Terus untuk Memberikan Pukulan Telak! 🥊💨
                        </div>
                    </div>
                </>
            )}

            {gameState === "RESULT" && (
                <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.9)", color: "white" }}>
                    <div style={{ fontSize: 120, marginBottom: 24 }}>{winner === "PLAYER" ? "🏆" : "💀"}</div>
                    <h2 style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>{winner === "PLAYER" ? "KEADILAN MENANG!" : "BUDAYA TERKONTAMINASI!"}</h2>
                    <p style={{ color: "#94a3b8", marginBottom: 40, maxWidth: 500, textAlign: "center" }}>
                        {winner === "PLAYER"
                            ? `Kamu berhasil mengalahkan Anti-hero dengan kekuatan ATTITUDE! Skor karaktermu bertambah.`
                            : `Jangan menyerah! Nilai ATTITUDE robotmu perlu diperbaiki lagi agar lebih kuat.`}
                    </p>

                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "32px 64px", borderRadius: 32, marginBottom: 48, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", opacity: 0.6 }}>Total Combat XP</div>
                        <div style={{ fontSize: 48, fontWeight: 900, color: winner === "PLAYER" ? "#10b981" : "#e11d48" }}>{playerScore}</div>
                    </div>

                    <div style={{ display: "flex", gap: 16 }}>
                        <button
                            onClick={() => { setGameState("AVATAR"); setPlayerHp(100); setEnemyHp(100); setPlayerScore(0); }}
                            style={{ background: "white", color: "#0a0a0f", border: "none", padding: "18px 48px", borderRadius: 16, fontSize: 16, fontWeight: 900, cursor: "pointer" }}
                        >
                            MAIN LAGI
                        </button>
                        <Link href="/" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "18px 48px", borderRadius: 16, fontSize: 16, fontWeight: 900, textDecoration: "none" }}>
                            KE BERANDA
                        </Link>
                    </div>
                </div>
            )}

            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}
