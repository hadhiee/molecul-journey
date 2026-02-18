
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { stringToUUID } from "@/lib/ids";
import Link from "next/link";

// --- Game Constants ---
const PLAYER_SPEED_LERP = 0.1;
const BULLET_SPEED = 12; // units per second
const ENEMY_SPEED = 3;
const SPAWN_INTERVAL = 1.5; // seconds
const BOUNDS = { x: 8, y: 10 };

const CULTURE_VALUES = [
    "Jujur", "Disiplin", "Mandiri", "Kreatif",
    "Peduli", "Santun", "Tanggung Jawab", "Amanah",
    "Inovatif", "Kolaboratif", "Berani", "Optimis"
];

// --- Types ---
type BulletData = { id: number; x: number; y: number };
type EnemyData = { id: number; x: number; y: number; label: string };

// --- Components ---

function Player({ pointerPos, onShoot }: { pointerPos: React.MutableRefObject<THREE.Vector2>, onShoot: () => void }) {
    const meshRef = useRef<THREE.Group>(null!);
    const lastShot = useRef(0);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        // Move towards pointer X
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, pointerPos.current.x, PLAYER_SPEED_LERP);

        // Tilt effect
        meshRef.current.rotation.z = (pointerPos.current.x - meshRef.current.position.x) * -2;
    });

    return (
        <group ref={meshRef} position={[0, -BOUNDS.y + 2, 0]}>
            <mesh rotation={[0, 0, 0]}>
                <coneGeometry args={[0.5, 1.5, 4]} />
                <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, -0.8, 0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial color="orange" />
            </mesh>
        </group>
    );
}

function Bullet({ data, removeBullet }: { data: BulletData, removeBullet: (id: number) => void }) {
    const ref = useRef<THREE.Mesh>(null!);

    useFrame((state, delta) => {
        if (!ref.current) return;
        ref.current.position.y += BULLET_SPEED * delta;

        // Cleanup if out of bounds
        if (ref.current.position.y > BOUNDS.y) {
            removeBullet(data.id);
        }
    });

    return (
        <mesh ref={ref} position={[data.x, data.y, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="yellow" toneMapped={false} />
        </mesh>
    );
}

function Enemy({ data, removeEnemy, onGameOver }: { data: EnemyData, removeEnemy: (id: number) => void, onGameOver: () => void }) {
    const ref = useRef<THREE.Group>(null!);

    useFrame((state, delta) => {
        if (!ref.current) return;
        ref.current.position.y -= ENEMY_SPEED * delta;
        ref.current.rotation.x += delta;
        ref.current.rotation.y += delta * 0.5;

        // Cleanup if out of bounds (passed player)
        if (ref.current.position.y < -BOUNDS.y) {
            removeEnemy(data.id);
            // Optional: Lose points if missed?
        }
    });

    return (
        <group ref={ref} position={[data.x, data.y, 0]}>
            <mesh>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshStandardMaterial color="#e11d48" metalness={0.6} roughness={0.2} />
            </mesh>
            <Text
                position={[0, 0, 0.7]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000"
            >
                {data.label}
            </Text>
        </group>
    );
}

// --- Main Game Logic Component ---
function GameController({
    setScore, setGameOver, setShowPopup, isPlaying
}: {
    setScore: any, setGameOver: any, setShowPopup: any, isPlaying: boolean
}) {
    const { viewport } = useThree();
    const [bullets, setBullets] = useState<BulletData[]>([]);
    const [enemies, setEnemies] = useState<EnemyData[]>([]);

    // Refs for collision system (to avoid stale closures in useFrame)
    const bulletsRef = useRef<THREE.Mesh[]>([]);
    const enemiesRef = useRef<THREE.Group[]>([]);

    // Pointers
    const pointerPos = useRef(new THREE.Vector2(0, 0));
    const nextSpawnTime = useRef(0);

    // Input
    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            pointerPos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointerPos.current.x *= (viewport.width / 2);
        };
        const onClick = () => {
            if (!isPlaying) return;
            // Spawn bullet at current pointer X (approx player pos)
            // Ideally player pos, but pointer X matches player target X
            setBullets(prev => [...prev, {
                id: Date.now(),
                x: pointerPos.current.x,
                y: -BOUNDS.y + 3 // Start slightly above player
            }]);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("click", onClick);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("click", onClick);
        };
    }, [isPlaying, viewport.width]);

    // Game Loop
    useFrame((state) => {
        if (!isPlaying) return;
        const time = state.clock.getElapsedTime();

        // Spawning
        if (time > nextSpawnTime.current) {
            const x = THREE.MathUtils.randFloatSpread(viewport.width - 2);
            const label = CULTURE_VALUES[Math.floor(Math.random() * CULTURE_VALUES.length)];
            setEnemies(prev => [...prev, {
                id: Date.now(),
                x,
                y: BOUNDS.y, // Top
                label
            }]);
            nextSpawnTime.current = time + SPAWN_INTERVAL;
        }

        // Collision Check (Simple Distance)
        // We need access to the actual mesh positions which update in useFrame of children.
        // But we don't have refs to children here easily without forwardRef array.
        // Alternative: Calculate positions here? No, let's keep movement in children for smoothness.
        // ACTUALLY: The children update the view. The logic state is in `bullets` / `enemies`. Used for keying.
        // For collision, we need real positions.
        // Solution: Let's do simple AABB or distance check based on ESTIMATED position?
        // No, estimated is hard because delta times vary.

        // Let's use a shared ref approach where children register themselves.
        // Simpler: Just do movement logic HERE in Controller for collision reasons, 
        // and pass positions to children. React update at 60fps? 
        // No, setBullets(newPositions) is too heavy.

        // HYBRID: Children update visual. Controller checks approximate collision logic?
        // Let's go with the classic: GLOBAL MUTABLE STATE in a ref.
    });

    // REWRITE: Using a Ref-based manager for performance.
    // We will render instances, but manage logic in one place.
    return (
        <>
            <Player pointerPos={pointerPos} onShoot={() => { }} />
            <EntityManager
                bullets={bullets} setBullets={setBullets}
                enemies={enemies} setEnemies={setEnemies}
                setScore={setScore} setShowPopup={setShowPopup} setGameOver={setGameOver}
                isPlaying={isPlaying}
            />
        </>
    );
}

