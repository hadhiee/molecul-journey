"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage, Html } from "@react-three/drei";
import * as THREE from "three";

function Model({ autoRotate }: { autoRotate: boolean }) {
    const { scene } = useGLTF("/models/gedung-sekolah.glb");
    const modelRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (scene) {
            // Center and scale the model dynamically so it doesn't look too small
            const box = new THREE.Box3().setFromObject(scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 8 / maxDim; // Normalize its size to be bigger

            scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
            scene.scale.setScalar(scale);

            scene.traverse((child: any) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        }
    }, [scene]);

    useFrame((_, delta) => {
        // We handle custom rotation because OrbitControls autoRotate conflicts with Pan and manual state
        if (modelRef.current && autoRotate) {
            modelRef.current.rotation.y += delta * 0.15;
        }
    });

    return (
        <group ref={modelRef}>
            <primitive object={scene} />
        </group>
    );
}

function CameraController({ zoom }: { zoom: number }) {
    const { camera } = useThree();

    useEffect(() => {
        (camera as THREE.PerspectiveCamera).zoom = zoom;
        camera.updateProjectionMatrix();
    }, [camera, zoom]);

    return null;
}

export default function Sekolah3DViewer({ userEmail }: { userEmail: string }) {
    const [xpEarned, setXpEarned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const [zoom, setZoom] = useState(1);
    const controlsRef = useRef<any>(null);

    // Auto-earn XP after exploring for 5 seconds
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!xpEarned) {
            timer = setTimeout(() => {
                handleEarnXP();
            }, 5000); // give points after 5s active viewing
        }
        return () => clearTimeout(timer);
    }, [xpEarned]);

    const handleEarnXP = async () => {
        if (xpEarned || !userEmail) return;
        setLoading(true);

        try {
            const { data: existing } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_email', userEmail)
                .eq('mission_id', 'SYSTEM_EXPLORE_SEKOLAH_3D')
                .single();

            if (!existing) {
                await supabase.from("user_progress").insert({
                    user_email: userEmail,
                    mission_id: "SYSTEM_EXPLORE_SEKOLAH_3D",
                    score: 25,
                    created_at: new Date().toISOString()
                });
            }
            setXpEarned(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 0.2, 3));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 0.2, 0.5));
    }, []);

    const handleReset = useCallback(() => {
        setZoom(1);
        setAutoRotate(true);
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    }, []);

    return (
        <>
            <div style={{
                background: 'white', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0',
                marginBottom: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                {/* Header/Reward info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>Interactive Viewer</h2>
                        <p style={{ fontSize: 13, color: '#64748b' }}>Putar dan perbesar model Gedung SMK Telkom Malang</p>
                    </div>
                    {xpEarned ? (
                        <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>🎉</span> +25 XP Diraih!
                        </div>
                    ) : (
                        <div style={{ background: '#f1f5f9', color: '#64748b', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {loading ? "Menyimpan XP..." : "Jelajahi minimal 5 detik (+25 XP)"}
                        </div>
                    )}
                </div>

                {/* 3D Embed */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', minHeight: 400, background: 'linear-gradient(to bottom, #0f172a, #1e293b)', borderRadius: 16, overflow: 'hidden', cursor: 'grab', touchAction: 'none' }}>
                    <Canvas shadows camera={{ position: [0, 5, 12], fov: 45 }} style={{ touchAction: 'none' }}>
                        <CameraController zoom={zoom} />
                        <Suspense fallback={
                            <Html center>
                                <div style={{ color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>Memuat Model 3D...</div>
                            </Html>
                        }>
                            <Stage environment="city" intensity={0.5}>
                                <Model autoRotate={autoRotate} />
                            </Stage>
                        </Suspense>
                        <OrbitControls
                            ref={controlsRef}
                            makeDefault
                            minDistance={2}
                            maxDistance={35}
                            maxPolarAngle={Math.PI / 2 - 0.05}
                            enablePan={true}
                            enableZoom={true}
                            zoomSpeed={1.5}
                            panSpeed={1.5}
                            rotateSpeed={0.8}
                            enableDamping={true}
                            dampingFactor={0.05}
                            onStart={() => setAutoRotate(false)} // Stop auto spinning when user interacts
                        />
                    </Canvas>

                    {/* Canvas Controls UI overlays */}
                    <div style={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        zIndex: 15,
                    }}>
                        <button
                            onClick={handleZoomIn}
                            style={{
                                width: 40, height: 40, borderRadius: 12, border: 'none', outline: 'none',
                                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
                                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
                                color: 'white', fontSize: 18, fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >+</button>
                        <button
                            onClick={handleZoomOut}
                            style={{
                                width: 40, height: 40, borderRadius: 12, border: 'none', outline: 'none',
                                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
                                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
                                color: 'white', fontSize: 18, fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >−</button>
                        <button
                            onClick={handleReset}
                            style={{
                                width: 40, height: 40, borderRadius: 12, border: 'none', outline: 'none',
                                background: 'rgba(59,130,246,0.2)', backdropFilter: 'blur(12px)',
                                boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.3)',
                                color: '#93c5fd', fontSize: 14, fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginTop: 2,
                            }}
                        >↺</button>
                    </div>

                    <button
                        onClick={() => setAutoRotate(!autoRotate)}
                        style={{
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 14px',
                            border: 'none', outline: 'none',
                            background: autoRotate ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(8px)',
                            boxShadow: `inset 0 0 0 1px ${autoRotate ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: 10,
                            color: autoRotate ? '#93c5fd' : 'rgba(255,255,255,0.4)',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            zIndex: 15,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <span style={{
                            display: 'inline-block',
                            animation: autoRotate ? 'spin 2s linear infinite' : 'none',
                        }}>🔄</span>
                        {autoRotate ? 'Auto Putar: ON' : 'Auto Putar: OFF'}
                    </button>
                    <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
                </div>
            </div>

            {/* Facts Context Section */}
            <div style={{ background: '#f8fafc', borderRadius: 24, padding: 32, border: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 24 }}>🏢</div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Ruang dan Karakter</h3>
                </div>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 12 }}>
                    Menurut ahli perilaku lingkungan, desain dan tata letak ruang sekolah memiliki dampak signifikan secara kognitif. Lingkungan yang rapi, fasilitas yang modern, serta zona-zona terbuka di Moklet membantu merangsang kreativitas siswa dan menurunkan tingkat stres akademis (Beban Kognitif).
                </p>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                    Dengan menjelajahi gedung sekolah secara 3D, Anda berlatih pengenalan spasial dan merefleksikan bahwa sekolah bukan hanya sekadar bangunan, tapi "Training Ground" untuk mencetak SDM unggul di masa depan!
                </p>
            </div>
        </>
    );
}
