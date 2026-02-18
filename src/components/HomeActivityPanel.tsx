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

interface HistoryItem {
    id: string;
    content: string;
    timestamp: string;
    type: string;
}

const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
        />
        <div style={{
            position: 'relative', background: 'white', borderRadius: 28, width: '100%', maxWidth: 480,
            padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'modalIn 0.3s ease-out',
            maxHeight: '90vh', overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>{title}</h3>
                <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 10, cursor: 'pointer', fontWeight: 900 }}>×</button>
            </div>
            {children}
        </div>
    </div>
);

export default function HomeActivityPanel() {
    const [activeModal, setActiveModal] = useState<"CHECKIN" | "EVIDENCE" | "REFLECTION" | null>(null);
    const [reflection, setReflection] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // History states
    const [reflectionsHistory, setReflectionsHistory] = useState<HistoryItem[]>([]);
    const [evidenceHistory, setEvidenceHistory] = useState<HistoryItem[]>([]);

    const [dayValue, setDayValue] = useState(ATTITUDE_VALUES[0]);

    useEffect(() => {
        setMounted(true);
        const date = new Date().getDate();
        setDayValue(ATTITUDE_VALUES[date % ATTITUDE_VALUES.length]);

        // Load history from localStorage
        const savedReflections = localStorage.getItem("user_reflections_history");
        if (savedReflections) setReflectionsHistory(JSON.parse(savedReflections));

        const savedEvidence = localStorage.getItem("user_evidence_history");
        if (savedEvidence) setEvidenceHistory(JSON.parse(savedEvidence));

        // Load today's draft
        const draft = localStorage.getItem("user_reflection_draft");
        if (draft) setReflection(draft);
    }, []);

    const handleSaveReflection = () => {
        if (!reflection.trim()) return;
        setIsSaving(true);

        setTimeout(() => {
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                content: reflection,
                timestamp: new Date().toISOString(),
                type: 'reflection'
            };

            const newHistory = [newItem, ...reflectionsHistory];
            setReflectionsHistory(newHistory);
            localStorage.setItem("user_reflections_history", JSON.stringify(newHistory));
            localStorage.removeItem("user_reflection_draft");
            setReflection("");

            setIsSaving(false);
            alert("Refleksi berhasil disimpan ke riwayat! ✨");
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

            setTimeout(() => {
                const newItem: HistoryItem = {
                    id: Date.now().toString(),
                    content: file.name,
                    timestamp: new Date().toISOString(),
                    type: 'evidence'
                };

                const newHistory = [newItem, ...evidenceHistory];
                setEvidenceHistory(newHistory);
                localStorage.setItem("user_evidence_history", JSON.stringify(newHistory));

                setUploadStatus(`Berhasil: ${file.name} ✅`);
                setTimeout(() => {
                    setUploadStatus(null);
                }, 2000);
            }, 1200);
        }
    };

    const onReflectionChange = (val: string) => {
        setReflection(val);
        localStorage.setItem("user_reflection_draft", val);
    };

    if (!mounted) {
        return (
            <div style={{
                background: 'white', borderRadius: 24, padding: '24px', marginBottom: 32,
                border: '1px solid #e5e7eb', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700 }}>Memuat Panel Aktivitas...</div>
            </div>
        );
    }

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
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 20, border: '1px solid #e2e8f0', marginBottom: 24 }}>
                            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16, fontWeight: 500 }}>Upload PDF bukti prestasi/karya:</p>
                            <div style={{ border: '2px dashed #cbd5e1', borderRadius: 16, padding: '24px', textAlign: 'center', position: 'relative' }}>
                                <span style={{ fontSize: 28 }}>📄</span>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginTop: 8 }}>{uploadStatus || "Pilih File PDF"}</div>
                                <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>Riwayat Bukti</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {evidenceHistory.length > 0 ? evidenceHistory.map(item => (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📄</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.content}</div>
                                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, padding: 20 }}>Belum ada bukti yang diunggah.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {activeModal === "REFLECTION" && (
                <Modal title="Daily Reflection" onClose={() => setActiveModal(null)}>
                    <div>
                        <div style={{ marginBottom: 24 }}>
                            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>Tuliskan refleksimu hari ini:</p>
                            <textarea
                                value={reflection}
                                onChange={(e) => onReflectionChange(e.target.value)}
                                placeholder="Apa yang kamu pelajari hari ini?..."
                                style={{ width: '100%', height: 120, borderRadius: 20, border: '1px solid #e2e8f0', padding: 16, fontSize: 14, fontFamily: 'inherit', resize: 'none', marginBottom: 12 }}
                            />
                            <button
                                disabled={isSaving || !reflection.trim()}
                                onClick={handleSaveReflection}
                                style={{ width: '100%', background: '#e11d48', color: 'white', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 800, cursor: 'pointer', opacity: (isSaving || !reflection.trim()) ? 0.7 : 1 }}
                            >
                                {isSaving ? "Menyimpan..." : "Simpan Refleksi 📁"}
                            </button>
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>Riwayat Refleksi</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {reflectionsHistory.length > 0 ? reflectionsHistory.map(item => (
                                    <div key={item.id} style={{ padding: '16px', background: '#fff1f2', borderRadius: 16, border: '1px solid #ffe4e6' }}>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: '#e11d48', marginBottom: 6 }}>{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5, fontStyle: 'italic' }}>"{item.content}"</div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, padding: 20 }}>Belum ada riwayat refleksi.</div>
                                )}
                            </div>
                        </div>
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