function EntityManager({
    bullets, setBullets, enemies, setEnemies, setScore, setShowPopup, setGameOver, isPlaying
}: any) {
    const { viewport } = useThree();

    // We update logic here
    useFrame((state, delta) => {
        if (!isPlaying) return;

        setBullets((prevBullets: BulletData[]) => {
            return prevBullets
                .map(b => ({ ...b, y: b.y + BULLET_SPEED * delta }))
                .filter(b => b.y < BOUNDS.y + 2);
        });

        setEnemies((prevEnemies: EnemyData[]) => {
            // Move enemies
            const moved = prevEnemies.map(e => ({ ...e, y: e.y - ENEMY_SPEED * delta }));

            // Check collisions
            // This is O(N*M) but N,M are small
            const survivors: EnemyData[] = [];

            moved.forEach(e => {
                let hit = false;
                // Check vs Player
                const playerDistX = Math.abs(e.x - 0); // Player is roughly at X? No player moves.
                // We don't track player X here easily. Assume player hits if y < -8?
                // Let's skip player collision for now to simplify, just focused on shooting.
                if (e.y < -BOUNDS.y) {
                    // Miss/Game Over?
                } else {
                    survivors.push(e);
                }
            });
            return survivors;
        });

        // The above approach triggers re-render every frame! BAD.
        // Rejecting this.
    });

    // BACKTRACK:
    // We will use the original "Ref-based" GameScene approach I wrote first. 
    // It was actually optimal for React Three Fiber.
    // The issue I feared (bullets not rendering) was because map() only runs on render.
    // But if I put `bullets.current` in a ref and map it... React doesn't see it.
    // So the bullets won't appear.
    // I MUST use `useState` for the *existence* of bullets.
    // But `useFrame` for position updates.

    // Correct Pattern:
    // standard `useState` for spawning/despawning.
    // Child components `Bullet` and `Enemy` use `useFrame` to update THEIR OWN Ref position.
    // Collision System needs access to those Refs.
    // 
    // Solution:
    // Pass a `register` function to children.

    return null;
}

// --- FINAL WORKING IMPLEMENTATION ---

