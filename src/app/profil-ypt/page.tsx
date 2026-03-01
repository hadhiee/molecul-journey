"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useState } from "react";

const VIDEOS = [
    { id: "1TNoXMCIMLYatRp4rosk2t20sCJwZz3r9", title: "Company Profile YPT" },
    { id: "1IVq8mr8h8H9PFjHNZzlFwM02hCneAsml", title: "Company Profile Telkom Schools" },
    { id: "1k5g3XJjVpspUVZK0Rtm7pXcZQqkd7p1M", title: "Indonesia Raya (Vocal) - Sept. 2025" },
    { id: "1Yo_Iqcsih3SAyH6cAwhX9RFD48TE63OO", title: "Jayalah Telkom - TW 1 2026" },
    { id: "15P4vm5etQk_bQQyYFFbzkrvsW0PRb5iQ", title: "Mars Telkom Schools" },
    { id: "16WwQuqUuBonTZBNbkZlRr7pi-ALsBIZE", title: "MARS YPT 2025" }
];

export default function ProfilYPTPage() {
    const [activeVideo, setActiveVideo] = useState(VIDEOS[0]);
    const [isLoading, setIsLoading] = useState(true);

    const handleSelectVideo = (video: typeof VIDEOS[0]) => {
        if (activeVideo.id !== video.id) {
            setIsLoading(true);
            setActiveVideo(video);
        }
    };

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
                                Pilih video pada daftar di bawah ini untuk melihat profil, mars, dan karya YPT.
                            </p>
                        </div>
                    </div>

                    <div className={styles.videoLayout}>
                        {/* List of Videos */}
                        <div className={styles.videoList}>
                            {VIDEOS.map((video) => (
                                <button
                                    key={video.id}
                                    className={`${styles.videoItem} ${activeVideo.id === video.id ? styles.videoItemActive : ''}`}
                                    onClick={() => handleSelectVideo(video)}
                                >
                                    <div className={styles.videoItemIcon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                        </svg>
                                    </div>
                                    <div className={styles.videoItemInfo}>
                                        <h3 className={styles.videoItemTitle}>{video.title}</h3>
                                        <div className={styles.videoItemDuration}>Video Profil</div>
                                    </div>
                                    {activeVideo.id === video.id && (
                                        <div style={{ color: '#e11d48' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Video Player */}
                        <div className={styles.playerContainer}>
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
                                    Memuat Video...
                                </div>
                            )}
                            <iframe
                                src={`https://drive.google.com/file/d/${activeVideo.id}/preview`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title={activeVideo.title}
                                onLoad={() => setIsLoading(false)}
                                allow="autoplay; encrypted-media; fullscreen"
                            ></iframe>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
