"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import SignOutButton from "@/components/SignOutButton";

export default function ManajemenPage() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || "";

    const [xpEarned, setXpEarned] = useState(false);
    const [loading, setLoading] = useState(false);

    // Auto-earn XP after exploring for 3 seconds
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!xpEarned && userEmail) {
            timer = setTimeout(() => {
                handleEarnXP();
            }, 5000); // give points after 5s active viewing
        }
        return () => clearTimeout(timer);
    }, [xpEarned, userEmail]);

    const handleEarnXP = async () => {
        if (xpEarned || !userEmail) return;
        setLoading(true);

        try {
            // Check if already claimed from DB
            const { data: existing } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_email', userEmail)
                .eq('mission_id', 'SYSTEM_EXPLORE_MANAJEMEN')
                .single();

            if (!existing) {
                // give +15 XP
                await supabase.from("user_progress").insert({
                    user_email: userEmail,
                    mission_id: "SYSTEM_EXPLORE_MANAJEMEN",
                    score: 15,
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
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 80px' }}>
            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    ← Kembali ke Beranda
                </Link>
                <SignOutButton />
            </div>

            <div style={{
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                borderRadius: 32, padding: '48px 32px', color: 'white', marginBottom: 48,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 50px -12px rgba(15,23,42,0.3)',
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--theme-primary, #e11d48)', padding: '6px 12px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Tentang Kami
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Profil
                        </span>
                    </div>
                    <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        Manajemen Sekolah
                    </h1>
                    <p style={{ fontSize: 18, opacity: 0.9, fontWeight: 500, marginBottom: 24, maxWidth: 600, lineHeight: 1.5 }}>
                        Kenali dewan pimpinan dan struktur organisasi yang ada di SMK Telkom Malang.
                    </p>
                </div>
                <div style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', opacity: 0.2, filter: 'blur(40px)' }} />
            </div>

            <div style={{
                background: 'white', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0',
                marginBottom: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                {/* Header/Reward info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>Struktur Organisasi</h2>
                        <p style={{ fontSize: 13, color: '#64748b' }}>Bagan manajemen struktural SMK Telkom Malang</p>
                    </div>
                    {xpEarned ? (
                        <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>🎉</span> +15 XP Diraih!
                        </div>
                    ) : (
                        <div style={{ background: '#f1f5f9', color: '#64748b', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {loading ? "Menyimpan XP..." : "Membaca minimal 5 detik (+15 XP)"}
                        </div>
                    )}
                </div>

                <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', padding: 24 }}>
                    <img
                        src="https://smktelkom-mlg.sch.id/assets/upload/images/Bagan-Telkom-2026.jpg"
                        alt="Bagan Struktur Organisasi SMK Telkom Malang"
                        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                </div>
            </div>

            {/* Facts Context Section */}
            <div style={{ background: '#f8fafc', borderRadius: 24, padding: 32, border: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 24 }}>🧭</div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Pentingnya Mengenal Manajemen</h3>
                </div>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 12 }}>
                    Memahami struktur organisasi melatih kesadaran profesional (Professional Awareness). Di dunia industri nyata, Anda harus tahu siapa atasan Anda, pembagian divisi, dan ke mana harus melaporkan masalah sesuai dengan eskalasi yang tepat.
                </p>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                    Selain itu, komunikasi yang tepat sasaran juga mencegah redudansi pesan dan menjaga etika komunikasi (Respectful Communication).
                </p>
            </div>
        </div>
    );
}
