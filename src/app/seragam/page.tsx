"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

// Dynamic import to avoid SSR issues with Three.js
const UniformViewer = dynamic(() => import("@/components/UniformViewer"), {
    ssr: false,
    loading: () => (
        <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
            <div className={styles.loadingText}>Memuat 3D Viewer...</div>
        </div>
    ),
});

const UNIFORMS = [
    {
        id: "senin-upacara",
        day: "Senin (Minggu 1)",
        label: "Seragam Upacara",
        description: "Seragam upacara lengkap Senin minggu pertama",
        modelUrl: "/models/seragam-senin-upacara.glb",
        color: "#dc2626",
        bgGradient: "linear-gradient(135deg, rgba(220,38,38,0.2), rgba(220,38,38,0.1))",
        borderColor: "rgba(220,38,38,0.3)",
        icon: "🇮🇩",
        xpReward: 5,
        details: [
            "Seragam putih lengkap untuk upacara bendera",
            "Topi dan dasi wajib dikenakan",
            "Dipakai setiap Senin minggu pertama setiap bulan",
            "Sepatu hitam mengkilap dan kaus kaki putih",
        ],
    },
    {
        id: "senin",
        day: "Senin",
        label: "Seragam Putih",
        description: "Seragam putih formal hari Senin",
        modelUrl: "/models/seragam-senin.glb",
        color: "#e11d48",
        bgGradient: "linear-gradient(135deg, rgba(225,29,72,0.2), rgba(225,29,72,0.1))",
        borderColor: "rgba(225,29,72,0.3)",
        icon: "🏫",
        xpReward: 5,
        details: [
            "Kemeja putih lengan panjang dengan logo sekolah",
            "Celana/rok biru navy rapi",
            "Dasi dan topi sesuai ketentuan upacara",
            "Sepatu hitam dan kaus kaki putih",
        ],
    },
    {
        id: "selasa",
        day: "Selasa",
        label: "Seragam Vest Maroon",
        description: "Seragam harian dengan rompi maroon khas Moklet",
        modelUrl: "/models/seragam-selasa.glb",
        color: "#8b5cf6",
        bgGradient: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1))",
        borderColor: "rgba(139,92,246,0.3)",
        icon: "👔",
        xpReward: 5,
        details: [
            "Kemeja putih lengan pendek dengan logo sekolah",
            "Rompi/vest maroon sebagai identitas khas Moklet",
            "Celana/rok biru navy rapi",
            "Sepatu hitam dan kaus kaki putih",
        ],
    },
    {
        id: "rabu",
        day: "Rabu",
        label: "Seragam Almamater",
        description: "Seragam Jas Almamater per Angkatan",
        modelUrl: "/models/seragam-rabu.glb",
        color: "#0ea5e9",
        bgGradient: "linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.1))",
        borderColor: "rgba(14,165,233,0.3)",
        icon: "🧥",
        xpReward: 5,
        details: [
            "Kemeja putih dengan Jas Almamater angkatan",
            "Digunakan pada hari Rabu/acara khusus angkatan",
            "Celana/rok biru navy rapi",
            "Sepatu hitam pantofel/formal",
        ],
    },
    {
        id: "kamis",
        day: "Kamis",
        label: "Batik Telkom Schools",
        description: "Seragam Batik Identitas Telkom Schools",
        modelUrl: "/models/seragam-kamis.glb",
        color: "#1d4ed8",
        bgGradient: "linear-gradient(135deg, rgba(29,78,216,0.2), rgba(29,78,216,0.1))",
        borderColor: "rgba(29,78,216,0.3)",
        icon: "🎨",
        xpReward: 5,
        details: [
            "Baju atasan Batik Telkom Schools khas Moklet",
            "Celana/rok hitam panjang rapi",
            "Identitas budaya sekolah Telkom",
            "Sepatu hitam dominan",
        ],
    },
    {
        id: "kamis-putra",
        day: "Kamis (Putra)",
        label: "Batik TS Putra",
        description: "Seragam Batik Telkom Schools untuk siswa laki-laki",
        modelUrl: "/models/seragam-kamis-putra.glb",
        color: "#1e40af",
        bgGradient: "linear-gradient(135deg, rgba(30,64,175,0.2), rgba(30,64,175,0.1))",
        borderColor: "rgba(30,64,175,0.3)",
        icon: "👨‍🎓",
        xpReward: 5,
        details: [
            "Baju atasan Batik Telkom Schools putra",
            "Celana hitam panjang rapi",
            "Identitas budaya sekolah Telkom",
            "Sepatu hitam dominan",
        ],
    },
    {
        id: "jumat",
        day: "Jumat",
        label: "Seragam Pramuka",
        description: "Seragam Pramuka lengkap hari Jumat",
        modelUrl: "/models/seragam-jumat.glb",
        color: "#92400e",
        bgGradient: "linear-gradient(135deg, rgba(146,64,14,0.2), rgba(146,64,14,0.1))",
        borderColor: "rgba(146,64,14,0.3)",
        icon: "🛡️",
        xpReward: 5,
        details: [
            "Seragam Pramuka lengkap dengan atributnya",
            "Hasduk/setangan leher dipasang rapi",
            "Baret atau topi pramuka bagi putri",
            "Sepatu hitam dan kaus kaki hitam",
        ],
    },
];

