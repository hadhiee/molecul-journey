"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Link from "next/link";

const ATTITUDE_VALUES = [
    { letter: "A", title: "Act Respectfully", desc: "Menjaga adab kepada guru dan saling menghargai sesama teman.", color: 0xe11d48 },
    { letter: "T", title: "Talk Politely", desc: "Bertutur kata santun, positif, dan menghindari ucapan kasar.", color: 0xbe123c },
    { letter: "T", title: "Turn Off Distractions", desc: "Fokus penuh pada materi, tidak terdistraksi hal lain.", color: 0x9f1239 },
    { letter: "I", title: "Involve Actively", desc: "Hadir sepenuhnya dan aktif berpartisipasi dalam diskusi.", color: 0x2563eb },
    { letter: "T", title: "Think Solutions", desc: "Berorientasi pada penyelesaian masalah, bukan mengeluh.", color: 0x059669 },
    { letter: "U", title: "Use Tech Wisely", desc: "Memanfaatkan teknologi & AI sebagai alat bantu belajar.", color: 0xd97706 },
    { letter: "D", title: "Dare to Ask", desc: "Membangun rasa ingin tahu dan tidak malu bertanya.", color: 0x7c3aed },
    { letter: "E", title: "Eager to Collaborate", desc: "Terbuka untuk bekerja sama dan berbagi ilmu.", color: 0x0891b2 },
];

