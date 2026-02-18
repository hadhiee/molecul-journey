"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminLogs() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        setLoading(true);
        // Fetch progress as a proxy for activity
        const { data: progress } = await supabase
            .from("user_progress")
            .select("*")
            .order("created_at", { ascending: false });

        setLogs(progress || []);
        setLoading(false);
    }

    if (status === "loading" || loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: 'white' }}>
            Memuat Log Aktivitas...
        </div>
    );

    if (session?.user?.email !== "hadhiee@gmail.com") return null;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: "40px 20px" }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>Control Center</h1>
                        <p style={{ color: '#94a3b8', fontSize: 14 }}>User Activity & System Logs</p>
                    </div>
                    <Link href="/" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '12px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Kembali</Link>
                </div>

                <div style={{ background: '#1a1a2e', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', fontWeight: 800, color: '#e11d48', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <div>Username / Email</div>
                        <div>Aktivitas</div>
                        <div>Detail / Score</div>
                        <div>Waktu</div>
                    </div>

                    <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        {logs.length > 0 ? logs.map((log, i) => (
                            <div key={i} style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                                fontSize: 13,
                                alignItems: 'center'
                            }}>
                                <div style={{ fontWeight: 700 }}>
                                    {log.user_email ? log.user_email.split("@")[0] : "Unknown"}
                                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500 }}>{log.user_email || "no-email"}</div>
                                </div>
                                <div style={{ color: log.mission_id === 'SYSTEM_LOGIN' ? '#10b981' : '#3b82f6', fontWeight: 700 }}>
                                    {log.mission_id === 'SYSTEM_LOGIN' ? '🟢 USER LOGIN' : `🎯 MISI: ${log.mission_id.slice(0, 10)}...`}
                                </div>
                                <div>
                                    {log.mission_id === 'SYSTEM_LOGIN' ? (
                                        <span style={{ color: '#94a3b8', fontSize: 11 }}>{log.choice_label}</span>
                                    ) : (
                                        <>
                                            <span style={{ background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>+{log.score} XP</span>
                                            <span style={{ marginLeft: 8, color: '#94a3b8' }}>Choice: {log.choice_label}</span>
                                        </>
                                    )}
                                </div>
                                <div style={{ color: '#64748b' }}>
                                    {new Date(log.created_at).toLocaleString('id-ID')}
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Belum ada log aktivitas yang tercatat.</div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    <div style={{ background: '#1a1a2e', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>TOTAL AKTIVITAS</div>
                        <div style={{ fontSize: 32, fontWeight: 900 }}>{logs.length}</div>
                    </div>
                    <div style={{ background: '#1a1a2e', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>USER AKTIF</div>
                        <div style={{ fontSize: 32, fontWeight: 900 }}>{[...new Set(logs.map(l => l.user_email))].length}</div>
                    </div>
                    <div style={{ background: '#1a1a2e', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>AVG XP / MISSION</div>
                        <div style={{ fontSize: 32, fontWeight: 900 }}>
                            {logs.filter(l => l.mission_id !== 'SYSTEM_LOGIN').length > 0
                                ? Math.round(logs.filter(l => l.mission_id !== 'SYSTEM_LOGIN').reduce((a, b) => a + b.score, 0) / logs.filter(l => l.mission_id !== 'SYSTEM_LOGIN').length)
                                : 0}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