export default function SeragamPage() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email;

    const [activeTab, setActiveTab] = useState(0);
    const [exploredTabs, setExploredTabs] = useState<Set<string>>(new Set(["senin-upacara"]));
    const [xpToast, setXpToast] = useState<{ show: boolean; amount: number; label: string }>({ show: false, amount: 0, label: "" });
    const [totalEarnedXP, setTotalEarnedXP] = useState(0);

    const activeUniform = UNIFORMS[activeTab];

    // Load explored tabs from localStorage + Supabase
    useEffect(() => {
        if (!userEmail) return;
        const stored = localStorage.getItem(`seragam_explored_${userEmail}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            setExploredTabs(new Set(parsed));
            setTotalEarnedXP(parsed.length * 5);
        }
    }, [userEmail]);

    // Save XP to Supabase
    const saveXP = useCallback(async (uniformId: string, xp: number) => {
        if (!userEmail) return;
        const missionId = `SERAGAM_3D_${uniformId.toUpperCase()}`;
        try {
            // Check if already saved
            const { data: existing } = await supabase
                .from("user_progress")
                .select("id")
                .eq("user_email", userEmail)
                .eq("mission_id", missionId)
                .maybeSingle();

            if (!existing) {
                await supabase.from("user_progress").insert({
                    user_email: userEmail,
                    mission_id: missionId,
                    score: xp,
                    completed_at: new Date().toISOString(),
                });
            }
        } catch (e) {
            console.error("Failed to save seragam XP:", e);
        }
    }, [userEmail]);

    // Handle tab click with XP
    const handleTabClick = useCallback((index: number) => {
        const uniform = UNIFORMS[index];
        setActiveTab(index);

        if (!exploredTabs.has(uniform.id)) {
            const newExplored = new Set(exploredTabs);
            newExplored.add(uniform.id);
            setExploredTabs(newExplored);
            setTotalEarnedXP(newExplored.size * 5);

            // Save to localStorage
            if (userEmail) {
                localStorage.setItem(`seragam_explored_${userEmail}`, JSON.stringify([...newExplored]));
            }

            // Show XP toast
            setXpToast({ show: true, amount: uniform.xpReward, label: uniform.label });
            setTimeout(() => setXpToast({ show: false, amount: 0, label: "" }), 2500);

            // Save to Supabase
            saveXP(uniform.id, uniform.xpReward);
        }
    }, [exploredTabs, userEmail, saveXP]);

    const exploredCount = exploredTabs.size;
    const totalUniforms = UNIFORMS.length;
    const progressPercent = (exploredCount / totalUniforms) * 100;
    const allExplored = exploredCount === totalUniforms;

    return (
        <div className={styles.container}>
            {/* XP Toast */}
            {xpToast.show && (
                <div className={styles.xpToast}>
                    <div className={styles.xpToastInner}>
                        <span className={styles.xpToastIcon}>⚡</span>
                        <div>
                            <div className={styles.xpToastTitle}>+{xpToast.amount} XP</div>
                            <div className={styles.xpToastLabel}>Menjelajahi {xpToast.label}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className={styles.header}>
                <Link href="/" className={styles.backButton}>
                    ← Kembali
                </Link>
            </div>

            {/* Title */}
            <div className={styles.titleSection}>
                <div className={styles.badge}>
                    <span>👔</span> 3D PREVIEW
                </div>
                <h1 className={styles.title}>Seragam Mokleter</h1>
                <p className={styles.subtitle}>
                    Model 3D seragam siswa SMK Telkom Malang
                </p>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                    <div className={styles.progressLabel}>
                        <span>🎯</span> Eksplorasi Seragam
                    </div>
                    <div className={styles.progressStats}>
                        <span className={styles.progressXP}>⚡ {totalEarnedXP} XP</span>
                        <span className={styles.progressCount}>{exploredCount}/{totalUniforms}</span>
                    </div>
                </div>
                <div className={styles.progressBarOuter}>
                    <div
                        className={styles.progressBarInner}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                {allExplored && (
                    <div className={styles.progressComplete}>
                        🎉 Semua seragam sudah dijelajahi! +25 XP Total
                    </div>
                )}
            </div>

            {/* Day Tabs */}
            <div className={styles.tabContainer}>
                {UNIFORMS.map((uniform, index) => (
                    <button
                        key={uniform.id}
                        className={`${styles.tab} ${activeTab === index ? styles.tabActive : ""}`}
                        onClick={() => handleTabClick(index)}
                        style={{
                            "--tab-color": uniform.color,
                        } as React.CSSProperties}
                    >
                        <span className={styles.tabIcon}>{uniform.icon}</span>
                        <div className={styles.tabContent}>
                            <span className={styles.tabDay}>{uniform.day}</span>
                            <span className={styles.tabLabel}>{uniform.label}</span>
                        </div>
                        {exploredTabs.has(uniform.id) ? (
                            <span className={styles.tabCheck}>✓</span>
                        ) : (
                            <span className={styles.tabNew}>+{uniform.xpReward}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* 3D Viewer */}
            <div className={styles.viewerWrapper}>
                <div className={styles.viewerContainer}>
                    <UniformViewer
                        key={activeUniform.id}
                        modelUrl={activeUniform.modelUrl}
                    />
                </div>
            </div>

            {/* Controls Hint */}
            <div className={styles.controls}>
                <div className={styles.controlHint}>
                    <div className={styles.hintItem}>
                        <div className={styles.hintIcon}>👆</div>
                        <span>Geser untuk memutar</span>
                    </div>
                    <div className={styles.hintItem}>
                        <div className={styles.hintIcon}>🤏</div>
                        <span>Pinch untuk zoom</span>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className={styles.infoSection}>
                <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                        <div className={styles.infoCardIcon} style={{
                            background: activeUniform.bgGradient,
                            border: `1px solid ${activeUniform.borderColor}`,
                        }}>
                            {activeUniform.icon}
                        </div>
                        <div>
                            <h3 className={styles.infoCardTitle}>{activeUniform.label}</h3>
                            <p className={styles.infoCardSubtitle}>Hari {activeUniform.day}</p>
                        </div>
                    </div>
                    <div className={styles.infoCardBody}>
                        <ul>
                            {activeUniform.details.map((detail, i) => (
                                <li key={i}>{detail}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                        <div className={styles.infoCardIcon} style={{
                            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.1))",
                            border: "1px solid rgba(99,102,241,0.2)",
                        }}>🎓</div>
                        <div>
                            <h3 className={styles.infoCardTitle}>Identitas Mokleter</h3>
                            <p className={styles.infoCardSubtitle}>Tampil Rapi, Berkarakter</p>
                        </div>
                    </div>
                    <div className={styles.infoCardBody}>
                        <ul>
                            <li>Rompi maroon menjadi ciri khas yang membedakan siswa Moklet</li>
                            <li>Menjaga kerapian seragam bagian dari budaya <strong>ATTITUDE</strong></li>
                            <li>Seragam mencerminkan kedisiplinan dan profesionalisme</li>
                            <li>Berpakaian rapi menunjukkan kesiapan belajar</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                        <div className={styles.infoCardIcon} style={{
                            background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))",
                            border: "1px solid rgba(34,197,94,0.2)",
                        }}>📋</div>
                        <div>
                            <h3 className={styles.infoCardTitle}>Tips Berseragam</h3>
                            <p className={styles.infoCardSubtitle}>Agar Selalu Tampil Prima</p>
                        </div>
                    </div>
                    <div className={styles.infoCardBody}>
                        <ul>
                            <li>Pastikan seragam selalu bersih dan disetrika rapi</li>
                            <li>Kancing kemeja terpasang dengan benar</li>
                            <li>Rompi dikenakan di atas kemeja dengan rapi</li>
                            <li>Nama dan badge terpasang sesuai ketentuan</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
