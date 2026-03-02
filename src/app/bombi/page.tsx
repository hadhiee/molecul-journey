"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
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
    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/" className={styles.backButton}>
                    ← Kembali
                </Link>
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
