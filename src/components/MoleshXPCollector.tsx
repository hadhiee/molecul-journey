"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MoleshXPCollector({
    sessionId,
    userEmail,
    xpAmount = 1000,
    sessionTitle
}: {
    sessionId: string;
    userEmail: string;
    xpAmount?: number;
    sessionTitle: string;
}) {
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkCompletion();
    }, [sessionId, userEmail]);

    async function checkCompletion() {
        if (!userEmail) return;
        const { data } = await supabase
            .from("user_progress")
            .select("id")
            .eq("user_email", userEmail)
            .eq("mission_id", sessionId)
            .single();

        if (data) setCompleted(true);
    }

    async function collectXP() {
        if (completed || loading) return;
        setLoading(true);

        try {
            const { error } = await supabase.from("user_progress").insert({
                user_email: userEmail,
                mission_id: sessionId,
                score: xpAmount,
                metadata: { type: "MOLESH", title: sessionTitle, collected_at: new Date().toISOString() }
            });

            if (!error) {
                setCompleted(true);
                // Show success effect / Toast (simple alert for now or state change)
                alert(`Selamat! Anda berhasil mengumpulkan ${xpAmount} XP Leadership ⚡`);
                router.refresh();
            } else {
                console.error("XP Error:", error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ marginTop: 40, padding: '24px', background: '#f8fafc', borderRadius: 24, border: '2px dashed #e2e8f0', textAlign: 'center' }}>
            {completed ? (
                <div>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#059669', marginBottom: 4 }}>Pilar {sessionId.split("_")[1]} Selesai!</div>
                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Telah berhasil dikumpulkan ke portofolio Anda.</div>
                </div>
            ) : (
                <div>
                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 16 }}>
                        Sudah selesai mempelajari materi ini? Klik di bawah untuk mencatat progres kepemimpinanmu.
                    </div>
                    <button
                        onClick={collectXP}
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                            color: 'white',
                            padding: '16px 32px',
                            borderRadius: 16,
                            border: 'none',
                            fontSize: 15,
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 8px 16px rgba(99,102,241,0.3)',
                            opacity: loading ? 0.7 : 1,
                            transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        {loading ? "Mencatat..." : "KUMPULKAN NILAI (1.000 XP) ⚡"}
                    </button>
                </div>
            )}
        </div>
    );
}
