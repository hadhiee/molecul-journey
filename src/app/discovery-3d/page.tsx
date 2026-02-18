"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Link from "next/link";

const TRAITS = [
    { letter: "A", title: "Act Respectfully", color: 0xe11d48, desc: "Menjaga adab kepada guru dan saling menghargai sesama teman." },
    { letter: "T", title: "Talk Politely", color: 0xbe123c, desc: "Bertutur kata santun, positif, dan menghindari ucapan kasar." },
    { letter: "T", title: "Turn Off Distractions", color: 0x9f1239, desc: "Fokus penuh pada materi, tidak terdistraksi hal lain." },
    { letter: "I", title: "Involve Actively", color: 0x2563eb, desc: "Hadir sepenuhnya dan aktif berpartisipasi dalam diskusi." },
    { letter: "T", title: "Think Solutions", color: 0x059669, desc: "Berorientasi pada penyelesaian masalah, bukan mengeluh." },
    { letter: "U", title: "Use Tech Wisely", color: 0xd97706, desc: "Memanfaatkan teknologi & AI sebagai alat bantu belajar." },
    { letter: "D", title: "Dare to Ask", color: 0x7c3aed, desc: "Membangun rasa ingin tahu dan tidak malu bertanya." },
    { letter: "E", title: "Eager to Collaborate", color: 0x0891b2, desc: "Terbuka untuk bekerja sama dan berbagi ilmu." },
];

