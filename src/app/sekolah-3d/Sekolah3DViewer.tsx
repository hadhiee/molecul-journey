"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Sekolah3DViewer({ userEmail }: { userEmail: string }) {
    const [xpEarned, setXpEarned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showIframe, setShowIframe] = useState(true);

    // Auto-earn XP after exploring for 5 seconds
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showIframe && !xpEarned) {
            timer = setTimeout(() => {
                handleEarnXP();
            }, 5000); // give points after 5s active viewing
        }
        return () => clearTimeout(timer);
    }, [showIframe, xpEarned]);

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

    const handleIframeError = () => {
        setShowIframe(false);
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

                {/* 3D Embed Iframe / Fallback */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', minHeight: 400, background: '#0f172a', borderRadius: 16, overflow: 'hidden' }}>
                    {showIframe ? (
                        <iframe
                            src="https://studio.tripo3d.ai/3d-model/e71a75ec-3026-43ea-85a1-9d30e65a1a12?invite_code=NYGP33"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            allow="fullscreen; xr-spatial-tracking"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                            onError={handleIframeError}
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: 24, textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🏛️</div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 8 }}>Penampil 3D Diblokir Oleh Tripo3D</h3>
                            <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 400, marginBottom: 24 }}>
                                Situs eksternal tidak mengizinkan disematkan secara langsung di halaman ini. Anda bisa langsung membukanya di tab baru.
                            </p>
                            <a
                                href="https://studio.tripo3d.ai/3d-model/e71a75ec-3026-43ea-85a1-9d30e65a1a12?invite_code=NYGP33"
                                target="_blank"
                                rel="noreferrer"
                                onClick={handleEarnXP}
                                style={{
                                    background: 'var(--theme-primary, #e11d48)', color: 'white', textDecoration: 'none',
                                    padding: '14px 28px', borderRadius: 12, fontWeight: 800, fontSize: 15,
                                    boxShadow: '0 8px 16px rgba(225,29,72,0.3)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: 8
                                }}
                            >
                                Buka di Tab Baru ↗
                            </a>
                        </div>
                    )}

                    {/* Block Overlap Helper for Tripo UI if needed */}
                    {showIframe && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 12, display: 'flex', justifyContent: 'flex-end', pointerEvents: 'none' }}>
                            <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99 }}>
                                Powered by Tripo3D
                            </div>
                        </div>
                    )}
                </div>

                {/* Help Text Fallback if iframe is blocked by X-Frame but ignores React onError */}
                {showIframe && (
                    <div style={{ marginTop: 16, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                        Jika model 3D tidak muncul (layar putih/error), klik <a href="https://studio.tripo3d.ai/3d-model/e71a75ec-3026-43ea-85a1-9d30e65a1a12?invite_code=NYGP33" target="_blank" rel="noreferrer" onClick={handleEarnXP} style={{ color: '#e11d48', fontWeight: 800, textDecoration: 'underline' }}>di sini</a> untuk membuka langsung.
                    </div>
                )}
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
