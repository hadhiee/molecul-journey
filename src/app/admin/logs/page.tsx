"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminLogs() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [allLogs, setAllLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated" && session?.user?.email !== "hadhiee@gmail.com") {
            router.push("/");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.email === "hadhiee@gmail.com") {
            fetchLogs();
        }
    }, [session]);

    async function fetchLogs() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("user_progress")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(200);

            if (error) throw error;
            setAllLogs(data || []);
        } catch (e) {
            console.error("Fetch logs failed:", e);
        } finally {
            setLoading(false);
        }
    }

    if (!mounted || status === "loading" || (loading && allLogs.length === 0)) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: 'white', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#e11d48', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mengambil Data Autentikasi...</div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (session?.user?.email !== "hadhiee@gmail.com") return null;

    const loginLogs = allLogs.filter(l => l.mission_id === 'SYSTEM_LOGIN');
    const missionLogs = allLogs.filter(l => l.mission_id !== 'SYSTEM_LOGIN');

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: "40px 20px", fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>Admin Superuser</div>
                        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4 }}>Surveillance Dashboard</h1>
                        <p style={{ color: '#64748b', fontSize: 14 }}>Memantau akses SSO dan aktivitas belajar secara real-time.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={fetchLogs} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Refresh Data</button>
                        <Link href="/" style={{ background: '#e11d48', color: 'white', padding: '12px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 13, boxShadow: '0 8px 16px rgba(225,29,72,0.2)' }}>← Kembali ke App</Link>
                    </div>
                </div>

                {/* Stats Quick Look */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
                    {[
                        { label: 'Total Logs', value: allLogs.length, color: '#fff' },
                        { label: 'Total Logins', value: loginLogs.length, color: '#10b981' },
                        { label: 'Total Missions', value: missionLogs.length, color: '#3b82f6' },
                        { label: 'Unique Users', value: new Set(allLogs.map(l => l.user_email)).size, color: '#f59e0b' }
                    ].map((stat, i) => (
                        <div key={i} style={{ background: '#161625', padding: '24px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

                    {/* Section 1: Recent Logins */}
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#10b981' }}>🟢</span> Login Terakhir (SSO)
                        </h3>
                        <div style={{ background: '#161625', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {loginLogs.length > 0 ? loginLogs.map((log, i) => (
                                    <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 14 }}>{log.user_email?.split('@')[0]}</div>
                                            <div style={{ fontSize: 11, color: '#64748b' }}>{log.user_email}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>LoggedIn</div>
                                            <div style={{ fontSize: 10, color: '#475569' }}>{new Date(log.created_at).toLocaleString('id-ID')}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 }}>Belum ada data login.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Recent Mission Activity */}
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#3b82f6' }}>🎯</span> Aktivitas Misi
                        </h3>
                        <div style={{ background: '#161625', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {missionLogs.length > 0 ? missionLogs.map((log, i) => (
                                    <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 14 }}>{log.user_email?.split('@')[0]}</div>
                                            <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>Misi: {log.mission_id?.slice(0, 8)}...</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>+{log.score} XP</div>
                                            <div style={{ fontSize: 10, color: '#475569' }}>{new Date(log.created_at).toLocaleString('id-ID')}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 }}>Belum ada aktivitas misi.</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
