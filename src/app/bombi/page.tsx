import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

const UniformViewer = dynamic(() => import("@/components/UniformViewer"), {
    ssr: false,
    loading: () => (
        <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
            <div className={styles.loadingText}>Memuat BOMBI 3D...</div>
        </div>
    ),
});

export default function BombiPage() {
    const { data: session } = useSession();
    const [xpEarned, setXpEarned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const userEmail = session?.user?.email?.toLowerCase();

    // Auto-earn XP after exploring for 5 seconds
    useEffect(() => {
        let timer: NodeJS.Timeout;
        let interval: NodeJS.Timeout;

        if (!xpEarned && userEmail) {
            const startTime = Date.now();
            const duration = 5000;

            interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const newProgress = Math.min((elapsed / duration) * 100, 100);
                setProgress(newProgress);

                if (newProgress >= 100) {
                    clearInterval(interval);
                    handleEarnXP();
                }
            }, 100);
        }
        return () => {
            clearInterval(interval);
        };
    }, [xpEarned, userEmail]);

    const handleEarnXP = async () => {
        if (xpEarned || !userEmail) return;
        setLoading(true);

        try {
            const { data: existing } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_email', userEmail)
                .eq('mission_id', 'SYSTEM_EXPLORE_BOMBI_3D')
                .single();

            if (!existing) {
                await supabase.from("user_progress").insert({
                    user_email: userEmail,
                    mission_id: "SYSTEM_EXPLORE_BOMBI_3D",
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
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/" className={styles.backButton}>
                    ← Kembali
                </Link>

                {/* XP Reward Status */}
                <div className={styles.xpStatus}>
                    {xpEarned ? (
                        <div className={styles.xpBadgeEarned}>
                            <span>🎉</span> +25 XP Diraih!
                        </div>
                    ) : (
                        <div className={styles.xpContainer}>
                            <div className={styles.xpBadgePending}>
                                {loading ? "🔄 Menyimpan..." : `⌛ ${Math.ceil((100 - progress) / 20)}s (+25 XP)`}
                            </div>
                            <div className={styles.xpProgressOuter}>
                                <div className={styles.xpProgressInner} style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Title */}
            <div className={styles.titleSection}>
                <div className={styles.badge}>
                    <span>🤖</span> MASCOT 3D VIEWER
                </div>
                <h1 className={styles.title}>
                    <span className={styles.titleAccent}>BOMBI</span>
                </h1>
                <p className={styles.subtitle}>
                    Bocah Moklet Bionik — Maskot Kebanggaan Moklet
                </p>
            </div>

            {/* Name Banner */}
            <div className={styles.nameBanner}>
                <h2 className={styles.nameTitle}>B · O · M · B · I</h2>
                <p className={styles.nameExpand}>Bocah Moklet Bionik</p>
            </div>

            {/* 3D Viewer */}
            <div className={styles.viewerWrapper}>
                <div className={styles.viewerContainer}>
                    <UniformViewer modelUrl="/models/bombi-mascot.glb" />
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
                        <div
                            className={styles.infoCardIcon}
                            style={{
                                background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.1))",
                                border: "1px solid rgba(59,130,246,0.2)",
                            }}
                        >
                            🤖
                        </div>
                        <div>
                            <h3 className={styles.infoCardTitle}>Tentang BOMBI</h3>
                            <p className={styles.infoCardSubtitle}>Maskot Resmi Moklet</p>
                        </div>
                    </div>
                    <div className={styles.infoCardBody}>
                        <ul>
                            <li>BOMBI adalah maskot kebanggaan SMK Telkom Malang (Moklet)</li>
                            <li>Nama BOMBI singkatan dari <strong>Bocah Moklet Bionik</strong></li>
                            <li>Melambangkan semangat inovasi dan teknologi siswa Moklet</li>
                            <li>Hadir di berbagai acara sekolah dan kompetisi</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                        <div
                            className={styles.infoCardIcon}
                            style={{
                                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1))",
                                border: "1px solid rgba(139,92,246,0.2)",
                            }}
                        >
                            ⚡
                        </div>
                        <div>
                            <h3 className={styles.infoCardTitle}>Filosofi BOMBI</h3>
                            <p className={styles.infoCardSubtitle}>Lebih dari Sekadar Maskot</p>
                        </div>
                    </div>
                    <div className={styles.infoCardBody}>
                        <ul>
                            <li><strong>Bocah</strong> — Jiwa muda, kreatif, dan penuh semangat</li>
                            <li><strong>Moklet</strong> — Identitas dan kebanggaan sekolah</li>
                            <li><strong>Bionik</strong> — Berakhlak, Imaginatif, Optimis, Nasionalis, Inspiratif, dan Kreatif</li>
                            <li>Inspirasi bagi seluruh Mokleter untuk terus berinovasi</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                        <div
                            className={styles.infoCardIcon}
                            style={{
                                background: "linear-gradient(135deg, rgba(225,29,72,0.2), rgba(225,29,72,0.1))",
                                border: "1px solid rgba(225,29,72,0.2)",
                            }}
                        >
                            🏆
                        </div>
                        <div>
                            <h3 className={styles.infoCardTitle}>BOMBI & MoLeCul</h3>
                            <p className={styles.infoCardSubtitle}>Petualangan Bersama</p>
                        </div>
                    </div>
                    <div className={styles.infoCardBody}>
                        <ul>
                            <li>BOMBI menemani perjalanan budaya Mokleter di MoLeCul</li>
                            <li>Menjadi simbol semangat eksplorasi dan pembelajaran</li>
                            <li>Selalu hadir mengingatkan nilai-nilai Moklet</li>
                            <li>Bersama BOMBI, wujudkan <strong>Attitude, Tech & Industry Ready</strong></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