function SceneContent({ setScore, setGameOver, setShowPopup, isPlaying }: any) {
    const { viewport } = useThree();
    // Entities state for mounting/unmounting
    const [bullets, setBullets] = useState<BulletData[]>([]);
    const [enemies, setEnemies] = useState<EnemyData[]>([]);

    // Mutable refs for physics/collision
    const bulletRefs = useRef<Map<number, THREE.Mesh>>(new Map());
    const enemyRefs = useRef<Map<number, THREE.Group>>(new Map());
    const playerRef = useRef<THREE.Group>(null!);

    const pointerPos = useRef(new THREE.Vector2(0, 0));
    const lastSpawn = useRef(0);
    const lastShot = useRef(0);

    // --- Responsive Bounds ---
    const boundX = viewport.width / 2;
    const boundY = viewport.height / 2;

    // Controls
    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            pointerPos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointerPos.current.x *= boundX;
        };
        const onDown = () => {
            if (!isPlaying) return;
            if (Date.now() - lastShot.current > 200) {
                const id = Date.now();
                setBullets(prev => [...prev, {
                    id,
                    x: playerRef.current?.position.x || 0,
                    y: -boundY + 2.5
                }]);
                lastShot.current = Date.now();
            }
        };
        const onTouch = (e: TouchEvent) => {
            if (!isPlaying) return;
            // Prevent default zooming/scrolling
            // e.preventDefault(); // Can't prevent default in passive listener easily in React without ref
            const touch = e.touches[0];
            pointerPos.current.x = (touch.clientX / window.innerWidth) * 2 - 1;
            pointerPos.current.x *= boundX;
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("touchmove", onTouch);
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") onDown();
        });
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("touchmove", onTouch);
        };
    }, [isPlaying, viewport.width, boundX, boundY]);

    useFrame((state, delta) => {
        if (!isPlaying) return;

        // 1. Move Player
        if (playerRef.current) {
            playerRef.current.position.x = THREE.MathUtils.lerp(playerRef.current.position.x, pointerPos.current.x, 0.2);
            playerRef.current.rotation.z = (pointerPos.current.x - playerRef.current.position.x) * -0.5;
            // Update player Y if viewport changed
            playerRef.current.position.y = -boundY + 2;
        }

        // 2. Spawn Enemies
        if (state.clock.elapsedTime - lastSpawn.current > SPAWN_INTERVAL) {
            const id = Date.now();
            setEnemies(prev => [...prev, {
                id,
                x: THREE.MathUtils.randFloatSpread(viewport.width - 2),
                y: boundY + 2,
                label: CULTURE_VALUES[Math.floor(Math.random() * CULTURE_VALUES.length)]
            }]);
            lastSpawn.current = state.clock.elapsedTime;
        }

        // 3. Physics & Collision (Iterate over Refs)
        bulletRefs.current.forEach((mesh, id) => {
            if (!mesh) return;
            mesh.position.y += BULLET_SPEED * delta;

            // Check Collision with Enemies
            let hit = false;
            enemyRefs.current.forEach((enemyMesh, enemyId) => {
                if (!enemyMesh || hit) return;

                if (mesh.position.distanceTo(enemyMesh.position) < 1.0) {
                    hit = true;
                    // Score
                    const enemyData = enemies.find(e => e.id === enemyId);
                    if (enemyData) {
                        setScore((s: number) => s + 10);
                        setShowPopup(enemyData.label);
                    }

                    // Destroy both
                    setBullets(prev => prev.filter(b => b.id !== id));
                    setEnemies(prev => prev.filter(e => e.id !== enemyId));
                    bulletRefs.current.delete(id);
                    enemyRefs.current.delete(enemyId);
                }
            });

            // Cleanup Out of Bounds
            if (mesh.position.y > boundY) {
                setBullets(prev => prev.filter(b => b.id !== id));
                bulletRefs.current.delete(id);
            }
        });

        enemyRefs.current.forEach((mesh, id) => {
            if (!mesh) return;
            mesh.position.y -= ENEMY_SPEED * delta;
            mesh.rotation.x += delta;
            mesh.rotation.y += delta;

            // Check Player Collision
            if (playerRef.current && mesh.position.distanceTo(playerRef.current.position) < 1.2) {
                setGameOver(true);
            }

            if (mesh.position.y < -boundY) {
                setEnemies(prev => prev.filter(e => e.id !== id));
                enemyRefs.current.delete(id);
            }
        });
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <group ref={playerRef} position={[0, -boundY + 2, 0]}>
                <mesh rotation={[0, 0, 0]}>
                    <coneGeometry args={[0.6, 1.5, 4]} />
                    <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.6} />
                </mesh>
                <mesh position={[0, -0.6, 0.4]} rotation={[0.5, 0, 0]}>
                    <boxGeometry args={[0.2, 0.5, 0.2]} />
                    <meshBasicMaterial color="gray" />
                </mesh>
                <mesh position={[0, -0.8, 0]}>
                    <sphereGeometry args={[0.3]} />
                    <meshBasicMaterial color="orange" />
                </mesh>
            </group>

            {bullets.map(b => (
                <mesh
                    key={b.id}
                    position={[b.x, b.y, 0]}
                    ref={(el) => {
                        if (el) bulletRefs.current.set(b.id, el);
                        else bulletRefs.current.delete(b.id);
                    }}
                >
                    <sphereGeometry args={[0.2, 8, 8]} />
                    <meshBasicMaterial color="yellow" />
                </mesh>
            ))}

            {enemies.map(e => (
                <group
                    key={e.id}
                    position={[e.x, e.y, 0]}
                    ref={(el) => {
                        if (el) enemyRefs.current.set(e.id, el);
                        else enemyRefs.current.delete(e.id);
                    }}
                >
                    <mesh>
                        <dodecahedronGeometry args={[0.6, 0]} />
                        <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.8} />
                    </mesh>
                    <Text
                        position={[0, 0, 0.8]}
                        fontSize={0.35}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.02}
                        outlineColor="#000"
                    >
                        {e.label}
                    </Text>
                </group>
            ))}
        </>
    );
}

