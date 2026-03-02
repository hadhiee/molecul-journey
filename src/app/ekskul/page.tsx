"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "@/components/SignOutButton";
import { supabase } from "@/lib/supabase";

const ekskulData = [
    { no: 1, nama: 'Pramuka', kategori: 'Krida', jadwal: 'Senin, Kamis', materi: 'Latihan simpul, ikatan, survival, dan baris-berbaris untuk membentuk karakter dan keterampilan lapangan.' },
    { no: 2, nama: 'Bola Voli', kategori: 'Olah raga', jadwal: 'Kamis', materi: 'Latihan teknik dasar seperti passing dan blocking, serta evaluasi strategi melalui mini turnamen.' },
    { no: 3, nama: 'Seni Tari', kategori: 'Olah rasa', jadwal: 'Selasa, Kamis', materi: 'Koreografi tari tradisional (Gandrung) dan modern (DBL dance), termasuk latihan pola lantai dan ekspresi gerak.' },
    { no: 4, nama: 'Seni Vokal', kategori: 'Olah rasa', jadwal: 'Kamis', materi: 'Pembelajaran membaca not balok, latihan vokal solo dan grup, serta teknik pernapasan dan penghayatan lagu.' },
    { no: 5, nama: 'Teater', kategori: 'Olah rasa', jadwal: 'Rabu, Kamis', materi: 'Dramatic reading naskah sastra, orientasi panggung, penghayatan karakter, dan teknik keaktoran.' },
    { no: 6, nama: 'Karawitan', kategori: 'Olah rasa', jadwal: 'Rabu', materi: 'Latihan menabuh gamelan, membaca notasi, dan memainkan gending tradisional seperti Gending Pantang.' },
    { no: 7, nama: 'Palang Merah Remaja', kategori: 'Krida', jadwal: 'Selasa', materi: 'Materi pertolongan pertama seperti penanganan kejang, luka terbuka/tertutup, dan dislokasi.' },
    { no: 8, nama: 'Fotografi', kategori: 'Olah rasa', jadwal: 'Rabu', materi: 'Teknik dan hunting foto dengan teknik panning, slow shutter, human freezing, dan makro.' },
    { no: 9, nama: 'Paskibra', kategori: 'Krida', jadwal: 'Senin', materi: 'Latihan formasi dan kedisiplinan baris-berbaris.' },
    { no: 10, nama: 'Pencak Silat', kategori: 'Olah raga', jadwal: 'Selasa', materi: 'Latihan gerakan dasar, lentukan kaki, dan persiapan lomba dengan evaluasi teknik sesuai aturan baru.' },
    { no: 11, nama: 'Bola Basket', kategori: 'Olah raga', jadwal: 'Senin, Rabu', materi: 'Persiapan pertandingan DBL, latihan teknik, evaluasi strategi, dan pelaksanaan mini turnamen.' },
    { no: 12, nama: 'Futsal', kategori: 'Olah raga', jadwal: 'Selasa, Kamis', materi: 'Pengenalan program ekskul, skema permainan, drill passing, dan simulasi mini series permainan.' },
    { no: 13, nama: 'English Conversation & Debate', kategori: 'Expertise', jadwal: 'Selasa, Rabu', materi: 'Latihan debat dan presentasi dalam bahasa Inggris untuk meningkatkan kemampuan speaking dan critical thinking.' },
    { no: 14, nama: 'Robotik', kategori: 'Expertise', jadwal: 'Senin, Rabu', materi: 'Perakitan robot, simulasi gerakan otomatis, dan evaluasi sensor serta kontrol dasar.' },
    { no: 15, nama: 'Graphic Design', kategori: 'Expertise', jadwal: 'Selasa, Rabu, Kamis', materi: 'Desain poster digital, editing foto, dan layout brosur untuk pengembangan kreativitas visual.' },
    { no: 16, nama: 'Cloud Computing', kategori: 'Expertise', jadwal: 'Senin, Kamis', materi: 'Pengenalan layanan cloud, simulasi deploy aplikasi, dan evaluasi penggunaan storage dan database.' },
    { no: 17, nama: 'IT Software Solution for Business', kategori: 'Expertise', jadwal: 'Selasa, Rabu', materi: 'Pembuatan aplikasi bisnis sederhana, simulasi sistem manajemen, dan evaluasi UI/UX.' },
    { no: 18, nama: 'Artificial Intelligence', kategori: 'Expertise', jadwal: 'Senin, Rabu', materi: 'Pengenalan machine learning, klasifikasi gambar, dan evaluasi model AI sederhana.' },
    { no: 19, nama: 'Cyber Security', kategori: 'Expertise', jadwal: 'Selasa, Rabu, Kamis', materi: 'Simulasi ancaman siber, pengenalan enkripsi, dan evaluasi sistem keamanan jaringan.' },
    { no: 20, nama: 'Drone Pilot', kategori: 'Expertise', jadwal: 'Rabu', materi: 'Latihan kontrol drone, simulasi pemetaan udara, dan teknologi UAV dalam industri kreatif dan survei.' },
    { no: 21, nama: 'Internet Network Cabling', kategori: 'Expertise', jadwal: 'Senin, Rabu', materi: 'Praktik instalasi kabel jaringan, simulasi LAN, dan troubleshooting konektivitas.' },
    { no: 22, nama: 'IT Network Systems Administration', kategori: 'Expertise', jadwal: 'Selasa, Rabu', materi: 'Instalasi server, manajemen user, dan evaluasi sistem keamanan serta administrasi jaringan.' }
];

