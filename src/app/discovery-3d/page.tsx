"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Link from "next/link";

const TRAITS = [
    { title: "Act Respectfully", icon: "A", color: 0xe11d48, desc: "Menjaga adab kepada guru dan saling menghargai sesama teman.", type: "Character" },
    { title: "Talk Politely", icon: "T", color: 0xbe123c, desc: "Bertutur kata santun, positif, dan menghindari ucapan kasar.", type: "Communication" },
    { title: "Turn Off Distractions", icon: "T", color: 0x9f1239, desc: "Fokus penuh pada materi, tidak terdistraksi hal lain.", type: "Character" },
    { title: "Involve Actively", icon: "I", color: 0x2563eb, desc: "Hadir sepenuhnya dan aktif berpartisipasi dalam diskusi.", type: "Collaboration" },
    { title: "Think Solutions", icon: "T", color: 0x059669, desc: "Berorientasi pada penyelesaian masalah, bukan mengeluh.", type: "Critical Thinking" },
    { title: "Use Tech Wisely", icon: "U", color: 0xd97706, desc: "Memanfaatkan teknologi & AI sebagai alat bantu belajar.", type: "Industry" },
    { title: "Dare to Ask", icon: "D", color: 0x7c3aed, desc: "Membangun rasa ingin tahu dan tidak malu bertanya.", type: "Critical Thinking" },
    { title: "Eager to Collaborate", icon: "E", color: 0x0891b2, desc: "Terbuka untuk bekerja sama dan berbagi ilmu.", type: "Collaboration" },
];