export default function SpaceShooterPage() {
    const { data: session } = useSession();
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPopup, setShowPopup] = useState<string | null>(null);

    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => setShowPopup(null), 1000);
            return () => clearTimeout(timer);
        }
    }, [showPopup]);

    useEffect(() => {
        if (gameOver && score > 0) {
            saveScore();
        }
    }, [gameOver]);

    const saveScore = async () => {
        if (session?.user?.email) {
            await supabase.from("user_progress").insert({
                user_email: session.user.email,
                mission_id: stringToUUID("SPACE_CULTURE"),
                score: score,
                choice_label: "SPACE_CULTURE"
            });
        }
    };

    return (
        <div style={{ width: "100vw", height: "100vh", background: "#020617", userSelect: "none" }}>
            {/* UI Layer */}
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
                        fontSize: 28, fontWeight: 900, color: "white", textShadow: "0 0 20px #0ea5e9",
                        background: "rgba(14, 165, 233, 0.2)", padding: "8px 24px", borderRadius: 99,
                        backdropFilter: "blur(4px)", border: "1px solid rgba(14, 165, 233, 0.4)"
                    }}>
                        {score} XP
                    </div>
                </div>
            </div>

            {/* Popup */}
            {showPopup && (
                <div style={{
                    position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
                    zIndex: 20, pointerEvents: "none",
                    background: "rgba(255,255,255,0.95)", padding: "12px 24px", borderRadius: 20,
                    textAlign: "center", boxShadow: "0 0 30px rgba(14, 165, 233, 0.5)",
                    animation: "pop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)"
                }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase" }}>NILAI TERKUMPUL</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{showPopup}</div>
                </div>
            )}
            <style>{`@keyframes pop { from { opacity: 0; transform: translate(-50%, 0) scale(0.5); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }`}</style>

            <Canvas>
                <SceneContent
                    setScore={setScore}
                    setGameOver={setGameOver}
                    setShowPopup={setShowPopup}
                    isPlaying={isPlaying}
                />
            </Canvas>

            {/* Overlays */}
            {!isPlaying && !gameOver && (
                <div style={{
                    position: "absolute", inset: 0, zIndex: 30, background: "rgba(2, 6, 23, 0.8)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
                    <h1 style={{ color: "white", fontSize: 40, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>GALACTIC CULTURE</h1>
                    <p style={{ color: "#94a3b8", marginBottom: 32 }}>Tembak bola nilai positif untuk mengumpulkan poin!</p>
                    <button
                        onClick={() => setIsPlaying(true)}
                        style={{
                            background: "#0ea5e9", color: "white", border: "none", padding: "16px 40px",
                            borderRadius: 99, fontSize: 18, fontWeight: 800, cursor: "pointer",
                            boxShadow: "0 0 20px rgba(14, 165, 233, 0.4)"
                        }}
                    >
                        START MISSION
                    </button>
                    <div style={{ marginTop: 20, color: "#64748b", fontSize: 12 }}>Tap / Click to Shoot • Mouse / Drag to Move</div>
                </div>
            )}

            {gameOver && (
                <div style={{
                    position: "absolute", inset: 0, zIndex: 30, background: "rgba(15, 23, 42, 0.9)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                }}>
                    <h1 style={{ color: "#ef4444", fontSize: 48, fontWeight: 900, marginBottom: 8 }}>GAME OVER</h1>
                    <div style={{ color: "white", fontSize: 24, marginBottom: 32 }}>Score Akhir: {score}</div>
                    <button
                        onClick={() => { setScore(0); setGameOver(false); setIsPlaying(true); }}
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