export default function Discovery3DGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [foundTraits, setFoundTraits] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [activeTrait, setActiveTrait] = useState<any>(null);
    const [gameState, setGameState] = useState<"START" | "PLAYING" | "RESULT">("START");

    useEffect(() => {
        if (!containerRef.current || gameState !== "PLAYING") return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);
        scene.fog = new THREE.FogExp2(0x0f172a, 0.03);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(15, 15, 15);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.maxDistance = 40;
        controls.minDistance = 5;

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(10, 20, 10);
        scene.add(pointLight);

        // Ground: Low poly grid
        const gridHelper = new THREE.GridHelper(100, 50, 0x1e293b, 0x1e293b);
        scene.add(gridHelper);

        // Crystal logic helpers
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const createTextTexture = (text: string, color: number) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            ctx.fillStyle = 'white';
            ctx.font = 'bold 80px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 64, 64);
            return new THREE.CanvasTexture(canvas);
        };

        const orbs: THREE.Group[] = [];
        TRAITS.forEach((trait, i) => {
            const group = new THREE.Group();

            // Outer Crystal (The one that "breaks")
            const crystalGeo = new THREE.IcosahedronGeometry(1.2, 0);
            const crystalMat = new THREE.MeshStandardMaterial({
                color: trait.color,
                transparent: true,
                opacity: 0.6,
                metalness: 0.9,
                roughness: 0.1,
                emissive: trait.color,
                emissiveIntensity: 0.5
            });
            const crystal = new THREE.Mesh(crystalGeo, crystalMat);
            crystal.name = "crystal_outer";
            group.add(crystal);

            // Inner Box with Letter
            const boxGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
            const textTexture = createTextTexture(trait.letter, trait.color);
            const boxMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                map: textTexture,
                emissive: 0xffffff,
                emissiveIntensity: 0.2
            });
            const box = new THREE.Mesh(boxGeo, boxMat);
            box.name = "inner_box";
            box.visible = false; // Hidden initially
            group.add(box);

            // Random Position
            const angle = (i / TRAITS.length) * Math.PI * 2;
            const dist = 10 + Math.random() * 15;
            group.position.set(Math.cos(angle) * dist, 1.2, Math.sin(angle) * dist);

            group.userData = { trait, id: i, found: false };
            scene.add(group);
            orbs.push(group);
        });

        // Click interaction
        const onMouseClick = (event: MouseEvent) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            for (let intersect of intersects) {
                const object = intersect.object;
                let group = object.parent as THREE.Group;

                if (group && group.userData.trait && !group.userData.found) {
                    // Logic "Pecah": Crystal outer hilang, box muncul
                    const crystalOuter = group.getObjectByName("crystal_outer");
                    const innerBox = group.getObjectByName("inner_box");

                    if (crystalOuter && innerBox) {
                        crystalOuter.visible = false;
                        innerBox.visible = true;
                        group.userData.found = true;

                        setFoundTraits(prev => [...prev, group.userData.id]);
                        setScore(s => s + 50);
                        setActiveTrait(group.userData.trait);

                        // Particle effect mockup
                        const particlesGeo = new THREE.IcosahedronGeometry(0.1, 0);
                        for (let p = 0; p < 10; p++) {
                            const pMesh = new THREE.Mesh(particlesGeo, new THREE.MeshBasicMaterial({ color: group.userData.trait.color }));
                            pMesh.position.copy(group.position);
                            scene.add(pMesh);
                            // Simple fire and forget animation logic could be added here
                        }
                    }
                    break;
                }
            }
        };

        window.addEventListener('click', onMouseClick);

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            orbs.forEach(orb => {
                orb.rotation.y += 0.01;
                if (!orb.userData.found) {
                    orb.position.y = 1.2 + Math.sin(Date.now() * 0.002) * 0.2;
                } else {
                    const box = orb.getObjectByName("inner_box");
                    if (box) box.rotation.x += 0.02;
                }
            });

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
            window.removeEventListener('click', onMouseClick);
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
                    <div style={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}>
                        <Link href="/" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "12px 20px", borderRadius: 12, color: "white", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                            ← Exit
                        </Link>
                    </div>

                    <div style={{ position: "absolute", top: 24, right: 24, zIndex: 10, display: "flex", gap: 12 }}>
                        <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "16px 24px", borderRadius: 20, color: "white", border: "1px solid rgba(255,255,255,0.2)", textAlign: "right" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", opacity: 0.6, marginBottom: 4 }}>Total XP</div>
                            <div style={{ fontSize: 24, fontWeight: 900 }}>{score}</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "16px 24px", borderRadius: 20, color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", opacity: 0.6, marginBottom: 4 }}>ATTITUDE Sequence</div>
                            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '4px' }}>
                                {"ATTITUDE".split("").map((letter, i) => (
                                    <span key={i} style={{ opacity: foundTraits.includes(i) ? 1 : 0.2, color: foundTraits.includes(i) ? '#10b981' : 'white' }}>
                                        {letter}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ position: "absolute", bottom: 40, width: "100%", display: "flex", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}>
                        <div style={{ background: "rgba(255,255,255,0.1)", color: "white", padding: "12px 24px", borderRadius: 99, fontSize: 14, fontWeight: 600, border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
                            Klik pada Crystal untuk Memecahkannya! 💎✨
                        </div>
                    </div>

                    {foundTraits.length === TRAITS.length && (
                        <div style={{ position: "absolute", bottom: 100, width: "100%", display: "flex", justifyContent: "center", zIndex: 10 }}>
                            <button
                                onClick={() => setGameState("RESULT")}
                                style={{ background: "#10b981", color: "white", border: "none", padding: "20px 48px", borderRadius: 24, fontSize: 18, fontWeight: 800, cursor: "pointer", boxShadow: "0 12px 32px rgba(16,185,129,0.4)" }}
                            >
                                KLAIM XP KEMENANGAN ✨
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Trait Popup */}
            {activeTrait && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
                    <div style={{ background: "white", padding: 40, borderRadius: 32, maxWidth: 440, textAlign: "center", boxShadow: "0 32px 64px -12px rgba(0,0,0,0.5)" }}>
                        <div style={{ fontSize: 96, fontWeight: 900, color: "#e11d48", marginBottom: 20 }}>{activeTrait.letter}</div>
                        <h3 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>Crystal {activeTrait.title}</h3>
                        <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.6, marginBottom: 32 }}>{activeTrait.desc}</p>
                        <button
                            onClick={() => setActiveTrait(null)}
                            style={{ background: "#0f172a", color: "white", border: "none", width: "100%", padding: "18px", borderRadius: 18, fontSize: 16, fontWeight: 800, cursor: "pointer" }}
                        >
                            Lanjut Kumpulkan Kristal ⚡
                        </button>
                    </div>
                </div>
            )}

            {/* Screens */}
            {gameState === "START" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, background: "radial-gradient(circle at center, #1e293b, #0f172a)", color: "white" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 16 }}>3D Click Discovery</div>
                    <h1 style={{ fontSize: 64, fontWeight: 900, marginBottom: 20, textAlign: "center", letterSpacing: "-0.04em", lineHeight: 1 }}>BREAK THE CRYSTAL <br /> FIND YOURSELF</h1>
                    <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 500, textAlign: "center", marginBottom: 48, lineHeight: 1.6 }}>
                        Gunakan kursor untuk mencari dan memecahkan 8 Kristal ATTITUDE yang tersebar. Temukan huruf di balik pecahannya!
                    </p>
                    <button
                        onClick={() => setGameState("PLAYING")}
                        style={{ background: "white", color: "#0f172a", border: "none", padding: "22px 56px", borderRadius: 24, fontSize: 20, fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 40px rgba(255,255,255,0.2)" }}
                    >
                        Mulai Pencarian 🚀
                    </button>
                    <div style={{ marginTop: 32, fontSize: 12, color: "#475569", fontWeight: 600 }}>TIPS: Gunakan Mouse untuk memutar dunia & klik untuk aksi</div>
                </div>
            )}

            {gameState === "RESULT" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, background: "white", padding: 24 }}>
                    <div style={{ fontSize: 96, marginBottom: 24 }}>🎊</div>
                    <h2 style={{ fontSize: 42, fontWeight: 900, color: "#0f172a", marginBottom: 16 }}>MISI SUPER SELESAI!</h2>
                    <p style={{ fontSize: 20, color: "#64748b", textAlign: "center", maxWidth: 540, marginBottom: 48, lineHeight: 1.5 }}>
                        Luar biasa! Kamu telah memecahkan semua kristal dan menyusun jiwa **ATTITUDE**-mu. Kamu siap terjun ke dunia industri!
                    </p>
                    <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", padding: '40px 64px', borderRadius: 32, color: 'white', textAlign: 'center', boxShadow: '0 24px 48px -12px rgba(16,185,129,0.4)', marginBottom: 48 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", opacity: 0.8, marginBottom: 12 }}>Total Karakter XP</div>
                        <div style={{ fontSize: 72, fontWeight: 900 }}>{score}</div>
                    </div>
                    <Link href="/" style={{ background: "#0f172a", color: "white", padding: "22px 72px", borderRadius: 24, fontSize: 20, fontWeight: 800, textDecoration: "none" }}>
                        Kembali ke Home
                    </Link>
                </div>
            )}

            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}
