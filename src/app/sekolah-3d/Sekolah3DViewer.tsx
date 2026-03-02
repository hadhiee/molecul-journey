"use client";

import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage, Html } from "@react-three/drei";

function Model() {
    const { scene } = useGLTF("/models/gedung-sekolah.glb");
    return <primitive object={scene} />;
}

export default function Sekolah3DViewer({ userEmail }: { userEmail: string }) {
    const [xpEarned, setXpEarned] = useState(false);
    const [loading, setLoading] = useState(false);

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
            // Check if already claimed from DB
            const { data: existing } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_email', userEmail)
                .eq('mission_id', 'SYSTEM_EXPLORE_SEKOLAH_3D')
                .single();

            if (!existing) {
                // give +25 XP
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
                        <p style={{ fontSize: 13, color: '#64748b' }}>Putar dan perbesar model simulasi kampus IT Telkom Schools</p>
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
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', minHeight: 400, background: 'linear-gradient(to bottom, #0f172a, #1e293b)', borderRadius: 16, overflow: 'hidden', cursor: 'grab' }}>
                    <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
                        <Suspense fallback={
                            <Html center>
                                <div style={{ color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>Memuat Model 3D...</div>
                            </Html>
                        }>
                            <Stage environment="city" intensity={0.5}>
                                <Model />
                            </Stage>
                        </Suspense>
                        <OrbitControls autoRotate autoRotateSpeed={0.5} makeDefault minDistance={2} maxDistance={25} maxPolarAngle={Math.PI / 2} />
                    </Canvas>
                    <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8, pointerEvents: 'none' }}>
                        <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99 }}>
                            ← Geser untuk memutar
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99 }}>
                            🔍 Scroll untuk zoom
                        </div>
                    </div>
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
