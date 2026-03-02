"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import SignOutButton from "@/components/SignOutButton";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const personnelData = [
    {
        category: "A. KURIKULUM",
        color: "#e11d48",
        members: [
            { nip: "10860082", nama: "Ifa Choirunnisa, S. ST, M.Pd.", jabatan: "Waka. Bidang Kurikulum" },
            { nip: "22890006", nama: "Larasati Chairun Nisa, S.Pd.", jabatan: "Kaur. Pembelajaran dan Perpustakaan" },
            { nip: "24920002", nama: "Rendi Lusbiantoro, M.Pd.", jabatan: "Kaur. Kurikulum Silabus & Materi" },
            { nip: "11720059", nama: "Tulus Andrianto, S.Pd.", jabatan: "PIC. Magang Luar Negeri" },
            { nip: "25890013", nama: "Jevi Wenda Santi,S Pd.", jabatan: "PIC. Kelas Internasional" },
            { nip: "26930005", nama: "Mohamad Munif, S.Pd.", jabatan: "PIC. Tahfidz dan Study Luar Negeri" },
            { nip: "24000030", nama: "Ikrima Rahmatika Layyina, A.Md, Lib.", jabatan: "Staf Perpustakaan" },
        ]
    },
    {
        category: "B. KONSENTRASI KEAHLIAN",
        color: "#2563eb",
        members: [
            { nip: "19940017", nama: "Firdausa, S.Pd.", jabatan: "Kepala Konsentrasi Keahlian RPL" },
            { nip: "19920001", nama: "Roselina Febriati, S.ST.", jabatan: "Kepala Konsentrasi Keahlian TKJ" },
            { nip: "25920023", nama: "Bias Damiasa, S.Pd.", jabatan: "Kepala Konsentrasi Keahlian PG" },
            { nip: "26890005", nama: "Dafid Bayu Firmansyah, M.Kom.", jabatan: "Sekretaris Konsentrasi Keahlian RPL" },
            { nip: "26960020", nama: "Joni Setiyawan Saputra, S.Pd.", jabatan: "Sekretaris Konsentrasi Keahlian TKJ dan COE Cyber Security" },
            { nip: "25960025", nama: "Achmad Ilham Ramadhani, S. Pd.", jabatan: "Sekretaris Konsentrasi Keahlian PG" },
        ]
    },
    {
        category: "C. KESISWAAN DAN KARAKTER",
        color: "#059669",
        members: [
            { nip: "92680019", nama: "Drs. Bambang Siswantoro", jabatan: "Waka. Bidang Kesiswaan & Karakter" },
            { nip: "25840007", nama: "Adi Nurrachman, S.T., M.Kom.", jabatan: "Kaur. Ekstra Kurikuler dan Prestasi" },
            { nip: "02740012", nama: "Ahmad Nasikin, M.Pd.", jabatan: "Kaur. Bimbingan Konseling dan Karakter" },
            { nip: "23880015", nama: "Ana Wahyuning Sholikhatin S.Pd.", jabatan: "Sekretariat Kesiswaan" },
            { nip: "25880016", nama: "Tenri Farizatul Warda, S.Pd.", jabatan: "PIC. Keuangan Kesiswaan" },
            { nip: "18880132", nama: "Siana Norma Heny, M.Pd.", jabatan: "PIC. Prestasi" },
            { nip: "25010037", nama: "Guntur Adi Putra, S.Pd.", jabatan: "PIC. Ekstra Kurikuler dan Portofolio" },
            { nip: "25990011", nama: "Syafirah Aisyah, S.T.", jabatan: "PIC. Pembina OSIS" },
            { nip: "25910032", nama: "Dimas Agung Prasetyawan, M.Pd.", jabatan: "PIC. JIWA dan Lomba" },
            { nip: "11860083", nama: "Rofiqut Thoriq, S.Pd.", jabatan: "PIC. Tata Tertib" },
            { nip: "26820005", nama: "Firman Hadi Amrullah Z., S.Kom.", jabatan: "PIC. Program 5R dan Penegakan Kedisiplinan" },
            { nip: "26870007", nama: "M. Masyis Dzul Hilmi, M.Pd.", jabatan: "PIC. Kegiatan Kerohanian" },
            { nip: "10830017", nama: "Emil Bakhtiar Zulkarnain, S.Psi.", jabatan: "Koordinator Guru BK" },
            { nip: "25850009", nama: "Nurwidiasih Firstyana Winadi, S.Psi.", jabatan: "PIC. Pendidikan Keputrian dan Kegiatan Sosial" },
            { nip: "26950012", nama: "Misfalah Thawafa, S.Psi.", jabatan: "PIC. Pendidikan Karakter" },
            { nip: "25010035", nama: "Kheren Carollina Pamintarso, S.Pd.", jabatan: "PIC. Tim Pencegahan dan Penindakan Kekerasan (TPPK) dan Media Sosial" },
            { nip: "-", nama: "Dwi Ajeng Ayu Rahmadani, S.Tr.Keb.", jabatan: "Tenaga Kesehatan Sekolah" },
        ]
    },
    {
        category: "D. HUBUNGAN INDUSTRI DAN KOMUNIKASI",
        color: "#8b5cf6",
        members: [
            { nip: "25950024", nama: "Qodri Akbar Wajdi, S.Kom.", jabatan: "Waka. Bidang Hubin dan Komunikasi" },
            { nip: "25930024", nama: "Kinanti Retnaning Widyani, M.Pd.", jabatan: "Kaur. PPDB dan Komunikasi" },
            { nip: "25950026", nama: "Tito Tri Prabowo, M.Pd.", jabatan: "Kaur. Sinergi, Unit Produksi dan Alumni" },
            { nip: "19910002", nama: "Hirga Ertama Putra, S.Kom.", jabatan: "PIC. UPJ" },
            { nip: "25960007", nama: "Ina Indra Rustika, S.Pd.", jabatan: "PIC. Humas" },
            { nip: "25990028", nama: "Feniliya Mayrini, S.Pd.", jabatan: "PIC. Admisi" },
            { nip: "25950035", nama: "Rahardiyan Andzikriadi, S.S.", jabatan: "PIC. Marketing" },
            { nip: "08890012", nama: "Yaniko Dimas Yogo Prasetyo, S.Kom.", jabatan: "PIC. Alumni dan CDC" },
            { nip: "25900015", nama: "Ardhian Suseno, M.Pd.", jabatan: "Sekretariat Hubinkom" },
            { nip: "26940004", nama: "Aulia Mas'adah, S.Kom.", jabatan: "PIC. Keuangan Hubinkom" }
        ]
    },
    {
        category: "E. IT, LABORATORIUM, DAN SARANA PRASARANA",
        color: "#d97706",
        members: [
            { nip: "07860075", nama: "Mokhamad Hadi Wijaya, M.T.", jabatan: "Waka. Bidang IT, Lab., dan Sarpra" },
            { nip: "25950025", nama: "Whyna Agustin, S.Pd.", jabatan: "Kaur IT (Information of Technology)" },
            { nip: "22880006", nama: "Muhammad Chusni Agus, M.Pd.", jabatan: "Kaur. Laboratorium" },
            { nip: "11820014", nama: "Ekon Anjar Poernomo, S.Kom.", jabatan: "Kaur Sarana dan Prasarana" },
            { nip: "25940004", nama: "Amalia Ramadhanty, S.Kom.", jabatan: "PIC. Administrasi, Tata Kelola, dan Keuangan" },
            { nip: "20820006", nama: "Zainul Abidin, S.Kom.", jabatan: "PIC. IT. Mobile Developer & Technical Support" },
            { nip: "25960026", nama: "Zakaria, S.Pd.", jabatan: "PIC. IT. Backend & DevOps" },
            { nip: "25980017", nama: "Chandra Wijaya Kristanto, S.Pd.", jabatan: "PIC. IT. UI/UX & Frontend Developer" },
            { nip: "26960021", nama: "Muhammad Bagus Arifin, M.Pd.", jabatan: "PIC. IT. Technical Support" },
            { nip: "26910009", nama: "Nico Rachmacandrana, S.ST.", jabatan: "PIC. IT. Infrastucture & Network" },
            { nip: "25890012", nama: "Firmansyah Ayatullah, S.Kom.", jabatan: "PIC. Laboratorium Riset" },
            { nip: "25900022", nama: "Rudi Mistriono, S.Kom.", jabatan: "PIC. Pengelola Dapodik & Inventaris Aset Sekolah" },
            { nip: "95710035", nama: "Setdiyoko, S.E.", jabatan: "PIC. Sapra. Kebersihan, Keamanan dan Perlengkapan" }
        ]
    },
    {
        category: "F. ADMINISTRASI/TATA USAHA",
        color: "#475569",
        members: [
            { nip: "22880005", nama: "Laili Agustin, S.T.", jabatan: "Kepala Administrasi" },
            { nip: "17680052", nama: "Sri Chusnul Haniyah, S.Pd.", jabatan: "Kaur. Human Capital, Logistik & Sekretariat" },
            { nip: "23950043", nama: "Anum Rosaliani Nur Mufida, S.E.", jabatan: "Kaur. Keuangan" },
            { nip: "93730054", nama: "Lailatul Istiqomah, S.E.", jabatan: "PIC. Sekretariat" },
            { nip: "08860007", nama: "Milutfiyana Devi Sulistiyowati, S.E.", jabatan: "PIC. Human Capital" },
            { nip: "25870009", nama: "Diaur Rahman, S.Pd.", jabatan: "PIC. Logistik" },
            { nip: "25010036", nama: "Lailla Anggriani, S.Ak.", jabatan: "PIC. Administrasi Keuangan" }
        ]
    },
    {
        category: "G. QUALITY DEVELOPMENT & PERFORMANCE MANAGEMENT (QDPM)",
        color: "#ec4899",
        members: [
            { nip: "20910001", nama: "Muhamad Arifin, M.Pd.", jabatan: "Kaur. Quality Development Performance Management" },
            { nip: "25850010", nama: "Agus Hari Purwanto, S.Pd.", jabatan: "Sekretaris QDPM dan Koor. Auditor Internal" },
            { nip: "17890102", nama: "Pashatania Fitri Indah Lestari, S.Kom.", jabatan: "PIC. Pengelolaan Data" },
            { nip: "24020001", nama: "Lyra Hertin, S.Pd.", jabatan: "PIC. Pengendali Dokumen" }
        ]
    }
];

