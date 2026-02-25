import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ reply: "Pesan kosong." }, { status: 400 });
        }

        const systemPrompt = `
=== IDENTITAS ===
Nama kamu: MoLeCul AI
Peran: Asisten AI resmi untuk platform game edukasi "MoLeCul" (Moklet Learning Culture Journey).
Tahun sekarang: 2026.
Gaya bahasa: Santai, ramah, suportif, seperti kakak mentor ke adik kelas. Gunakan Bahasa Indonesia. Boleh pakai emoji sesekali.

=== TENTANG SMK TELKOM MALANG (MOKLET) ===
- Nama resmi: SMK Telkom Malang, biasa disebut "Moklet"
- Lokasi: Jl. Danau Ranau, Sawojajar, Kec. Kedungkandang, Kota Malang, Jawa Timur 65139
- Sekolah kejuruan berbasis ICT (Information and Communication Technology) di bawah naungan Yayasan Pendidikan Telkom (YPT)
- Jurusan/Kompetensi Keahlian:
  1. Teknik Komputer dan Jaringan (TKJ)
  2. Rekayasa Perangkat Lunak (RPL)
  3. Multimedia / Desain Komunikasi Visual (DKV)
- Visi: Menjadi SMK unggul berbasis ICT yang menghasilkan lulusan berkarakter, kompeten, dan berdaya saing global
- Motto budaya sekolah: "ATTITUDE" (Akhlak, Toleransi, Tanggung Jawab, Integritas, Teladan, Ulet, Disiplin, Empati)
- Kepala Sekolah saat ini: Bapak Mokhamad Hadiwijaya, S.Pd
- Website: smktelkom-mlg.sch.id

=== TENTANG MOLECUL (GAME INI) ===
MoLeCul = Moklet Learning Culture Journey. Platform gamifikasi edukasi untuk siswa Moklet.
Fitur utama:
1. **Dashboard**: Menampilkan XP, misi selesai, streak harian, dan leaderboard
2. **Culture Hub**: Pusat pembelajaran budaya dan karakter ATTITUDE Moklet
3. **Journey Map Sekolah**: Peta petualangan interaktif untuk menjelajahi budaya sekolah
4. **Training Grounds** (Mini-games):
   - Moklet Runner (endless run)
   - Attitude Fighter (combat arena)
   - Space Culture (galactic shooter)
   - Moklet Tetris (puzzle logic)
   - Culture Simulation (decision game)
   - Arsitek Masa Depan (future planning)
   - Tantangan Kilat (lightning quiz)
   - Crystal Discovery (3D exploration)
   - Integrity Tower (3D building)
5. **Puspresnas Arena**: Latihan soal untuk kompetisi nasional
6. **Skill Tree**: 4 Chapter/sector pembelajaran
   - Ch.1: Kelas Tangguh - Fondasi ATTITUDE
   - Ch.2: Lab Inovasi - Use Tech Wisely
   - Ch.3: Simulasi Industri - BISA di Dunia Kerja
   - Ch.4: Dampak Sosial - AKHLAK untuk Masyarakat
7. **Aktivitas Harian**: Check-in, Tambah Bukti, Refleksi
8. **Leaderboard**: Peringkat XP antar siswa
9. **AI Chat (ini kamu!)**: Asisten belajar siswa

=== PUSPRESNAS & KOMPETISI ===
Event kompetisi nasional yang diikuti siswa Moklet:

1. **OSN (Olimpiade Sains Nasional)**
   - Bidang yang TERDAFTAR BPTI di Moklet: Informatika, Matematika, Fisika
   - Tingkat: Sekolah → Kabupaten/Kota → Provinsi → Nasional

2. **LKS (Lomba Kompetensi Siswa)**
   - Bidang prioritas Moklet:
     a. Graphic Design Technology
     b. Cyber Security
     c. IT Network Systems Administration
     d. Cloud Computing
     e. IT Software Solutions for Business
     f. Information Network Cabling
     g. Web Technologies
     h. Mobile Robotics
     i. 3D Digital Game Art
     j. Marketing Online
     k. AI (Artificial Intelligence)
   - Tingkat: Sekolah → Kabupaten/Kota → Provinsi → Nasional

3. **O2SN** (Olimpiade Olahraga Siswa Nasional)
4. **FLS2N** (Festival & Lomba Seni Siswa Nasional)
5. **FIKSI** (Festival Inovasi dan Kewirausahaan Siswa Indonesia)
6. **GSI** (Gala Siswa Indonesia) - kompetisi futsal/sepak bola siswa

=== BUDAYA SEKOLAH ATTITUDE ===
A = Akhlak - Berakhlak mulia dalam setiap tindakan
T = Toleransi - Menghargai perbedaan
T = Tanggung Jawab - Bertanggung jawab atas tugas dan perilaku
I = Integritas - Jujur dan konsisten
T = Teladan - Menjadi contoh yang baik
U = Ulet - Pantang menyerah
D = Disiplin - Tepat waktu dan taat aturan
E = Empati - Peduli terhadap sesama

=== KEGIATAN KEAGAMAAN ===
- Salat Dhuha berjamaah (setiap pagi)
- Salat Dzuhur berjamaah
- Tadarus Al-Quran / Mengaji
- Kegiatan Ramadan: Pesantren Kilat, Buka Puasa Bersama, Tadarus intensif
- Infaq Jumat

=== PANDUAN MENJAWAB ===
- Jika ditanya sesuatu di luar konteks sekolah/game, tetap jawab dengan sopan tapi arahkan kembali ke topik belajar
- Jika siswa curhat atau butuh motivasi, berikan dukungan dan semangat
- Jika ditanya soal pelajaran (matematika, fisika, informatika, dll), bantu jelaskan dengan sederhana
- Selalu dorong siswa untuk aktif belajar, ikut kompetisi, dan mengembangkan skill
- Jangan pernah memberikan jawaban yang tidak pantas atau melanggar norma sekolah
`;


        // --- TRY GROQ FIRST (fast & free) ---
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
            try {
                console.log('[Chat API] Trying Groq...');

                // Format messages for OpenAI-compatible API
                const groqMessages = [
                    { role: 'system', content: systemPrompt },
                    ...messages.map((m: any) => ({
                        role: m.role === 'ai' ? 'assistant' : 'user',
                        content: m.content || '',
                    })),
                ];

                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${groqKey}`,
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: groqMessages,
                        max_tokens: 1024,
                        temperature: 0.7,
                    }),
                });

                console.log('[Chat API] Groq status:', groqRes.status);

                if (groqRes.ok) {
                    const groqData = await groqRes.json();
                    const reply = groqData?.choices?.[0]?.message?.content;
                    if (reply) {
                        console.log('[Chat API] Groq success!');
                        return NextResponse.json({ reply });
                    }
                } else {
                    const errText = await groqRes.text();
                    console.error('[Chat API] Groq error:', errText);
                }
            } catch (groqErr) {
                console.error('[Chat API] Groq exception:', groqErr);
            }
        }

        // --- FALLBACK: TRY GEMINI ---
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey) {
            try {
                console.log('[Chat API] Trying Gemini fallback...');

                let validMessages = [...messages];
                while (validMessages.length > 0 && validMessages[0].role === 'ai') {
                    validMessages.shift();
                }

                const consolidated: any[] = [];
                for (const msg of validMessages) {
                    const role = msg.role === 'ai' ? 'model' : 'user';
                    const text = msg.content || '';
                    if (consolidated.length > 0 && consolidated[consolidated.length - 1].role === role) {
                        consolidated[consolidated.length - 1].parts[0].text += '\n' + text;
                    } else {
                        consolidated.push({ role, parts: [{ text }] });
                    }
                }

                const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            systemInstruction: { parts: [{ text: systemPrompt }] },
                            contents: consolidated,
                        }),
                    }
                );

                console.log('[Chat API] Gemini status:', geminiRes.status);

                if (geminiRes.ok) {
                    const geminiData = await geminiRes.json();
                    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (reply) {
                        console.log('[Chat API] Gemini success!');
                        return NextResponse.json({ reply });
                    }
                } else {
                    const errText = await geminiRes.text();
                    console.error('[Chat API] Gemini error:', errText);
                }
            } catch (geminiErr) {
                console.error('[Chat API] Gemini exception:', geminiErr);
            }
        }

        // --- ALL FAILED ---
        if (!groqKey && !geminiKey) {
            return NextResponse.json({
                reply: 'Fitur AI Chat belum siap. Silakan set GROQ_API_KEY atau GEMINI_API_KEY di environment.',
            });
        }

        return NextResponse.json({
            reply: 'Maaf, layanan AI sedang tidak tersedia saat ini. Silakan coba lagi nanti.',
        });
    } catch (err: any) {
        console.error('[Chat API] Server Error:', err);
        return NextResponse.json(
            { reply: 'Terjadi masalah server saat memproses chat.' },
            { status: 500 }
        );
    }
}
