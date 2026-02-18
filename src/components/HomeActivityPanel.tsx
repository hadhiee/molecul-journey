"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const ATTITUDE_VALUES = [
    { letter: "A", title: "Act Respectfully", desc: "Menjaga adab kepada guru dan saling menghargai sesama teman.", color: "#e11d48" },
    { letter: "T", title: "Talk Politely", desc: "Bertutur kata santun, positif, dan menghindari ucapan kasar.", color: "#be123c" },
    { letter: "T", title: "Turn Off Distractions", desc: "Fokus penuh pada materi, tidak terdistraksi hal lain.", color: "#9f1239" },
    { letter: "I", title: "Involve Actively", desc: "Hadir sepenuhnya dan aktif berpartisipasi dalam diskusi.", color: "#2563eb" },
    { letter: "T", title: "Think Solutions", desc: "Berorientasi pada penyelesaian masalah, bukan mengeluh.", color: "#059669" },
    { letter: "U", title: "Use Tech Wisely", desc: "Memanfaatkan teknologi & AI sebagai alat bantu belajar.", color: "#d97706" },
    { letter: "D", title: "Dare to Ask", desc: "Membangun rasa ingin tahu dan tidak malu bertanya.", color: "#7c3aed" },
    { letter: "E", title: "Eager to Collaborate", desc: "Terbuka untuk bekerja sama dan berbagi ilmu.", color: "#0891b2" },
];

export default function HomeActivityPanel() {
    const [activeModal, setActiveModal] = useState<"CHECKIN" | "EVIDENCE" | "REFLECTION" | null>(null);
    const [reflection, setReflection] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    // Get value of the day
    const dayValue = ATTITUDE_VALUES[new Date().getDate() % ATTITUDE_VALUES.length];

    useEffect(() => {
        const saved = localStorage.getItem("user_reflection_daily");
        if (saved) setReflection(saved);
    }, []);

    const handleSaveReflection = () => {
        setIsSaving(true);
        setTimeout(() => {
            localStorage.setItem("user_reflection_daily", reflection);
            setIsSaving(false);
            alert("Refleksi berhasil disimpan! ✨");
            setActiveModal(null);
        }, 800);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== "application/pdf") {
                alert("Mohon unggah file dalam format PDF.");
                return;
            }
            setUploadStatus("Mengunggah...");
            // Simulate upload
            setTimeout(() => {
                setUploadStatus(`Berhasil mengunggah: ${file.name} ✅`);
                setTimeout(() => {
                    setActiveModal(null);
                    setUploadStatus(null);
                }, 1500);
            }, 1200);
        }
    };

    const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div
                onClick={onClose}
                style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
            />
            <div style={{
                position: 'relative', background: 'white', borderRadius: 28, width: '100%', maxWidth: 440,
                padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'modalIn 0.3s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 10, cursor: 'pointer', fontWeight: 900 }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );

    return (
        <>
            <div style={{
                background: 'white', borderRadius: 24, padding: '24px', marginBottom: 32,
                border: '1px solid #e5e7eb', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)',
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12
            }}>
                <div style={{ gridColumn: 'span 3', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                        Aktivitas Hari Ini
                    </h3>
                </div>

                <button
                    onClick={() => setActiveModal("CHECKIN")}
                    style={{
                        background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px 12px', borderRadius: 20,
                        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    <span style={{ fontSize: 28 }}>🗓️</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b' }}>Check-in</span>
                </button>

                <button
                    onClick={() => setActiveModal("EVIDENCE")}
                    style={{
                        background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px 12px', borderRadius: 20,
                        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    <span style={{ fontSize: 28 }}>📤</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b' }}>Tambah Bukti</span>
                </button>

                <button
                    onClick={() => setActiveModal("REFLECTION")}
                    style={{
                        background: '#fff1f2', border: '1px solid #ffe4e6', padding: '16px 12px', borderRadius: 20,
                        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    <span style={{ fontSize: 28 }}>📝</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#e11d48' }}>Refleksi</span>
                </button>
            </div>

            {/* Modals */}
            {activeModal === "CHECKIN" && (
                <Modal title="Commitment Today" onClose={() => setActiveModal(null)}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 56, marginBottom: 12 }}>✨</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: dayValue.color, textTransform: 'uppercase', marginBottom: 4 }}>Fokus Hari Ini</div>
                        <h4 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a2e', marginBottom: 12 }}>{dayValue.title}</h4>
                        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>"{dayValue.desc}"</p>
                        <button
                            onClick={() => { alert("Komitmen diterima! Semangat belajarnya! 💪"); setActiveModal(null); }}
                            style={{ width: '100%', background: dayValue.color, color: 'white', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 20px ${dayValue.color}44` }}
                        >
                            Saya Berkomitmen! 🚀
                        </button>
                    </div>
                </Modal>
            )}

            {activeModal === "EVIDENCE" && (
                <Modal title="Upload Evidence" onClose={() => setActiveModal(null)}>
                    <div>
                        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Unggah bukti lomba, karya, atau portofolio kamu dalam format PDF.</p>
                        <div style={{
                            border: '2px dashed #e2e8f0', borderRadius: 20, padding: 32, textAlign: 'center',
                            position: 'relative', background: '#f8fafc'
                        }}>
                            <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>📄</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                                {uploadStatus || "Klik untuk pilih file PDF"}
                            </span>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            />
                        </div>
                        <div style={{ marginTop: 20, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                            * Maksimal ukuran file 5MB.
                        </div>
                    </div>
                </Modal>
            )}

            {activeModal === "REFLECTION" && (
                <Modal title="Daily Reflection" onClose={() => setActiveModal(null)}>
                    <div>
                        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Apa yang kamu pelajari hari ini? Tuliskan refleksimu di sini.</p>
                        <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            placeholder="Tuliskan pengalaman belajarmu hari ini..."
                            style={{
                                width: '100%', height: 160, borderRadius: 20, border: '1px solid #e2e8f0',
                                padding: 16, fontSize: 14, fontFamily: 'inherit', resize: 'none', marginBottom: 20,
                                outline: 'none', transition: 'border-color 0.2s'
                            }}
                        />
                        <button
                            disabled={isSaving}
                            onClick={handleSaveReflection}
                            style={{
                                width: '100%', background: '#e11d48', color: 'white', border: 'none', padding: '16px',
                                borderRadius: 16, fontWeight: 800, cursor: 'pointer', opacity: isSaving ? 0.7 : 1
                            }}
                        >
                            {isSaving ? "Menyimpan..." : "Simpan Refleksi 📁"}
                        </button>
                    </div>
                </Modal>
            )}

            <style>{`
                @keyframes modalIn {
                    from { transform: scale(0.9) translateY(20px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    );
}