export default function EkskulPage() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email;

    const [filterCategory, setFilterCategory] = useState<string>('Semua');
    const [xpAwarded, setXpAwarded] = useState(false);

    const categories = ['Semua', ...Array.from(new Set(ekskulData.map(item => item.kategori)))];

    const filteredData = filterCategory === 'Semua'
        ? ekskulData
        : ekskulData.filter(item => item.kategori === filterCategory);

    useEffect(() => {
        // Award XP for exploring this page
        if (userEmail && !xpAwarded) {
            const awardXp = async () => {
                try {
                    const { data: existing } = await supabase
                        .from("user_progress")
                        .select("*")
                        .eq("user_email", userEmail)
                        .eq("mission_id", "SYSTEM_EXPLORE_EKSKUL")
                        .single();

                    if (!existing) {
                        await supabase.from("user_progress").insert({
                            user_email: userEmail,
                            mission_id: "SYSTEM_EXPLORE_EKSKUL",
                            score: 20,
                            created_at: new Date().toISOString()
                        });
                        setXpAwarded(true);
                    }
                } catch (e) {
                    console.error("Gagal menambahkan XP", e);
                }
            };

            const timer = setTimeout(awardXp, 5000); // Awared after 5s active viewing
            return () => clearTimeout(timer);
        }
    }, [userEmail, xpAwarded]);

    const getCategoryColor = (kategori: string) => {
        switch (kategori) {
            case 'Krida': return { bg: '#fee2e2', text: '#ef4444' };
            case 'Olah raga': return { bg: '#e0e7ff', text: '#4f46e5' };
            case 'Olah rasa': return { bg: '#fef3c7', text: '#f59e0b' };
            case 'Expertise': return { bg: '#dcfce7', text: '#16a34a' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 80px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    ← Kembali ke Beranda
                </Link>
                {session && <SignOutButton />}
            </div>

            <div style={{
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                borderRadius: 24, padding: '32px 24px', color: 'white', marginBottom: 32,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 50px -12px rgba(15,23,42,0.3)',
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, background: '#e11d48', padding: '6px 12px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Aktivitas
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Pengembangan Diri
                        </span>
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        Ekstrakurikuler Moklet
                    </h1>
                    <p style={{ fontSize: 15, opacity: 0.9, fontWeight: 500, marginBottom: 16, maxWidth: 600, lineHeight: 1.5 }}>
                        Pilih wadah pengembangan bakat dan minatmu karena anak Moklet selalu aktif, kreatif, dan inspiratif!
                    </p>
                </div>
            </div>

            {xpAwarded && (
                <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: 12, marginBottom: 24, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, animation: 'slidedown 0.5s ease' }}>
                    <span>✨</span> Kamu mendapat +20 XP karena telah mengeksplorasi ragam ekstrakurikuler!
                </div>
            )}

            <div style={{ marginBottom: 24, overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 8 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 99,
                                fontSize: 14,
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: filterCategory === cat ? '#e11d48' : '#f1f5f9',
                                color: filterCategory === cat ? 'white' : '#475569',
                                boxShadow: filterCategory === cat ? '0 4px 12px rgba(225,29,72,0.3)' : 'none'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {filteredData.map(item => {
                    const colorScheme = getCategoryColor(item.kategori);
                    return (
                        <div key={item.no} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', flex: 1, paddingRight: 8 }}>
                                    {item.nama}
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 800, background: colorScheme.bg, color: colorScheme.text, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {item.kategori}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 12 }}>
                                <span>📅</span> {item.jadwal}
                            </div>

                            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, flex: 1 }}>
                                {item.materi}
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
