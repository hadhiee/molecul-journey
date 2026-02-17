"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function MissionPlay() {
    const { id } = useParams();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [scenario, setScenario] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [saving, setSaving] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchScenario() {
            const { data } = await supabase
                .from("scenarios")
                .select("*")
                .eq("id", id)
                .single();
            setScenario(data);
            setLoading(false);
        }
        fetchScenario();
    }, [id]);

    const handleSelect = (index: number) => {
        if (showResult) return;
        setSelectedChoice(index);
    };

    const getScore = (choiceId: string) => {
        if (choiceId === 'A') return 3;
        if (choiceId === 'B') return 2;
        return 0;
    };

    const submitChoice = async () => {
        if (selectedChoice === null || !session?.user?.email) return;
        setSaving(true);
        const choice = scenario.choices[selectedChoice];
        const score = getScore(choice.id) * 100;

        await supabase.from("user_progress").insert({
            user_email: session.user.email,
            mission_id: scenario.id,
            score: score,
            choice_label: choice.id
        });

        setShowResult(true);
        setSaving(false);
    };

    if (status === "loading" || loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as const, gap: 16, background: '#f0f2f5' }}>
            <div style={{ width: 36, height: 36, border: '4px solid #fee2e2', borderTopColor: '#e11d48', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }}>Memuat Skenario...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!scenario) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', color: '#94a3b8', fontWeight: 700 }}>
            Misi Tidak Ditemukan
        </div>
    );

    const isPerfect = selectedChoice !== null && getScore(scenario.choices[selectedChoice].id) === 3;

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 48px' }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Link href={`/chapter/${scenario.chapter}`} style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textDecoration: 'none' }}>
                    ← Keluar
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{session?.user?.name?.split(" ")[0]}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', padding: '6px 12px', borderRadius: 99 }}>
                        #{scenario.id.slice(0, 6)}
                    </span>
                </div>
            </div>

            {/* Scenario Card */}
            <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 24, boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06)' }}>
                <div style={{ height: 5, background: 'linear-gradient(90deg, #e11d48, #f43f5e, #fb7185)' }} />
                <div style={{ padding: 24 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.3, marginBottom: 16 }}>
                        {scenario.title}
                    </h1>
                    <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 16, padding: 20, fontSize: 15, lineHeight: 1.7, color: '#475569', fontStyle: 'italic' }}>
                        &ldquo;{scenario.context}&rdquo;
                    </div>
                </div>
            </div>

            {/* Choices */}
            {!showResult && (
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: 14 }}>
                        Pilih Respons Terbaikmu:
                    </div>
                    {scenario.choices?.map((choice: any, i: number) => {
                        const isSelected = selectedChoice === i;
                        return (
                            <div
                                key={i}
                                onClick={() => handleSelect(i)}
                                style={{
                                    background: isSelected ? '#fff1f2' : 'white',
                                    border: isSelected ? '2px solid #e11d48' : '2px solid #e5e7eb',
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 10,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 14,
                                    cursor: 'pointer',
                                    boxShadow: isSelected ? '0 0 0 3px rgba(225,29,72,0.1)' : 'none',
                                }}
                            >
                                <div style={{
                                    width: 36, height: 36, minWidth: 36,
                                    borderRadius: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: 15,
                                    background: isSelected ? '#e11d48' : '#f1f5f9',
                                    color: isSelected ? 'white' : '#94a3b8',
                                    flexShrink: 0,
                                }}>
                                    {choice.id}
                                </div>
                                <div style={{
                                    fontSize: 14, fontWeight: 600, color: isSelected ? '#1a1a2e' : '#475569',
                                    lineHeight: 1.5, paddingTop: 6,
                                }}>
                                    {choice.label}
                                </div>
                            </div>
                        );
                    })}
                    <button
                        disabled={selectedChoice === null || saving}
                        onClick={submitChoice}
                        style={{
                            width: '100%', padding: 18, border: 'none', borderRadius: 16,
                            background: (selectedChoice === null || saving) ? '#fda4af' : '#e11d48',
                            color: 'white', fontSize: 14, fontWeight: 800,
                            textTransform: 'uppercase' as const, letterSpacing: '0.15em',
                            cursor: (selectedChoice === null || saving) ? 'not-allowed' : 'pointer',
                            marginTop: 6,
                            boxShadow: (selectedChoice !== null && !saving) ? '0 8px 20px -4px rgba(225,29,72,0.35)' : 'none',
                            opacity: (selectedChoice === null || saving) ? 0.5 : 1,
                        }}
                    >
                        {saving ? "Menyimpan..." : "Kirim Jawaban"}
                    </button>
                </div>
            )}

            {/* Result */}
            {showResult && selectedChoice !== null && (
                <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.08)', marginTop: 8 }}>
                    <div style={{ height: 5, background: isPerfect ? '#22c55e' : '#f59e0b' }} />
                    <div style={{ padding: 24 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 4 }}>
                            Hasil Analisis
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: isPerfect ? '#16a34a' : '#d97706', marginBottom: 16 }}>
                            {isPerfect ? "🎉 Luar Biasa!" : "⚠️ Masih Bisa Lebih Baik"}
                        </div>
                        <div style={{ background: '#1a1a2e', color: 'white', borderRadius: 16, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <span style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Courier New', monospace" }}>+{getScore(scenario.choices[selectedChoice].id) * 100}</span>
                            <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' as const, fontWeight: 700, letterSpacing: '0.1em' }}>XP Diterima</span>
                        </div>

                        <div style={{
                            background: isPerfect ? '#f0fdf4' : '#fffbeb',
                            borderLeft: `5px solid ${isPerfect ? '#22c55e' : '#f59e0b'}`,
                            padding: 20, borderRadius: 12, marginBottom: 24,
                            fontSize: 14, lineHeight: 1.7, color: '#1a1a2e', fontWeight: 600,
                        }}>
                            {scenario.choices[selectedChoice].feedback}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                            <Link href={`/chapter/${scenario.chapter}`} style={{
                                display: 'block', textAlign: 'center' as const, padding: 16, borderRadius: 14,
                                background: '#f1f5f9', color: '#475569', fontSize: 12, fontWeight: 800,
                                textTransform: 'uppercase' as const, letterSpacing: '0.1em', textDecoration: 'none',
                            }}>
                                Daftar Misi
                            </Link>
                            <Link href="/" style={{
                                display: 'block', textAlign: 'center' as const, padding: 16, borderRadius: 14,
                                background: '#1a1a2e', color: 'white', fontSize: 12, fontWeight: 800,
                                textTransform: 'uppercase' as const, letterSpacing: '0.1em', textDecoration: 'none',
                                boxShadow: '0 6px 12px -2px rgba(0,0,0,0.15)',
                            }}>
                                Halaman Utama
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