export default function ManajemenPage() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || "";

    const [xpEarned, setXpEarned] = useState(false);
    const [loading, setLoading] = useState(false);

    // New state for accordions and Personnel XP
    const [expandedDepts, setExpandedDepts] = useState<number[]>([]);
    const [personnelXpEarned, setPersonnelXpEarned] = useState(false);
    const [loadingPersonnelXP, setLoadingPersonnelXP] = useState(false);

    // Mini-game state
    const [foundPeople, setFoundPeople] = useState<string[]>([]);
    const [gameXpEarned, setGameXpEarned] = useState(false);
    const [loadingGameXP, setLoadingGameXP] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Auto-earn XP after exploring for 3 seconds
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!xpEarned && userEmail) {
            timer = setTimeout(() => {
                handleEarnXP();
            }, 5000); // give points after 5s active viewing
        }
        return () => clearTimeout(timer);
    }, [xpEarned, userEmail]);

    // Check if Personnel XP already claimed on mount
    useEffect(() => {
        if (!userEmail) return;

        // Personnel XP
        supabase
            .from('user_progress')
            .select('*')
            .eq('user_email', userEmail)
            .eq('mission_id', 'SYSTEM_EXPLORE_PERSONIL')
            .single()
            .then(({ data }) => {
                if (data) setPersonnelXpEarned(true);
            });

        // Game XP
        supabase
            .from('user_progress')
            .select('*')
            .eq('user_email', userEmail)
            .eq('mission_id', 'SYSTEM_MINIGAME_STRUKTUR')
            .single()
            .then(({ data }) => {
                if (data) {
                    setGameXpEarned(true);
                    setFoundPeople(['direktur', 'kepsek', 'kkomite', 'admin']);
                }
            });
    }, [userEmail]);

    const handleEarnXP = async () => {
        if (xpEarned || !userEmail) return;
        setLoading(true);

        try {
            // Check if already claimed from DB
            const { data: existing } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_email', userEmail)
                .eq('mission_id', 'SYSTEM_EXPLORE_MANAJEMEN')
                .single();

            if (!existing) {
                // give +15 XP
                await supabase.from("user_progress").insert({
                    user_email: userEmail,
                    mission_id: "SYSTEM_EXPLORE_MANAJEMEN",
                    score: 15,
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

    const toggleDept = async (idx: number) => {
        setExpandedDepts(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );

        if (!personnelXpEarned && userEmail && !loadingPersonnelXP) {
            setLoadingPersonnelXP(true);
            try {
                const { data: existing } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_email', userEmail)
                    .eq('mission_id', 'SYSTEM_EXPLORE_PERSONIL')
                    .single();

                if (!existing) {
                    await supabase.from("user_progress").insert({
                        user_email: userEmail,
                        mission_id: "SYSTEM_EXPLORE_PERSONIL",
                        score: 20,
                        created_at: new Date().toISOString()
                    });
                }
                setPersonnelXpEarned(true);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingPersonnelXP(false);
            }
        }
    };

    const handleFindPerson = async (id: string, zoomToElement: any) => {
        zoomToElement(id, 2.5, 800);

        const targets = [
            { id: 'direktur', label: 'Direktur Utama' },
            { id: 'kepsek', label: 'Kepala Sekolah' },
            { id: 'kkomite', label: 'Komite Sekolah' },
            { id: 'admin', label: 'Kep. Administrasi' }
        ];

        const label = targets.find(t => t.id === id)?.label;
        if (label) {
            setToastMessage(`🔍 Berhasil menemukan ${label}!`);
            setTimeout(() => setToastMessage(null), 3000);
        }

        if (foundPeople.includes(id)) return;

        const newFound = [...foundPeople, id];
        setFoundPeople(newFound);

        // Check if 4/4 found
        if (newFound.length === 4 && !gameXpEarned && userEmail && !loadingGameXP) {
            setLoadingGameXP(true);
            try {
                const { data: existing } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_email', userEmail)
                    .eq('mission_id', 'SYSTEM_MINIGAME_STRUKTUR')
                    .single();

                if (!existing) {
                    await supabase.from("user_progress").insert({
                        user_email: userEmail,
                        mission_id: "SYSTEM_MINIGAME_STRUKTUR",
                        score: 40,
                        created_at: new Date().toISOString()
                    });
                }
                setGameXpEarned(true);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingGameXP(false);
            }
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 80px' }}>
            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    ← Kembali ke Beranda
                </Link>
                <SignOutButton />
            </div>

            <div style={{
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                borderRadius: 32, padding: '48px 32px', color: 'white', marginBottom: 48,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 50px -12px rgba(15,23,42,0.3)',
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--theme-primary, #e11d48)', padding: '6px 12px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Tentang Kami
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Profil
                        </span>
                    </div>
                    <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        Manajemen Sekolah
                    </h1>
                    <p style={{ fontSize: 18, opacity: 0.9, fontWeight: 500, marginBottom: 24, maxWidth: 600, lineHeight: 1.5 }}>
                        Kenali dewan pimpinan dan struktur organisasi yang ada di SMK Telkom Malang.
                    </p>
                </div>
                <div style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', opacity: 0.2, filter: 'blur(40px)' }} />
            </div>

            <div style={{
                background: 'white', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0',
                marginBottom: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                {/* Header/Reward info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>Struktur Organisasi</h2>
                        <p style={{ fontSize: 13, color: '#64748b' }}>Bagan manajemen struktural SMK Telkom Malang</p>
                    </div>
                    {xpEarned ? (
                        <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>🎉</span> +15 XP Diraih!
                        </div>
                    ) : (
                        <div style={{ background: '#f1f5f9', color: '#64748b', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {loading ? "Menyimpan XP..." : "Membaca minimal 5 detik (+15 XP)"}
                        </div>
                    )}
                </div>

                <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', padding: 24 }}>
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.8}
                        maxScale={4}
                        centerOnInit={true}
                    >
                        {({ zoomIn, zoomOut, resetTransform, zoomToElement }) => (
                            <React.Fragment>
                                {/* Game Panel Controls */}
                                <div style={{ marginBottom: 20, padding: 16, background: gameXpEarned ? 'rgba(22, 163, 74, 0.05)' : 'rgba(239, 68, 68, 0.05)', border: `1px dashed ${gameXpEarned ? '#16a34a' : '#ef4444'}`, borderRadius: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: gameXpEarned ? '#16a34a' : '#ef4444' }}>🎮 Mini Game: Inspeksi Pimpinan!</div>
                                        <div style={{ fontSize: 12, fontWeight: 700, background: gameXpEarned ? '#dcfce7' : '#fee2e2', color: gameXpEarned ? '#16a34a' : '#ef4444', padding: '4px 10px', borderRadius: 99 }}>
                                            {gameXpEarned ? '🎉 Tuntas +40 XP' : `Progres: ${foundPeople.length}/4 (+40 XP)`}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {[
                                            { id: 'direktur', label: 'Direktur Utama' },
                                            { id: 'kepsek', label: 'Kepala Sekolah' },
                                            { id: 'kkomite', label: 'Komite Sekolah' },
                                            { id: 'admin', label: 'Kep. Administrasi' }
                                        ].map(target => (
                                            <button
                                                key={target.id}
                                                onClick={() => handleFindPerson(target.id, zoomToElement)}
                                                style={{
                                                    background: foundPeople.includes(target.id) ? '#dcfce7' : 'white',
                                                    border: `1px solid ${foundPeople.includes(target.id) ? '#16a34a' : '#e2e8f0'}`,
                                                    color: foundPeople.includes(target.id) ? '#16a34a' : '#475569',
                                                    padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {foundPeople.includes(target.id) ? '✅' : '🔍'} Cari {target.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                                        <button onClick={() => zoomIn()} style={{ padding: '6px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer', fontSize: 16, color: '#475569' }}>+</button>
                                        <button onClick={() => zoomOut()} style={{ padding: '6px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer', fontSize: 16, color: '#475569' }}>-</button>
                                        <button onClick={() => resetTransform()} style={{ padding: '6px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Reset</button>
                                    </div>
                                </div>

                                <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', cursor: 'grab', touchAction: 'none' }}>
                                    <TransformComponent wrapperStyle={{ width: '100%', height: 'auto', background: 'white' }}>
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <img
                                                src="https://smktelkom-mlg.sch.id/assets/upload/images/Bagan-Telkom-2026.jpg"
                                                alt="Bagan Struktur Organisasi SMK Telkom Malang"
                                                style={{ width: '100%', height: 'auto', display: 'block' }}
                                            />
                                            {/* Targets mapped over image */}
                                            {[
                                                { id: 'direktur', top: '15%', left: '44%', w: '12%', h: '8%', label: 'Direktur Utama' },
                                                { id: 'kepsek', top: '35%', left: '44%', w: '12%', h: '8%', label: 'Kepala Sekolah' },
                                                { id: 'kkomite', top: '33%', left: '26%', w: '12%', h: '8%', label: 'Komite Sekolah' },
                                                { id: 'admin', top: '51%', left: '61%', w: '12%', h: '6%', label: 'Kep. Administrasi' }
                                            ].map(target => (
                                                <div
                                                    key={`target-${target.id}`}
                                                    id={target.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFindPerson(target.id, zoomToElement);
                                                    }}
                                                    title={`Klik untuk inspeksi ${target.label}`}
                                                    style={{
                                                        position: 'absolute',
                                                        top: target.top,
                                                        left: target.left,
                                                        width: target.w,
                                                        height: target.h,
                                                        border: foundPeople.includes(target.id) ? '3px solid #16a34a' : 'none',
                                                        backgroundColor: foundPeople.includes(target.id) ? 'rgba(22, 163, 74, 0.2)' : 'transparent',
                                                        borderRadius: 8,
                                                        pointerEvents: 'auto',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.4s',
                                                        boxShadow: foundPeople.includes(target.id) ? '0 0 20px rgba(22, 163, 74, 0.6)' : 'none',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </TransformComponent>
                                </div>
                            </React.Fragment>
                        )}
                    </TransformWrapper>
                </div>
            </div>

            {/* Custom Toast Notification for Mini-game */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: 32,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(30, 41, 59, 0.95)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: 99,
                    fontSize: 14,
                    fontWeight: 700,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    zIndex: 9999,
                    animation: 'slideUpFade 0.3s ease-out forwards',
                }}>
                    {toastMessage}
                </div>
            )}
            <style>{`
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>

            <div style={{
                background: 'white', borderRadius: 24, padding: '32px 24px', border: '1px solid #e2e8f0',
                marginBottom: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>Personil Unit Sekolah</h2>
                        <p style={{ fontSize: 13, color: '#64748b' }}>Daftar personel lengkap berdasarkan divisi penugasan</p>
                    </div>
                    {personnelXpEarned ? (
                        <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>🎉</span> +20 XP Diraih!
                        </div>
                    ) : (
                        <div style={{ background: '#f1f5f9', color: '#64748b', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {loadingPersonnelXP ? "Menyimpan XP..." : "Klik untuk membuka divisi (+20 XP)"}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {personnelData.map((dept, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
                            <div
                                onClick={() => toggleDept(idx)}
                                style={{
                                    background: dept.color,
                                    padding: '16px 20px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    userSelect: 'none',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{dept.category}</h3>
                                <div style={{
                                    transform: expandedDepts.includes(idx) ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                    fontSize: 14,
                                    fontWeight: 800
                                }}>▼</div>
                            </div>

                            <div style={{
                                overflow: 'hidden',
                                height: expandedDepts.includes(idx) ? 'auto' : 0,
                                opacity: expandedDepts.includes(idx) ? 1 : 0,
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ padding: 16, overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                                        <thead style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                            <tr>
                                                <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: '#475569', width: 60 }}>No.</th>
                                                {/* <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: '#475569', width: 120 }}>NIP</th> */}
                                                <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: '#475569' }}>Nama</th>
                                                <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: '#475569' }}>Jabatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dept.members.map((member, mIdx) => (
                                                <tr key={mIdx} style={{ borderBottom: '1px solid #e2e8f0', background: mIdx % 2 === 0 ? 'white' : '#f8fafc' }}>
                                                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>{mIdx + 1}</td>
                                                    {/* <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{member.nip}</td> */}
                                                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{member.nama}</td>
                                                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{member.jabatan}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Facts Context Section */}
            <div style={{ background: '#f8fafc', borderRadius: 24, padding: 32, border: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 24 }}>🧭</div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Pentingnya Mengenal Manajemen</h3>
                </div>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 12 }}>
                    Memahami struktur organisasi melatih kesadaran profesional (Professional Awareness). Di dunia industri nyata, Anda harus tahu siapa atasan Anda, pembagian divisi, dan ke mana harus melaporkan masalah sesuai dengan eskalasi yang tepat.
                </p>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                    Selain itu, komunikasi yang tepat sasaran juga mencegah redudansi pesan dan menjaga etika komunikasi (Respectful Communication).
                </p>
            </div>
        </div>
    );
}
