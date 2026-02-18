"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    id: string | number;
    content: string;
    timestamp: string;
    type: "reflection" | "evidence" | "checkin";
}

const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
        />
        <div style={{
            position: 'relative', background: 'white', borderRadius: 28, width: '100%', maxWidth: 500,
            padding: '32px 24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'modalIn 0.3s ease-out',
            maxHeight: '85vh', overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, position: 'sticky', top: 0, background: 'white', zIndex: 1, paddingBottom: 10 }}>
                <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1a1a2e', marginBottom: 4 }}>{title}</h3>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>🔒</span> DATA PRIBADI (HANYA ANDA)
                    </div>
                </div>
                <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 10, cursor: 'pointer', fontWeight: 900, transition: 'all 0.2s' }}>×</button>
            </div>
            {children}
        </div>
    </div>
);

export default function HomeActivityPanel({ userEmail }: { userEmail: string }) {
    const [activeModal, setActiveModal] = useState<"CHECKIN" | "EVIDENCE" | "REFLECTION" | "FULL_HISTORY" | null>(null);
    const [reflection, setReflection] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // History states
    const [reflectionsHistory, setReflectionsHistory] = useState<HistoryItem[]>([]);
    const [evidenceHistory, setEvidenceHistory] = useState<HistoryItem[]>([]);
    const [checkinHistory, setCheckinHistory] = useState<HistoryItem[]>([]);

    const [dayValue, setDayValue] = useState(ATTITUDE_VALUES[0]);

    const fetchUserHistory = useCallback(async () => {
        if (!userEmail) return;
        const normalizedEmail = userEmail.toLowerCase();
        setIsFetching(true);
        try {
            const { data, error } = await supabase
                .from("user_progress")
                .select("*")
                .eq("user_email", normalizedEmail)
                .in("mission_id", ["SYSTEM_REFLECTION", "SYSTEM_EVIDENCE", "SYSTEM_CHECKIN"])
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Supabase Error [History]:", error);
                throw error;
            }

            if (data) {
                console.log("Supabase [History] Loaded:", data.length, "items");
                setReflectionsHistory(data.filter(i => i.mission_id === "SYSTEM_REFLECTION").map(i => ({ id: i.id, content: i.choice_label, timestamp: i.created_at, type: 'reflection' })));
                setEvidenceHistory(data.filter(i => i.mission_id === "SYSTEM_EVIDENCE").map(i => ({ id: i.id, content: i.choice_label, timestamp: i.created_at, type: 'evidence' })));
                setCheckinHistory(data.filter(i => i.mission_id === "SYSTEM_CHECKIN").map(i => ({ id: i.id, content: i.choice_label, timestamp: i.created_at, type: 'checkin' })));
            }
        } catch (e) {
            console.error("History fetch catch error:", e);
        }
        finally { setIsFetching(false); }
    }, [userEmail]);

    useEffect(() => {
        setMounted(true);
        const date = new Date().getDate();
        setDayValue(ATTITUDE_VALUES[date % ATTITUDE_VALUES.length]);

        if (userEmail) {
            fetchUserHistory();
            const draftKey = `user_reflection_draft_${userEmail.toLowerCase().split('@')[0]}`;
            const draft = localStorage.getItem(draftKey);
            if (draft) setReflection(draft);
        }
    }, [userEmail, fetchUserHistory]);

    const handleCheckin = async () => {
        if (!userEmail || isSaving) return;
        const normalizedEmail = userEmail.toLowerCase();
        setIsSaving(true);
        try {
            const { error } = await supabase.from("user_progress").insert({
                user_email: normalizedEmail, mission_id: "SYSTEM_CHECKIN", score: 0, choice_label: `LOK: ${dayValue.title}`
            });
            if (error) {
                console.error("Supabase Error [Checkin]:", error);
                throw error;
            }
            await fetchUserHistory();
            alert(`Komitmen diterima! Mari kita bersama-sama: ${dayValue.title} 💪`);
            setActiveModal(null);
        } catch (e) { alert("Gagal mencatat check-in."); }
        finally { setIsSaving(false); }
    };

    const handleSaveReflection = async () => {
        if (!reflection.trim() || !userEmail || isSaving) return;
        const normalizedEmail = userEmail.toLowerCase();
        setIsSaving(true);
        try {
            const { error } = await supabase.from("user_progress").insert({
                user_email: normalizedEmail, mission_id: "SYSTEM_REFLECTION", score: 0, choice_label: reflection
            });
            if (error) {
                console.error("Supabase Error [Reflection]:", error);
                throw error;
            }
            const draftKey = `user_reflection_draft_${normalizedEmail.split('@')[0]}`;
            localStorage.removeItem(draftKey);
            setReflection("");
            await fetchUserHistory();
            alert("Refleksi berhasil disimpan ke riwayat pribadi Anda! ✨");
        } catch (e) {
            console.error("Save reflection error catch:", e);
            alert("Gagal menyimpan refleksi. Pastikan koneksi internet stabil.");
        }
        finally { setIsSaving(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userEmail) return;
        if (file.type !== "application/pdf") { alert("Mohon unggah file format PDF."); return; }

        const normalizedEmail = userEmail.toLowerCase();
        setUploadStatus("Menyimpan...");
        try {
            const { error } = await supabase.from("user_progress").insert({
                user_email: normalizedEmail, mission_id: "SYSTEM_EVIDENCE", score: 0, choice_label: `File: ${file.name}`
            });
            if (error) {
                console.error("Supabase Error [Evidence]:", error);
                throw error;
            }
            await fetchUserHistory();
            setUploadStatus(`Berhasil: ${file.name} ✅`);
            setTimeout(() => setUploadStatus(null), 2000);
        } catch (e) { setUploadStatus("Gagal mencatat bukti."); }
    };

    const handleDeleteRecord = async (id: string | number) => {
        if (!confirm("Hapus catatan ini dari riwayat Anda?")) return;
        try {
            const { error } = await supabase.from("user_progress").delete().eq("id", id);
            if (error) throw error;
            await fetchUserHistory();
        } catch (e) { alert("Gagal menghapus data."); }
    };

    if (!mounted) return <div style={{ background: 'white', borderRadius: 24, padding: '24px', marginBottom: 32, border: '1px solid #e5e7eb', height: 180 }} />;

    return (
        <>
            <div style={{
                background: 'white', borderRadius: 24, padding: '24px', marginBottom: 32,
                border: '1px solid #e5e7eb', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)',
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12
            }}>
                <div style={{ gridColumn: 'span 3', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                        Aktivitas Hari Ini
                    </h3>
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 12 }}>🔒</span> PRIVAT
                    </div>
                </div>

                <button onClick={() => setActiveModal("CHECKIN")} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px 12px', borderRadius: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 28 }}>🗓️</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b' }}>Check-in</span>
                </button>

                <button onClick={() => setActiveModal("EVIDENCE")} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px 12px', borderRadius: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 28 }}>📤</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b' }}>Tambah Bukti</span>
                </button>

                <button onClick={() => setActiveModal("REFLECTION")} style={{ background: '#fff1f2', border: '1px solid #ffe4e6', padding: '16px 12px', borderRadius: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 28 }}>📝</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#e11d48' }}>Refleksi</span>
                </button>

                <div style={{ gridColumn: 'span 3', marginTop: 8 }}>
                    <button
                        onClick={() => setActiveModal("FULL_HISTORY")}
                        style={{
                            width: '100%',
                            background: '#f1f5f9',
                            border: '1px dashed #cbd5e1',
                            padding: '12px',
                            borderRadius: 16,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        <span>📜</span> LIHAT SEMUA RIYAWAT
                    </button>
                </div>
            </div>

            {/* Modals with Unified History Display */}
            {activeModal === "CHECKIN" && (
                <Modal title="Commitment Today" onClose={() => setActiveModal(null)}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ fontSize: 56, marginBottom: 12 }}>✨</div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: dayValue.color, textTransform: 'uppercase', marginBottom: 4 }}>Fokus Karakter Hari Ini</div>
                        <h4 style={{ fontSize: 22, fontWeight: 900, color: '#1a1a2e', marginBottom: 12 }}>{dayValue.title}</h4>
                        <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>"{dayValue.desc}"</p>
                        <button disabled={isSaving} onClick={handleCheckin} style={{ width: '100%', background: dayValue.color, color: 'white', border: 'none', padding: '16px', borderRadius: 20, fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 20px ${dayValue.color}44` }}>
                            {isSaving ? "Mencatat..." : "Saya Berkomitmen! 🚀"}
                        </button>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>Riwayat Check-in</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {checkinHistory.length > 0 ? checkinHistory.map(item => (
                                <div key={item.id} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700 }}>{item.content.replace('LOK: ', '')}</div>
                                    <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right' }}>
                                        {new Date(item.timestamp).toLocaleDateString()}
                                        <button onClick={() => handleDeleteRecord(item.id)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Hapus</button>
                                    </div>
                                </div>
                            )) : <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>Belum ada riwayat.</div>}
                        </div>
                    </div>
                </Modal>
            )}

            {activeModal === "EVIDENCE" && (
                <Modal title="Portofolio Digital" onClose={() => setActiveModal(null)}>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: 24, border: '1px solid #e2e8f0', marginBottom: 24 }}>
                        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16, fontWeight: 500 }}>Cantumkan bukti prestasi/karya (PDF):</p>
                        <div style={{ border: '2px dashed #cbd5e1', borderRadius: 16, padding: '24px', textAlign: 'center', position: 'relative', background: 'white' }}>
                            <span style={{ fontSize: 32 }}>📁</span>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginTop: 12 }}>{uploadStatus || "Pilih File Portofolio"}</div>
                            <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>Riwayat Unggahan</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {evidenceHistory.length > 0 ? evidenceHistory.map(item => (
                                <div key={item.id} style={{ display: 'flex', padding: '14px', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', alignItems: 'center', gap: 12 }}>
                                    <div style={{ fontSize: 20 }}>📄</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.content}</div>
                                        <div style={{ fontSize: 9, color: '#94a3b8' }}>{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <button onClick={() => handleDeleteRecord(item.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>×</button>
                                </div>
                            )) : <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>Satu tempat untuk semua karyamu.</div>}
                        </div>
                    </div>
                </Modal>
            )}

            {activeModal === "REFLECTION" && (
                <Modal title="Catatan Refleksi" onClose={() => setActiveModal(null)}>
                    <div style={{ marginBottom: 32 }}>
                        <textarea
                            value={reflection}
                            onChange={(e) => { setReflection(e.target.value); localStorage.setItem(`user_reflection_draft_${userEmail.toLowerCase().split('@')[0]}`, e.target.value); }}
                            placeholder="Apa insight belajarmu hari ini? (Hanya Anda yang bisa melihat ini)"
                            style={{ width: '100%', height: 140, borderRadius: 20, border: '1px solid #e2e8f0', padding: 16, fontSize: 14, fontFamily: 'inherit', resize: 'none', marginBottom: 12, outline: 'none' }}
                        />
                        <button disabled={isSaving || !reflection.trim()} onClick={handleSaveReflection} style={{ width: '100%', background: '#e11d48', color: 'white', border: 'none', padding: '16px', borderRadius: 20, fontWeight: 800, cursor: 'pointer', opacity: (isSaving || !reflection.trim()) ? 0.7 : 1 }}>
                            {isSaving ? "Menyimpan Catatan..." : "Simpan di Diari Privat 📁"}
                        </button>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: '#e11d48', marginBottom: 16 }}>Riwayat Diari</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {reflectionsHistory.length > 0 ? reflectionsHistory.map(item => (
                                <div key={item.id} style={{ padding: '16px', background: '#fff1f2', borderRadius: 20, border: '1px solid #ffe4e6', position: 'relative', cursor: 'pointer' }} onClick={() => alert(item.content)}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#e11d48', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{new Date(item.timestamp).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRecord(item.id); }} style={{ background: '#ff33661a', border: 'none', color: '#e11d48', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 800 }}>Hapus</button>
                                    </div>
                                    <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                        {item.content}
                                    </div>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: '#e11d48', marginTop: 8, textAlign: 'right' }}>Klik untuk baca penuh →</div>
                                </div>
                            )) : <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>Diari pribadimu masih kosong.</div>}
                        </div>
                    </div>
                </Modal>
            )}

            {activeModal === "FULL_HISTORY" && (
                <Modal title="Riwayat Aktivitas" onClose={() => setActiveModal(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>📝</span> Refleksi Terbaru
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {reflectionsHistory.slice(0, 3).map(item => (
                                    <div key={item.id} onClick={() => alert(item.content)} style={{ padding: 12, background: '#f8fafc', borderRadius: 12, fontSize: 12, border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                                        <div style={{ fontWeight: 800, fontSize: 10, color: '#64748b', marginBottom: 4 }}>{new Date(item.timestamp).toLocaleDateString()}</div>
                                        <div style={{ color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.content}</div>
                                    </div>
                                ))}
                                {reflectionsHistory.length === 0 && <div style={{ fontSize: 11, color: '#94a3b8' }}>Belum ada refleksi.</div>}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>🗓️</span> Check-in Harian
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {checkinHistory.map(item => (
                                    <div key={item.id} style={{ padding: '6px 12px', background: '#f0fdf4', color: '#166534', borderRadius: 8, fontSize: 10, fontWeight: 800, border: '1px solid #dcfce7' }}>
                                        {item.content.replace('LOK: ', '')} ({new Date(item.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })})
                                    </div>
                                ))}
                                {checkinHistory.length === 0 && <div style={{ fontSize: 11, color: '#94a3b8' }}>Belum ada check-in.</div>}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>📂</span> Bukti & Portofolio
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {evidenceHistory.map(item => (
                                    <div key={item.id} style={{ padding: 12, background: '#eff6ff', borderRadius: 12, fontSize: 12, border: '1px solid #dbeafe', display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ color: '#1e3a8a', fontWeight: 700 }}>{item.content}</div>
                                        <div style={{ fontSize: 10, color: '#60a5fa' }}>{new Date(item.timestamp).toLocaleDateString()}</div>
                                    </div>
                                ))}
                                {evidenceHistory.length === 0 && <div style={{ fontSize: 11, color: '#94a3b8' }}>Belum ada bukti unggahan.</div>}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            <style>{`
                @keyframes modalIn {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    );
}
