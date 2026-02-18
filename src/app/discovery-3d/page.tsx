"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Link from "next/link";

const TRAITS = [
    { title: "Sang Inovator", icon: "💡", color: 0x3b82f6, desc: "Kamu suka menciptakan solusi baru dari nol.", type: "RPL" },
    { title: "Arsitek Jaringan", icon: "🌐", color: 0x10b981, desc: "Kamu ahli dalam menghubungkan berbagai sistem.", type: "TKJ" },
    { title: "Visual Storyteller", icon: "🎨", color: 0xe11d48, desc: "Kamu melihat dunia melalui estetika dan pesan.", type: "DKV" },
    { title: "Problem Solver", icon: "🧩", color: 0xf59e0b, desc: "Tidak ada bug yang terlalu sulit untukmu.", type: "Character" },
];

export default function Discovery3DGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [foundTraits, setFoundTraits] = useState<string[]>([]);
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
                opacity: 0.3,
                emissive: trait.color,
                emissiveIntensity: 1
            });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            group.add(sphere);

            // Core
            const coreGeo = new THREE.OctahedronGeometry(0.4, 0);
            const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const core = new THREE.Mesh(coreGeo, coreMat);
            group.add(core);

            // Random Position
            const angle = (i / TRAITS.length) * Math.PI * 2;
            const dist = 8 + Math.random() * 5;
            group.position.set(Math.cos(angle) * dist, 1, Math.sin(angle) * dist);

            group.userData = { trait };
            scene.add(group);
            orbs.push(group);
        });

        // Movement State
        const keys: Record<string, boolean> = {};
        window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
        window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // Movement Logic
            const speed = 0.15;
            if (keys['w']) character.position.z -= speed;
            if (keys['s']) character.position.z += speed;
            if (keys['a']) character.position.x -= speed;
            if (keys['d']) character.position.x += speed;

            // Orb Animations & Collision
            orbs.forEach(orb => {
                orb.rotation.y += 0.02;
                orb.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.2;

                const distance = character.position.distanceTo(orb.position);
                if (distance < 1.5 && orb.visible) {
                    orb.visible = false;
                    const trait = orb.userData.trait;
                    setFoundTraits(prev => {
                        if (prev.includes(trait.title)) return prev;
                        setActiveTrait(trait);
                        return [...prev, trait.title];
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

    const finishDiscovery = () => {
        setGameState("RESULT");
    };

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

                    <div style={{ position: "absolute", top: 24, right: 24, zIndex: 10 }}>
                        <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "16px 24px", borderRadius: 20, color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", opacity: 0.6, marginBottom: 4 }}>Trait Ditemukan</div>
                            <div style={{ fontSize: 24, fontWeight: 900 }}>{foundTraits.length} / {TRAITS.length}</div>
                        </div>
                    </div>

                    <div style={{ position: "absolute", bottom: 40, width: "100%", display: "flex", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}>
                        <div style={{ background: "rgba(0,0,0,0.5)", color: "white", padding: "12px 24px", borderRadius: 99, fontSize: 14, fontWeight: 600 }}>
                            Gunakan WASD untuk jalan & Mouse untuk putar kamera 🕹️
                        </div>
                    </div>

                    {foundTraits.length === TRAITS.length && (
                        <div style={{ position: "absolute", bottom: 100, width: "100%", display: "flex", justifyContent: "center", zIndex: 10 }}>
                            <button
                                onClick={finishDiscovery}
                                style={{ background: "#10b981", color: "white", border: "none", padding: "16px 32px", borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(16,185,129,0.4)" }}
                            >
                                Selesaikan Jati Diri ✨
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Trait Popup */}
            {activeTrait && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
                    <div style={{ background: "white", padding: 40, borderRadius: 32, maxWidth: 400, textAlign: "center", boxShadow: "0 32px 64px -12px rgba(0,0,0,0.5)" }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>{activeTrait.icon}</div>
                        <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Kamu Menemukan: {activeTrait.title}!</h3>
                        <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.6, marginBottom: 32 }}>{activeTrait.desc}</p>
                        <button
                            onClick={() => setActiveTrait(null)}
                            style={{ background: "#0f172a", color: "white", border: "none", width: "100%", padding: "16px", borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: "pointer" }}
                        >
                            Lanjut Jelajah
                        </button>
                    </div>
                </div>
            )}

            {/* Screens */}
            {gameState === "START" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, background: "linear-gradient(to bottom, #0f172a, #1e293b)", color: "white" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>Next-Gen 3D Simulation</div>
                    <h1 style={{ fontSize: 56, fontWeight: 900, marginBottom: 16, textAlign: "center", letterSpacing: "-0.04em" }}>THE CRYSTAL OF <br /> SELF DISCOVERY</h1>
                    <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 500, textAlign: "center", marginBottom: 48, lineHeight: 1.6 }}>
                        Jelajahi dunia 3D MoLeCul, kumpulkan kristal jati diri, dan temukan potensi terpendammu sebagai warga Moklet.
                    </p>
                    <button
                        onClick={() => setGameState("PLAYING")}
                        style={{ background: "white", color: "#0f172a", border: "none", padding: "20px 48px", borderRadius: 20, fontSize: 18, fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 30px rgba(255,255,255,0.2)" }}
                    >
                        Masuki Dunia (Beta) 🚀
                    </button>
                </div>
            )}

            {gameState === "RESULT" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, background: "white", padding: 24 }}>
                    <div style={{ fontSize: 64, marginBottom: 24 }}>🏆</div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>Analisis Jati Diri Selesai!</h2>
                    <p style={{ fontSize: 18, color: "#64748b", textAlign: "center", maxWidth: 500, marginBottom: 40 }}>
                        Berdasarkan eksplorasimu, kamu memiliki jiwa yang sangat dominan di bidang Digital Creative.
                    </p>
                    <div style={{ background: "#f8fafc", padding: 32, borderRadius: 24, width: "100%", maxWidth: 500, border: "1px solid #e2e8f0", marginBottom: 40 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#e11d48", textTransform: "uppercase", marginBottom: 16 }}>Potential Role</div>
                        {foundTraits.map((t, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: i < foundTraits.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                                <span style={{ fontWeight: 700 }}>{t}</span>
                                <span style={{ color: "#10b981", fontWeight: 800 }}>Mastered</span>
                            </div>
                        ))}
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
