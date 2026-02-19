import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

export default async function CulturePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    const pilarData = [
        {
            title: "Character",
            color: "#e11d48",
            bg: "#fff1f2",
            icon: "🛡️",
            points: ["Disiplin, jujur, tanggung jawab, konsisten", "Menepati deadline, tidak plagiasi, berani mengakui salah"]
        },
        {
            title: "Collaboration",
            color: "#2563eb",
            bg: "#eff6ff",
            icon: "🤝",
            points: ["Bagi peran, komunikasi jelas, saling bantu", "Standar tim: notulen, kesepakatan tugas, update progres"]
        },
        {
            title: "Communication",
            color: "#059669",
            bg: "#ecfdf5",
            icon: "📢",
            points: ["Berani bertanya, jelaskan ide dengan runtut", "Biasakan: tujuan–kondisi–kendala–opsi solusi"]
        },
        {
            title: "Critical Thinking",
            color: "#d97706",
            bg: "#fffbeb",
            icon: "🧠",
            points: ["Pakai data, cek fakta, cari akar masalah", "Berani mencoba pendekatan baru & belajar"]
        }
    ];

    const attitudeData = [
        {
            letter: "A",
            title: "Act Respectfully",
            subtitle: "Menjaga adab kepada guru dan saling menghargai sesama teman.",
            points: [
                "Membudayakan 5S (Senyum, Salam, Sapa, Sopan, Santun) saat guru masuk.",
                "Mendengarkan saat orang lain (guru/teman) berbicara (tidak menyela).",
                "Duduk dengan postur yang baik sebagai tanda hormat."
            ]
        },
        {
            letter: "T",
            title: "Talk Politely",
            subtitle: "Bertutur kata santun, positif, dan menghindari ucapan kasar.",
            points: [
                "Menggunakan Magic Words: Maaf, Tolong, dan Terima Kasih.",
                "Zero Tolerance terhadap kata-kata kasar atau body shaming.",
                "Berbicara menggunakan intonasi yang rendah dan tenang."
            ]
        },
        {
            letter: "T",
            title: "Turn Off Distraction",
            subtitle: "Fokus penuh pada materi, tidak bermain game atau medsos saat jam belajar.",
            points: [
                "Meletakkan HP di tas/laci (silent mode) saat sesi penjelasan materi.",
                "Hanya membuka tab browser yang relevan.",
                "Meminta izin jika ada panggilan darurat dari orang tua."
            ]
        },
        {
            letter: "I",
            title: "Involve Actively",
            subtitle: "Hadir sepenuhnya, merespon instruksi, dan aktif berpartisipasi.",
            points: [
                "Mencatat poin penting tanpa disuruh.",
                "Mengangkat tangan untuk menjadi relawan saat ada tantangan.",
                "Tidak menjadi silent reader atau 'patung' di dalam kelas."
            ]
        },
        {
            letter: "T",
            title: "Think Solutions",
            subtitle: "Berorientasi pada penyelesaian masalah, bukan mengeluh.",
            points: [
                "Membaca pesan error (debugging) sebelum memanggil guru.",
                "Mengubah mindset: 'Ini susah' menjadi 'Ini tantangan baru'.",
                "Menawarkan solusi alternatif saat diskusi kelompok."
            ]
        },
        {
            letter: "U",
            title: "Use Tech Wisely",
            subtitle: "Memanfaatkan teknologi & AI sebagai alat bantu belajar, bukan untuk plagiasi.",
            points: [
                "Jujur mencantumkan sumber jika mengutip dari internet/AI.",
                "Menggunakan internet sekolah untuk hal produktif.",
                "Menjaga keamanan akun dan data pribadi."
            ]
        },
        {
            letter: "D",
            title: "Dare to Ask",
            subtitle: "Membangun rasa ingin tahu dan tidak malu bertanya saat belum paham.",
            points: [
                "Berani bertanya 'Mengapa?' dan 'Bagaimana jika?'.",
                "Mengkonfirmasi pemahaman kepada guru/instruktur.",
                "Tidak menertawakan teman yang sedang bertanya."
            ]
        },
        {
            letter: "E",
            title: "Eager to Collaborate",
            subtitle: "Terbuka untuk bekerja sama, berbagi ilmu, dan berkontribusi.",
            points: [
                "Tidak 'one man show' dalam tugas kelompok.",
                "Membantu teman yang tertinggal (Tutor Sebaya).",
                "Menerima pembagian tugas dengan lapang dada."
            ]
        }
    ];

    const checklistItems = [
        "Saya datang siap (tepat waktu, perangkat siap, fokus)",
        "Saya aktif bertanya/menjawab minimal 1 kali hari ini",
        "Saya menyelesaikan tugas sesuai standar (rapi, lengkap)",
        "Saya kolaborasi (update progres tim, membantu rekan)",
        "Saya menerima feedback tanpa baper dan melakukan perbaikan",
        "Saya refleksi 2 menit: apa yang saya pahami & tingkatkan?"
    ];

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px' }}>
            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontWeight: 700, fontSize: 14 }}>
                    ← Kembali ke Beranda
                </Link>
                <SignOutButton />
            </div>

            {/* A. Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                borderRadius: 32, padding: '48px 32px', color: 'white', marginBottom: 48,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 50px -12px rgba(15,23,42,0.3)',
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        {['Character', 'Collaboration', 'Ready for Industry'].map((tag) => (
                            <span key={tag} style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        Moklet Learning Culture
                    </h1>
                    <p style={{ fontSize: 18, opacity: 0.9, fontWeight: 500, marginBottom: 24, maxWidth: 600, lineHeight: 1.5 }}>
                        Cara kita belajar dan bekerja di Moklet supaya siap industri: berkarakter, kolaboratif, adaptif, dan berorientasi hasil.
                    </p>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 24,
                        border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ fontSize: 15, lineHeight: 1.6, color: '#e2e8f0' }}>
                            "Moklet Learning Culture adalah kebiasaan bersama warga sekolah dalam belajar dan bekerja secara profesional. Fokusnya bukan hanya menyelesaikan tugas, tetapi membangun mindset bertumbuh."
                        </div>
                    </div>
                </div>
                <div style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, background: 'radial-gradient(circle, #e11d48 0%, transparent 70%)', opacity: 0.2, filter: 'blur(40px)' }} />
            </div>

            {/* B. Apa Itu Section */}
            <div style={{ marginBottom: 64 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: '#e11d48' }}>#</span> Apa itu Moklet Learning Culture?
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                    {[
                        { title: "Kesadaran Belajar", desc: "Tahu tujuan belajar hari ini, tahu apa yang mau ditingkatkan.", icon: "🎯" },
                        { title: "Kebermaknaan", desc: "Materi dikaitkan dengan konteks nyata (projek & kebutuhan industri).", icon: "💎" },
                        { title: "Kegembiraan Sehat", desc: "Belajar menantang tapi tetap manusiawi—ada dukungan & progres.", icon: "🌈" }
                    ].map((item, i) => (
                        <div key={i} style={{ background: 'white', padding: 28, borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon}</div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{item.title}</h3>
                            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 40, background: '#f8fafc', borderRadius: 24, padding: 32, border: '1px dashed #cbd5e1' }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, color: '#1e293b' }}>Output yang diharapkan dari siswa:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                        {[
                            "Bisa menjelaskan kenapa mempelajari sesuatu",
                            "Bisa menerapkan dalam tugas/projek nyata",
                            "Bisa mengevaluasi kekurangan & memperbaiki"
                        ].map((text, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <div style={{ width: 24, height: 24, borderRadius: 99, background: '#e11d48', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                                    {i + 1}
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#475569', lineHeight: 1.4 }}>{text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* C. Kenapa Penting Section */}
            <div style={{ marginBottom: 64, background: '#0f172a', borderRadius: 32, padding: 40, color: 'white' }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Kenapa ini penting untuk karier?</h2>
                <p style={{ color: '#94a3b8', marginBottom: 40 }}>Industri butuh sikap profesional, bukan cuma skill teknis.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[
                            "Kerja tim & komunikasi menentukan kelancaran delivery.",
                            "Adaptasi cepat karena tools dan kebutuhan berubah terus.",
                            "Problem solving: rumuskan masalah → data → eksekusi → review."
                        ].map((tip, i) => (
                            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <div style={{ color: '#31c48d' }}>✔</div>
                                <div style={{ fontSize: 15, fontWeight: 500 }}>{tip}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#10b981', marginBottom: 16 }}>Contoh Konkret</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { label: "Anak RPL", desc: "Bukan cuma coding jalan, tapi ada dokumentasi & kolaborasi Git." },
                                { label: "Anak TKJ", desc: "Bukan cuma jaringan nyala, tapi ada SOP & troubleshooting terstruktur." },
                                { label: "Anak PG", desc: "Bukan cuma visual bagus, tapi ada logika coding, mekanik gameplay, & user experience." }
                            ].map((ex, i) => (
                                <div key={i} style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 12 }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{ex.label}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{ex.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* D. Pilar Utama */}
            <div style={{ marginBottom: 64 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>4 Pilar Praktik di Moklet</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                    {pilarData.map((pilar, i) => (
                        <div key={i} style={{ background: pilar.bg, padding: 32, borderRadius: 28, border: `1px solid ${pilar.color}20` }}>
                            <div style={{ fontSize: 32, marginBottom: 16 }}>{pilar.icon}</div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: pilar.color, marginBottom: 12 }}>{pilar.title}</h3>
                            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                {pilar.points.map((point, pi) => (
                                    <li key={pi} style={{ fontSize: 13, color: '#475569', marginBottom: 8, lineHeight: 1.4, display: 'flex', gap: 8 }}>
                                        <span style={{ color: pilar.color }}>•</span> {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* ATTITUDE Section */}
            <div style={{ marginBottom: 64 }}>
                <div style={{
                    background: 'linear-gradient(135deg, #e11d48, #9f1239)',
                    borderRadius: 24, padding: '32px 40px', color: 'white', marginBottom: 32,
                    boxShadow: '0 20px 40px -10px rgba(225,29,72,0.2)'
                }}>
                    <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 8 }}>ATTITUDE</h2>
                    <p style={{ fontSize: 16, opacity: 0.9, fontWeight: 500 }}>Nilai dasar pengembangan karakter di Moklet Learning Culture</p>
                </div>

                <div style={{ display: 'grid', gap: 20 }}>
                    {attitudeData.map((item, i) => (
                        <div key={i} style={{
                            background: 'white', borderRadius: 24, padding: '24px 32px',
                            border: '1px solid #f1f5f9', display: 'flex', gap: 24,
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: 56, height: 56, minWidth: 56, borderRadius: 16,
                                background: '#fff1f2', color: '#e11d48',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 28, fontWeight: 900,
                                border: '1px solid #ffe4e6'
                            }}>
                                {item.letter}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{item.title}</h3>
                                <p style={{ fontSize: 14, color: '#e11d48', fontWeight: 600, marginBottom: 12 }}>{item.subtitle}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {item.points.map((point, pi) => (
                                        <div key={pi} style={{
                                            fontSize: 12, color: '#64748b', lineHeight: 1.4,
                                            padding: '6px 14px', background: '#f8fafc', borderRadius: 99,
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            {point}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* E. Praktik Harian */}
            <div style={{ marginBottom: 64, background: 'white', borderRadius: 32, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: 32, borderBottom: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Checklist Harian (ATTITUDE)</h2>
                    <p style={{ fontSize: 14, color: '#64748b' }}>Centang pencapaianmu hari ini dan simpan evaluasimu.</p>
                </div>
                <div style={{ padding: 32 }}>
                    {checklistItems.map((item, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: i < checklistItems.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ width: 20, height: 20, cursor: 'pointer', accentColor: '#e11d48' }} />
                            <span style={{ fontSize: 15, fontWeight: 500, color: '#1e293b' }}>{item}</span>
                        </label>
                    ))}
                    <button style={{
                        marginTop: 32, width: '100%', background: '#e11d48', color: 'white', border: 'none',
                        padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: 15, cursor: 'pointer',
                        boxShadow: '0 10px 20px -5px rgba(225,29,72,0.3)', transition: 'transform 0.2s'
                    }}>
                        Simpan Refleksi & Checklist 💾
                    </button>
                </div>
            </div>

            {/* F. Culture di dalam MoLeCul Game */}
            <div style={{ marginBottom: 64 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Cara MoLeCul Game melatih Learning Culture</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    {[
                        { title: "Bukan Sekadar Poin", desc: "Tiap quest mewakili kebiasaan profesional di industri.", icon: "💎" },
                        { title: "Reward Konsistensi", desc: "Dapatkan streak dan badge untuk disiplin & teamwork.", icon: "🔥" },
                        { title: "Refleksi Penutup", desc: "Selesaikan misi dengan evaluasi diri, bukan hanya kirim tugas.", icon: "📝" }
                    ].map((item, i) => (
                        <div key={i} style={{ background: '#f8fafc', padding: 24, borderRadius: 24, border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 24, marginBottom: 12 }}>{item.icon}</div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{item.title}</h3>
                            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 24, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: 24, padding: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: 16 }}>Mapping Quest × Culture</div>
                    <div style={{ display: 'grid', gap: 12 }}>
                        {[
                            { q: "Team Sprint", c: "Collaboration" },
                            { q: "Daily Reflection", c: "Character + Critical Thinking" },
                            { q: "Show Your Work", c: "Communication + Professionalism" }
                        ].map((m, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(37,99,235,0.1)' }}>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>Quest "{m.q}"</span>
                                <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 800 }}>→ {m.c}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* G. CTA Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <button style={{ background: 'white', border: '1px solid #e2e8f0', padding: '16px', borderRadius: 16, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Mulai Refleksi Harian
                </button>
                <button style={{ background: 'white', border: '1px solid #e2e8f0', padding: '16px', borderRadius: 16, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Lihat Aturan Main
                </button>
                <button style={{ background: '#e11d48', color: 'white', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                    Mulai Quest Pertama 🚀
                </button>
            </div>
        </div>
    );
}
