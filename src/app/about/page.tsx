"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "@/components/SignOutButton";

export default function AboutPage() {
    const { data: session } = useSession();

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 80px', fontFamily: 'Inter, sans-serif' }}>
            {/* Header Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    ← Kembali ke Beranda
                </Link>
                {session && <SignOutButton />}
            </div>

            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                borderRadius: 24, padding: '40px 32px', color: 'white', marginBottom: 40,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 50px -12px rgba(225,29,72,0.4)',
            }}>
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎮</div>
                    <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        MoLeCul
                    </h1>
                    <h2 style={{ fontSize: 24, fontWeight: 700, opacity: 0.9, marginBottom: 16 }}>
                        Moklet Learning Culture Journey
                    </h2>
                    <p style={{ fontSize: 16, opacity: 0.9, fontWeight: 500, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                        Aplikasi gamifikasi revolusioner untuk menanamkan budaya dan nilai ATTITUDE SMK Telkom Malang melalui petualangan, simulasi interaktif, dan AI cerdas.
                    </p>
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', right: -50, top: -50, width: 250, height: 250, background: 'radial-gradient(circle, #fca5a5 0%, transparent 70%)', opacity: 0.2, filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', left: -50, bottom: -50, width: 200, height: 200, background: 'radial-gradient(circle, #fef08a 0%, transparent 70%)', opacity: 0.1, filter: 'blur(30px)' }} />
            </div>

            {/* Filosofi ATTITUDE */}
            <div style={{ marginBottom: 48 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, background: '#fce7f3', color: '#be123c', padding: '6px 14px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Filosofi Inti
                    </span>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginTop: 16 }}>8 Nilai ATTITUDE</h2>
                    <p style={{ color: '#64748b', marginTop: 8 }}>Pondasi karakter siswa SMK Telkom Malang</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {[
                        { l: 'A', name: 'Act Respectfully', desc: 'Menjaga adab & menghargai sesama', color: '#ef4444' },
                        { l: 'T', name: 'Talk Politely', desc: 'Bertutur kata santun & positif', color: '#f97316' },
                        { l: 'T', name: 'Turn Off Distraction', desc: 'Fokus penuh tanpa gangguan digital', color: '#eab308' },
                        { l: 'I', name: 'Involve Actively', desc: 'Hadir sepenuhnya & partisipatif', color: '#22c55e' },
                        { l: 'T', name: 'Think Solutions', desc: 'Berorientasi masalah, bukan mengeluh', color: '#06b6d4' },
                        { l: 'U', name: 'Use Tech Wisely', desc: 'Memanfaatkan teknologi secara bijak', color: '#3b82f6' },
                        { l: 'D', name: 'Dare to Ask', desc: 'Keberanian dan rasa ingin tahu', color: '#8b5cf6' },
                        { l: 'E', name: 'Eager to Collaborate', desc: 'Terbuka untuk kerjasama', color: '#d946ef' },
                    ].map((item, id) => (
                        <div key={id} style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, flexShrink: 0 }}>
                                {item.l}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16, marginBottom: 4 }}>{item.name}</div>
                                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fitur Utama */}
            <div style={{ marginBottom: 48 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, background: '#e0e7ff', color: '#4338ca', padding: '6px 14px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Eksplorasi App
                    </span>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginTop: 16 }}>Fitur Utama MoLeCul</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Feature 1 */}
                    <div style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)', padding: 32, borderRadius: 24, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
                            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>MoDy - AI Moklet Buddy</h3>
                            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                                Asisten virtual berbasis teknologi <strong>Google Gemini AI</strong> yang bertindak layaknya Kakak Tingkat (Senior) Moklet. MoDy dirancang tidak instan memberi jawaban melainkan menstimulasi *Critical Thinking* secara asik bergaya Socratic Method.
                            </p>
                        </div>
                        <div style={{ flex: '1 1 300px', background: '#f1f5f9', borderRadius: 16, padding: 24, border: '1px dashed #cbd5e1' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>KAPABILITAS:</div>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#475569', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <li><strong>Anti-Plagiasi:</strong> Membimbing proses belajar, bukan *copy-paste*.</li>
                                <li><strong>Konselor Budaya:</strong> Memahami pedoman nilai sekolah.</li>
                                <li><strong>Tutor Code/Jaringan:</strong> Asisten handal anak TJKT & PPLG.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)', padding: 32, borderRadius: 24, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <div style={{ fontSize: 40, marginBottom: 16 }}>🎮</div>
                            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>Arcade & Simulasi Keputusan</h3>
                            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                                Dari simulasi aktivitas keseharian dari rumah sampai sekolah, hingga pertarungan aksi 2D/3D membasmi godaan indisipliner. Belajar dan menumbuhkan <em>muscle memory</em> nilai kebaikan lewat game.
                            </p>
                        </div>
                        <div style={{ flex: '1 1 300px', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, background: '#f1f5f9', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0', color: '#475569' }}>Moklet Tetris</span>
                            <span style={{ fontSize: 13, fontWeight: 700, background: '#f1f5f9', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0', color: '#475569' }}>Attitude Fighter</span>
                            <span style={{ fontSize: 13, fontWeight: 700, background: '#f1f5f9', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0', color: '#475569' }}>Space Shooter 3D</span>
                            <span style={{ fontSize: 13, fontWeight: 700, background: '#f1f5f9', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0', color: '#475569' }}>Journey Map Simulasi</span>
                            <span style={{ fontSize: 13, fontWeight: 700, background: '#f1f5f9', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0', color: '#475569' }}>Tantangan Kilat</span>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)', padding: 32, borderRadius: 24, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <div style={{ fontSize: 40, marginBottom: 16 }}>🏢</div>
                            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>Petualangan Spasial Lintas Dimensi</h3>
                            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                                Mengeksplorasi kebanggaan secara virtual. Pengguna bisa mengakses langsung fitur manipulasi struktur sekolah di dunia web digital interaktif.
                            </p>
                        </div>
                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>🏫 3D Gedung Sekolah</div>
                                <div style={{ fontSize: 13, color: '#64748b' }}>Simulasi maket lingkungan kampus interaktif penuh.</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>🕵️‍♂️ Org Chart Inspector</div>
                                <div style={{ fontSize: 13, color: '#64748b' }}>Permainan pan-n-zoom pencarian pimpinan sekolah dalam panel manajemen.</div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 4 */}
                    <div style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)', padding: 32, borderRadius: 24, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <div style={{ fontSize: 40, marginBottom: 16 }}>🏆</div>
                            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>Integrasi Gamifikasi Global</h3>
                            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                                Setiap sentuhan, bacaan, dan kelulusan memberikan XP progresif untuk mendaki <strong>Leaderboard</strong>. Disempurnakan fitur "Tech Radar" berjalan yang melatih wawasan industri.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Tech Stack Info */}
            <div style={{ textAlign: 'center', opacity: 0.6, fontSize: 13, fontWeight: 600, color: '#475569', padding: '32px 0 0', borderTop: '2px dashed #cbd5e1' }}>
                <div style={{ marginBottom: 12 }}>DIBANGUN MENGGUNAKAN TEKNOLOGI TERDEPAN</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span>Next.js 16</span> • <span>React 19</span> • <span>TypeScript</span> • <span>Supabase</span> • <span>Three.js</span> • <span>Gemini AI</span>
                </div>
            </div>

        </div>
    );
}
