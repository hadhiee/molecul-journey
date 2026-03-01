"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useState } from "react";

export default function ProfilYPTPage() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <Link href="/" className={styles.backButton} aria-label="Kembali ke Beranda">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div>
                    <h1 className={styles.headerTitle}>Profil Yayasan Pendidikan Telkom</h1>
                    <div className={styles.headerSubtitle}>
                        Mengenal lebih dekat Telkom Schools & YPT
                    </div>
                </div>
            </header>

            <main className={styles.content}>
                <section className={styles.videoSection}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                                <line x1="7" y1="2" x2="7" y2="22"></line>
                                <line x1="17" y1="2" x2="17" y2="22"></line>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <line x1="2" y1="7" x2="7" y2="7"></line>
                                <line x1="2" y1="17" x2="7" y2="17"></line>
                                <line x1="17" y1="17" x2="22" y2="17"></line>
                                <line x1="17" y1="7" x2="22" y2="7"></line>
                            </svg>
                        </div>
                        <div>
                            <h2 className={styles.sectionTitle}>Galeri Video YPT</h2>
                            <p className={styles.sectionDesc}>
                                Pilih dan putar video profil, mars, dan lagu-lagu resmi di bawah ini (Klik 2x / Open Thumbnail pada file video).
                            </p>
                        </div>
                    </div>

                    <div className={styles.iframeContainer}>
                        {isLoading && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', background: '#f8fafc', zIndex: 5,
                                color: '#e11d48', fontWeight: 'bold'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }}>
                                    <line x1="12" y1="2" x2="12" y2="6"></line>
                                    <line x1="12" y1="18" x2="12" y2="22"></line>
                                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                    <line x1="2" y1="12" x2="6" y2="12"></line>
                                    <line x1="18" y1="12" x2="22" y2="12"></line>
                                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                </svg>
                                Memuat Direktori Video...
                            </div>
                        )}
                        <iframe
                            src="https://drive.google.com/embeddedfolderview?id=10rcetUCFeEYTDskT5PVOiEZivxdESoCE#grid"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title="Direktori Video YPT"
                            onLoad={() => setIsLoading(false)}
                            allow="autoplay; encrypted-media"
                        ></iframe>
                    </div>
                </section>
            </main>
        </div>
    );
}
