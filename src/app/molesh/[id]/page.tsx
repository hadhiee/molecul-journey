import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import MoleshXPCollector from "@/components/MoleshXPCollector";

export default async function MoleshSessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");

    const userEmail = session.user?.email?.toLowerCase() || "";

    const sessions: Record<string, any> = {
        "S2": {
            title: "Deep Dive 'Sadari' – Personal Branding & Growth Mindset",
            curriculum: "Sesi 2",
            pilar: "SADARI",
            color: "#6366f1",
            emoji: "🧠",
            content: [
                {
                    h: "The Debugging Mindset",
                    p: "Menganggap kegagalan (error/bug) sebagai data, bukan identitas diri. Ingat: Error adalah bukti bahwa Anda sedang mencoba sesuatu yang baru."
                },
                {
                    h: "Fixed vs Growth Mindset di IT",
                    p: "Mengapa 'Saya SELESAI mempelajari materi ini' lebih baik daripada 'Saya tidak bakat coding'. Skill IT bisa dilatih, bukan bawaan lahir."
                },
                {
                    h: "Personal SWOT",
                    p: "Memetakan Strengths (Coding/Networking), Weaknesses, Opportunities, dan Threats. Jadilah jujur pada diri sendiri untuk berkembang."
                },
                {
                    h: "Aktivitas: Readme.md Diri Sendiri",
                    p: "Tuliskan keahlian saat ini, apa yang ingin dipelajari, dan satu kelemahan yang ingin diperbaiki. Komitmen adalah langkah awal."
                }
            ]
        },
        "S3": {
            title: "Deep Dive 'Peduli' – Kolaborasi dalam Tim (Scrum & Peer Review)",
            curriculum: "Sesi 3",
            pilar: "PEDULI",
            color: "#059669",
            emoji: "🤝",
            content: [
                {
                    h: "Code Review dengan Empati",
                    p: "Cara memberi masukan tanpa menjatuhkan. Gunakan Teknik Sandwich Feedback (Pujian - Saran - Pujian)."
                },
                {
                    h: "Psychological Safety",
                    p: "Tim yang sukses adalah tim yang anggotanya berani bertanya tanpa takut dianggap bodoh. Bantu rekanmu jika mereka kesulitan."
                },
                {
                    h: "Listening as a Leader",
                    p: "Mendengar kebutuhan user atau rekan satu tim sebelum memberikan solusi teknis. Empati mendahului logika."
                },
                {
                    h: "Simulasi: Peer Review Proyek",
                    p: "Periksa hasil pekerjaan teman (logika code atau desain jaringan) dan berikan saran perbaikan yang sopan dan membangun."
                }
            ]
        },
        "S4": {
            title: "Deep Dive 'Berani' – Mengambil Keputusan & Etika Digital",
            curriculum: "Sesi 4",
            pilar: "BERANI",
            color: "#be123c",
            emoji: "🚀",
            content: [
                {
                    h: "Fail Fast, Learn Faster",
                    p: "Keberanian merilis Minimum Viable Product (MVP). Berani gagal lebih awal berarti berani belajar lebih cepat."
                },
                {
                    h: "Integritas & Etika",
                    p: "Berani menolak tindakan tidak etis (pembajakan, serangan siber, atau manipulasi data) meskipun ada tekanan dari pihak manapun."
                },
                {
                    h: "Decision Making Berbasis Data",
                    p: "Menggunakan data (analisis log, traffic, performance) untuk mengambil keputusan teknis yang berisiko namun terukur."
                },
                {
                    h: "Aktivitas: The Hard Choice",
                    p: "Skenario dilema: Jika deadline besok tapi sistem masih banyak bug, apakah Anda berani jujur ke klien atau justru menyembunyikannya?"
                }
            ]
        },
        "S5": {
            title: "Implementasi MOLESH dalam Kepemimpinan Organisasi",
            curriculum: "Sesi 5",
            pilar: "IMPLEMENTASI",
            color: "#1e1b4b",
            emoji: "👑",
            content: [
                {
                    h: "Situational Leadership",
                    p: "Memahami kapan harus menjadi instruktif (SADARI situasi) dan kapan harus memberikan dukungan penuh (PEDULI anggota)."
                },
                {
                    h: "Conflict Resolution",
                    p: "Menghadapi konflik di tim dengan kepala dingin. Manfaatkan kendali Prefrontal Cortex daripada serangan Amigdala yang emosional."
                },
                {
                    h: "Leading by Example",
                    p: "Seorang pemimpin adalah orang pertama yang melakukan pilar MOLESH. Jadilah teladan sebelum meminta orang lain berubah."
                },
                {
                    h: "Roleplay: Pemimpin vs Anggota Malas",
                    p: "Latihan menghadapi kendala tim dengan menerapkan SADARI (kontrol emosi), PEDULI (tanya kendala), dan BERANI (tegas memberi solusi)."
                }
            ]
        },
        "S6": {
            title: "Final Project – Rencana Aksi Moklet Hebat",
            curriculum: "Sesi 6",
            pilar: "FINAL",
            color: "#d97706",
            emoji: "🏅",
            content: [
                {
                    h: "Sustainability: Konsistensi Tanpa Batas",
                    p: "Bagaimana menjaga konsistensi MOLESH setelah sesi berakhir. Pemimpin hebat lahir dari kebiasaan kecil yang diulang-ulang."
                },
                {
                    h: "Networking & Koneksi Pilar",
                    p: "Membangun koneksi antar pilar: Sadari diri membantu kita Peduli, Peduli memberi kita alasan untuk Berani mengambil tantangan."
                },
                {
                    h: "Personal Leadership Roadmap",
                    p: "Membuat rencana aksi 3 bulan ke depan: Skill baru apa (Sadari), bantuan apa (Peduli), dan tantangan lomba apa (Berani)?"
                },
                {
                    h: "Penegasan Identitas",
                    p: "Saya Moklet. Saya Sadari. Saya Peduli. Saya Berani. Identitas ini yang akan membawa Anda sukses di dunia industri global."
                }
            ]
        }
    };

    const data = sessions[id];
    if (!data) notFound();

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Link href="/molesh" style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, color: '#64748b', textDecoration: 'none', marginBottom: 24 }}>
                ← Kembali ke Kurikulum
            </Link>

            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: `${data.color}15`, color: data.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                    }}>
                        {data.emoji}
                    </div>
                    <div>
                        <span style={{ fontSize: 10, fontWeight: 900, color: data.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Pilar {data.pilar} • {data.curriculum}
                        </span>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                            {data.title}
                        </h1>
                    </div>
                </div>
                <div style={{ width: 60, height: 4, background: data.color, borderRadius: 2 }} />
            </div>

            <div style={{ display: 'grid', gap: 24 }}>
                {data.content.map((item: any, i: number) => (
                    <div key={i} style={{
                        background: 'white', borderRadius: 24, padding: 24,
                        border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                    }}>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 24, height: 24, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#94a3b8' }}>{i + 1}</span>
                            {item.h}
                        </h3>
                        <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, fontWeight: 500 }}>
                            {item.p}
                        </p>
                    </div>
                ))}
            </div>

            <MoleshXPCollector
                sessionId={`MOLESH_${id}`}
                userEmail={userEmail}
                sessionTitle={data.title}
                xpAmount={1000}
            />

            {/* Navigasi Sesi Berikutnya */}
            <div style={{ marginTop: 60, borderTop: '1px solid #f1f5f9', paddingTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                {id !== "S2" ? (
                    <Link href={`/molesh/S${parseInt(id.slice(1)) - 1}`} style={{ textDecoration: 'none', color: '#64748b', fontSize: 13, fontWeight: 700 }}>
                        ← Sesi Sebelumnya
                    </Link>
                ) : <div />}

                {id !== "S6" ? (
                    <Link href={`/molesh/S${parseInt(id.slice(1)) + 1}`} style={{ textDecoration: 'none', color: '#1e1b4b', fontSize: 13, fontWeight: 800 }}>
                        Sesi Berikutnya →
                    </Link>
                ) : (
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>🎉 Tamat! Kurikulum Leadership Selesai.</span>
                )}
            </div>
        </div>
    );
}