export default function Discovery3DGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [foundTraits, setFoundTraits] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [activeTrait, setActiveTrait] = useState<any>(null);
    const [gameState, setGameState] = useState<"START" | "PLAYING" | "RESULT">("START");

    useEffect(() => {
        if (!containerRef.current || gameState !== "PLAYING") return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);
        scene.fog = new THREE.FogExp2(0x0f172a, 0.05);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 15);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.minDistance = 5;
        controls.maxDistance = 30;

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const pointLight = new THREE.PointLight(0xe11d48, 2, 50);
        pointLight.position.set(0, 10, 0);
        scene.add(pointLight);

        // Ground: Low poly grid
        const gridHelper = new THREE.GridHelper(100, 50, 0x1e293b, 0x1e293b);
        scene.add(gridHelper);

        const planeGeo = new THREE.PlaneGeometry(100, 100);
        const planeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
        const floor = new THREE.Mesh(planeGeo, planeMat);
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        // Character: Glowing Sphere
        const charGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const charMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });
        const character = new THREE.Mesh(charGeo, charMat);
        character.position.y = 0.5;
        scene.add(character);

        // Trait Orbs
        const orbs: THREE.Group[] = [];
        TRAITS.forEach((trait, i) => {
            const group = new THREE.Group();

            // Outer Glow
            const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
            const sphereMat = new THREE.MeshStandardMaterial({
                color: trait.color,
                transparent: true,
                opacity: 0.4,
                emissive: trait.color,
                emissiveIntensity: 1
            });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            group.add(sphere);

            // Core with Label
            const coreGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
            const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const core = new THREE.Mesh(coreGeo, coreMat);
            group.add(core);

            // Random Position in a wider circle
            const angle = (i / TRAITS.length) * Math.PI * 2;
            const dist = 10 + Math.random() * 8;
            group.position.set(Math.cos(angle) * dist, 1, Math.sin(angle) * dist);

            group.userData = { trait, id: i };
            scene.add(group);
            orbs.push(group);
        });

        // Movement State
        const keys: Record<string, boolean> = {};
        const onKey = (e: KeyboardEvent, isDown: boolean) => {
            keys[e.key.toLowerCase()] = isDown;
        };
        window.addEventListener('keydown', (e) => onKey(e, true));
        window.addEventListener('keyup', (e) => onKey(e, false));

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // Movement Logic
            const speed = 0.18;
            if (keys['w']) character.position.z -= speed;
            if (keys['s']) character.position.z += speed;
            if (keys['a']) character.position.x -= speed;
            if (keys['d']) character.position.x += speed;

            // Orb Animations & Collision
            orbs.forEach(orb => {
                orb.rotation.y += 0.03;
                orb.position.y = 1 + Math.sin(Date.now() * 0.003) * 0.2;

                const distance = character.position.distanceTo(orb.position);
                if (distance < 1.5 && orb.visible) {
                    orb.visible = false;
                    const trait = orb.userData.trait;
                    setFoundTraits(prev => {
                        if (prev.includes(trait.title + orb.userData.id)) return prev;
                        setActiveTrait(trait);
                        setScore(s => s + 50);
                        return [...prev, trait.title + orb.userData.id];
                    });
                }
            });

            // Camera follow character
            controls.target.lerp(character.position, 0.1);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            if (containerRef.current) containerRef.current.innerHTML = "";
        };
    }, [gameState]);

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>
            {/* HUD */}
            {gameState === "PLAYING" && (
                <>
                    <div style={{ position: "absolute", top: 24, left: 24, zIndex: 10, display: "flex", gap: 12 }}>
                        <Link href="/" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "12px 20px", borderRadius: 12, color: "white", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                            ← Exit
                        </Link>
                    </div>

                    <div style={{ position: "absolute", top: 24, right: 24, zIndex: 10, display: "flex", gap: 12 }}>
                        <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "16px 24px", borderRadius: 20, color: "white", border: "1px solid rgba(255,255,255,0.2)", textAlign: "right" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", opacity: 0.6, marginBottom: 4 }}>Score</div>
                            <div style={{ fontSize: 24, fontWeight: 900 }}>{score}</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "16px 24px", borderRadius: 20, color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", opacity: 0.6, marginBottom: 4 }}>ATTITUDE Crystal</div>
                            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '2px' }}>
                                {"ATTITUDE".split("").map((letter, i) => (
                                    <span key={i} style={{ opacity: i < foundTraits.length ? 1 : 0.2, color: i < foundTraits.length ? '#10b981' : 'white' }}>
                                        {letter}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ position: "absolute", bottom: 40, width: "100%", display: "flex", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}>
                        <div style={{ background: "rgba(0,0,0,0.5)", color: "white", padding: "12px 24px", borderRadius: 99, fontSize: 14, fontWeight: 600 }}>
                            Gunakan WASD untuk jalan & kumpulkan 8 Crystal ATTITUDE! 🕹️
                        </div>
                    </div>

                    {foundTraits.length === TRAITS.length && (
                        <div style={{ position: "absolute", bottom: 100, width: "100%", display: "flex", justifyContent: "center", zIndex: 10 }}>
                            <button
                                onClick={() => setGameState("RESULT")}
                                style={{ background: "#10b981", color: "white", border: "none", padding: "16px 32px", borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(16,185,129,0.4)" }}
                            >
                                KLAIM KEMENANGAN ✨
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Trait Popup */}
            {activeTrait && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
                    <div style={{ background: "white", padding: 40, borderRadius: 32, maxWidth: 400, textAlign: "center", boxShadow: "0 32px 64px -12px rgba(0,0,0,0.5)" }}>
                        <div style={{ fontSize: 80, fontWeight: 900, color: "#e11d48", marginBottom: 16 }}>{activeTrait.icon}</div>
                        <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Crystal {activeTrait.title}</h3>
                        <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.6, marginBottom: 32 }}>{activeTrait.desc}</p>
                        <button
                            onClick={() => setActiveTrait(null)}
                            style={{ background: "#0f172a", color: "white", border: "none", width: "100%", padding: "16px", borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: "pointer" }}
                        >
                            Dapatkan +50 Score ⚡
                        </button>
                    </div>
                </div>
            )}

            {/* Screens */}
            {gameState === "START" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, background: "linear-gradient(to bottom, #0f172a, #1e293b)", color: "white" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>3D Discovery Quest</div>
                    <h1 style={{ fontSize: 56, fontWeight: 900, marginBottom: 16, textAlign: "center", letterSpacing: "-0.04em" }}>THE CRYSTAL OF <br /> ATTITUDE</h1>
                    <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 500, textAlign: "center", marginBottom: 48, lineHeight: 1.6 }}>
                        Cari dan kumpulkan 8 Crystal yang tersebar di dunia digital ini untuk melengkapi jiwa ATTITUDE-mu!
                    </p>
                    <button
                        onClick={() => setGameState("PLAYING")}
                        style={{ background: "white", color: "#0f172a", border: "none", padding: "20px 48px", borderRadius: 20, fontSize: 18, fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 30px rgba(255,255,255,0.2)" }}
                    >
                        Mulai Petualangan 🚀
                    </button>
                </div>
            )}

            {gameState === "RESULT" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, background: "white", padding: 24 }}>
                    <div style={{ fontSize: 80, marginBottom: 24 }}>🎊</div>
                    <h2 style={{ fontSize: 36, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>MISI SELESAI!</h2>
                    <p style={{ fontSize: 20, color: "#64748b", textAlign: "center", maxWidth: 500, marginBottom: 40 }}>
                        Selamat! Kamu telah berhasil mengumpulkan seluruh Crystal ATTITUDE dan siap menjadi warga Moklet teladan.
                    </p>
                    <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", padding: '32px 48px', borderRadius: 24, color: 'white', textAlign: 'center', boxShadow: '0 20px 40px -12px rgba(16,185,129,0.3)', marginBottom: 48 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", opacity: 0.8, marginBottom: 8 }}>Total Score Kamu</div>
                        <div style={{ fontSize: 64, fontWeight: 900 }}>{score} XP</div>
                    </div>
                    <Link href="/" style={{ background: "#0f172a", color: "white", padding: "20px 64px", borderRadius: 20, fontSize: 18, fontWeight: 800, textDecoration: "none" }}>
                        Kembali ke Beranda
                    </Link>
                </div>
            )}

            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}