export default function Integrity3DGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
    const [activeValue, setActiveValue] = useState<any>(null);

    useEffect(() => {
        if (!containerRef.current || gameState !== "PLAYING") return;

        // --- Three.js Setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f2f5);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // Ground
        const groundGeo = new THREE.PlaneGeometry(20, 20);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Tower State
        const stack: THREE.Mesh[] = [];
        const baseWidth = 3;
        const boxHeight = 0.5;

        const createTextTexture = (text: string, bgColor: number) => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            // Background
            ctx.fillStyle = `#${bgColor.toString(16).padStart(6, '0')}`;
            ctx.fillRect(0, 0, 256, 256);

            // Text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 160px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 128, 128);

            return new THREE.CanvasTexture(canvas);
        };

        const createBox = (y: number, color: number, label: string = "") => {
            const geo = new THREE.BoxGeometry(baseWidth, boxHeight, baseWidth);

            let material;
            if (label) {
                const texture = createTextTexture(label, color);
                const faceMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3, metalness: 0.2 });
                const plainMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 });
                material = [faceMat, faceMat, plainMat, plainMat, faceMat, faceMat];
            } else {
                material = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 });
            }

            const mesh = new THREE.Mesh(geo, material);
            mesh.position.y = y;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            return mesh;
        };

        // Initial base
        stack.push(createBox(boxHeight / 2, 0x1e293b));

        // Moving Box
        let currentBox: THREE.Mesh | null = null;
        let direction = 1;
        let speed = 0.04;
        let axis: "x" | "z" = "x";

        const spawnBox = () => {
            const valueIdx = stack.length % ATTITUDE_VALUES.length;
            const value = ATTITUDE_VALUES[valueIdx];

            const y = (stack.length * boxHeight) + (boxHeight / 2);
            currentBox = createBox(y, value.color, value.letter);
            currentBox.position[axis] = -5;

            // Adjust camera
            if (stack.length > 5) {
                camera.position.y += boxHeight;
                camera.lookAt(0, stack.length * boxHeight / 2, 0);
            }
        };

        spawnBox();

        const handleStack = () => {
            if (!currentBox) return;

            const lastBox = stack[stack.length - 1];
            const diff = currentBox.position[axis] - lastBox.position[axis];
            const limit = baseWidth * 1.1;

            if (Math.abs(diff) >= limit) {
                setGameState("GAMEOVER");
                return;
            }

            // Successfully stacked
            const valueIdx = (stack.length) % ATTITUDE_VALUES.length;
            setActiveValue(ATTITUDE_VALUES[valueIdx]);

            stack.push(currentBox);
            setScore(prev => prev + 10);

            axis = axis === "x" ? "z" : "x";
            speed += 0.003;
            spawnBox();
        };

        const handleClick = () => {
            handleStack();
        };

        window.addEventListener("mousedown", handleClick);
        window.addEventListener("touchstart", handleClick);

        let animationId: number;
        const animate = () => {
            if (currentBox) {
                currentBox.position[axis] += direction * speed;
                if (Math.abs(currentBox.position[axis]) > 5) {
                    direction *= -1;
                }
            }

            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener("mousedown", handleClick);
            window.removeEventListener("touchstart", handleClick);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [gameState]);

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#f0f2f5", fontFamily: "Inter, sans-serif" }}>
            {/* UI Layer */}
            <div style={{ position: "absolute", top: 24, left: 24, zIndex: 10 }}>
                <Link href="/" style={{ background: "white", padding: "10px 20px", borderRadius: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textDecoration: "none", color: "#1a1a2e" }}>
                    ← Keluar
                </Link>
            </div>

            <div style={{ position: "absolute", top: 24, right: 24, zIndex: 10, textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>XP Terkumpul</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#1a1a2e" }}>{score}</div>
            </div>

            {/* Value Description Popup */}
            {activeValue && gameState === "PLAYING" && (
                <div
                    key={score} // Forces re-animation on new score
                    style={{
                        position: "absolute",
                        bottom: 120,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 20,
                        background: "white",
                        padding: "20px 32px",
                        borderRadius: 24,
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                        maxWidth: 400,
                        textAlign: "center",
                        borderBottom: `6px solid #${activeValue.color.toString(16).padStart(6, '0')}`,
                        animation: "slideUp 0.5s ease-out"
                    }}
                >
                    <div style={{ fontSize: 40, fontWeight: 900, color: `#${activeValue.color.toString(16).padStart(6, '0')}`, marginBottom: 4 }}>
                        {activeValue.letter}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>
                        {activeValue.title}
                    </div>
                    <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                        {activeValue.desc}
                    </p>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>

            {/* Game States */}
            {gameState === "IDLE" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 30, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)" }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: "#e11d48", marginBottom: 12 }}>ATTITUDE TOWER</div>
                    <p style={{ fontSize: 16, color: "#64748b", maxWidth: 400, textAlign: "center", marginBottom: 32, fontWeight: 500 }}>
                        Tumpuk nilai budaya Moklet setinggi mungkin. Temukan pesan di balik setiap huruf!
                    </p>
                    <button
                        onClick={() => setGameState("PLAYING")}
                        style={{ background: "#e11d48", color: "white", border: "none", padding: "18px 48px", borderRadius: 20, fontSize: 18, fontWeight: 800, cursor: "pointer", boxShadow: "0 12px 24px -6px rgba(225,29,72,0.4)" }}
                    >
                        Mulai Tumpuk 🚀
                    </button>
                </div>
            )}

            {gameState === "GAMEOVER" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 30, background: "rgba(0,0,0,0.7)", color: "white", backdropFilter: "blur(5px)" }}>
                    <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 8 }}>MENARA RUNTUH! 💥</div>
                    <p style={{ fontSize: 20, opacity: 0.8, marginBottom: 32 }}>Karaktermu butuh lebih banyak konsistensi.</p>
                    <div style={{ background: "rgba(255,255,255,0.1)", padding: "24px 48px", borderRadius: 24, textAlign: "center", marginBottom: 40, border: "1px solid rgba(255,255,255,0.2)" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase" }}>Skor Karakter</div>
                        <div style={{ fontSize: 48, fontWeight: 900 }}>{score} XP</div>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                        <button
                            onClick={() => { setScore(0); setGameState("PLAYING"); setActiveValue(null); }}
                            style={{ background: "white", color: "#e11d48", border: "none", padding: "18px 32px", borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: "pointer" }}
                        >
                            Coba Lagi
                        </button>
                        <Link href="/" style={{ background: "rgba(255,255,255,0.1)", color: "white", padding: "18px 32px", borderRadius: 16, fontSize: 16, fontWeight: 800, textDecoration: "none", display: "inline-block", border: "1px solid rgba(255,255,255,0.2)" }}>
                            Ke Beranda
                        </Link>
                    </div>
                </div>
            )}

            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

            {/* Instruction Footer */}
            {gameState === "PLAYING" && (
                <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", zIndex: 10, pointerEvents: "none" }}>
                    <div style={{ display: "inline-block", background: "rgba(26,26,46,0.8)", color: "white", padding: "12px 24px", borderRadius: 99, fontSize: 14, fontWeight: 700, backdropFilter: "blur(4px)" }}>
                        Tap untuk menumpuk nilai ATTITUDE! 🖱️
                    </div>
                </div>
            )}
        </div>
    );
}
