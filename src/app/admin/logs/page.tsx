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
            const interval = setInterval(fetchLogs, 30000); // 30s auto-refresh
            return () => clearInterval(interval);
        }
    }, [session]);

    async function fetchLogs() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("user_progress")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(300);

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
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Accessing Control Center...</div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (session?.user?.email !== "hadhiee@gmail.com") return null;

    // Logic for Online Users (active in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const onlineUsers = allLogs.filter(l => l.mission_id === 'SYSTEM_HEARTBEAT' && l.created_at > fiveMinutesAgo);

    // Login Logs
    const loginLogs = allLogs.filter(l => l.mission_id === 'SYSTEM_LOGIN' || l.mission_id === 'SYSTEM_LOGIN_INIT');

    // Activity Logs (Game sessions)
    const missionLogs = allLogs.filter(l => l.mission_id !== 'SYSTEM_LOGIN' && l.mission_id !== 'SYSTEM_HEARTBEAT' && l.mission_id !== 'SYSTEM_LOGIN_INIT');

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: "40px 20px", fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>Moklet Intelligence Center</div>
                        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4 }}>Surveillance & Active Logs</h1>
                        <p style={{ color: '#64748b', fontSize: 14 }}>Memantau setiap pergerakan user & detak jantung sistem (heartbeat).</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={fetchLogs} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Refresh Now</button>
                        <Link href="/" style={{ background: '#e11d48', color: 'white', padding: '12px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 13, boxShadow: '0 8px 16px rgba(225,29,72,0.2)' }}>← App Home</Link>
                    </div>
                </div>

                {/* Top Section: Active Online Users */}
                <div style={{ marginBottom: 40 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#10b981', display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
                        User Sedang Online ({onlineUsers.length})
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {onlineUsers.length > 0 ? onlineUsers.map((user, i) => (
                            <div key={i} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ fontSize: 14, fontWeight: 800 }}>{user.user_email?.split('@')[0]}</div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Active</div>
                            </div>
                        )) : (
                            <div style={{ color: '#475569', fontSize: 13, fontStyle: 'italic' }}>Tidak ada user yang sedang aktif saat ini.</div>
                        )}
                    </div>
                </div>

                {/* Logs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

                    {/* Section 1: Recent Sessions & Logins */}
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#a78bfa' }}>🔐</span> Log Akses SSO & Sesi
                        </h3>
                        <div style={{ background: '#161625', borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                {loginLogs.length > 0 ? loginLogs.map((log, i) => (
                                    <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 14 }}>{log.user_email?.split('@')[0]}</div>
                                            <div style={{ fontSize: 11, color: '#64748b' }}>{log.user_email}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', marginBottom: 2 }}>Established Session</div>
                                            <div style={{ fontSize: 10, color: '#475569' }}>{new Date(log.created_at).toLocaleString('id-ID')}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 }}>Belum ada log sesi.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Real-time Game Activity */}
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#3b82f6' }}>⚡</span> Aktivitas Belajar/Game
                        </h3>
                        <div style={{ background: '#161625', borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                {missionLogs.length > 0 ? missionLogs.map((log, i) => (
                                    <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: 14 }}>{log.user_email?.split('@')[0]}</div>
                                            <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>Action: {log.mission_id}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{log.score > 0 ? `+${log.score} XP` : 'Participated'}</div>
                                            <div style={{ fontSize: 10, color: '#475569' }}>{new Date(log.created_at).toLocaleString('id-ID')}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 }}>Tidak ada aktivitas terbaru.</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Quick stats */}
                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32, display: 'flex', gap: 48 }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Total Raw Events</div>
                        <div style={{ fontSize: 24, fontWeight: 900 }}>{allLogs.length}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Unique Visitors</div>
                        <div style={{ fontSize: 24, fontWeight: 900 }}>{new Set(allLogs.map(l => l.user_email)).size}</div>
                    </div>
                </div>

            </div>
        </div>
    );
}
