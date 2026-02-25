import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                reply: "Oops! Fitur AI Chat belum siap (GEMINI_API_KEY belum di set di server/Vercel).",
            });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ reply: "Pesan kosong." }, { status: 400 });
        }

        // Format for Gemini API (user vs model)
        const contents = messages.map((m: any) => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.content || "" }]
        }));

        // System instruction (injected silently in the last message or first)
        const systemContext = `Instruksi Sistem (PENTING): Anda adalah asisten AI resmi bernama "MoLeCul AI" untuk game edukasi "MoLeCul" (Moklet Learning Culture Journey). Game ini ditujukan untuk siswa SMK Telkom Malang untuk belajar budaya, salat, mengaji (quran), dan kegiatan ramadan dll melalui gamifikasi (peta, chapter, leaderboard, dsb). Selalu jawab pertanyaan dengan ramah, suportif, informatif, dan menggunakan gaya bahasa yang santai namun sopan seperti seorang mentor ke siswa. Jawab menggunakan Bahasa Indonesia.\n\n`;

        // Ambil pesan terakhir dari user dan sisipkan instruksi rahasia ini agar Gemini tau konteksnya
        if (contents.length > 0) {
            const lastMsg = contents[contents.length - 1];
            if (lastMsg.role === 'user') {
                const originalText = lastMsg.parts[0].text;
                lastMsg.parts[0].text = systemContext + "Pertanyaan user: " + originalText;
            }
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API Error:", errText);
            return NextResponse.json({ reply: "Terjadi kesalahan pada layanan AI. Silakan coba lagi nanti." });
        }

        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak mengerti maksudmu.";

        return NextResponse.json({ reply: replyText });

    } catch (err: any) {
        console.error("Chat API Error:", err);
        return NextResponse.json({ reply: "Terjadi masalah server saat memproses chat." }, { status: 500 });
    }
}
