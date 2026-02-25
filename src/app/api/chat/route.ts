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

        // System instruction
        const systemContext = `Instruksi Sistem (PENTING): Anda adalah asisten AI resmi bernama "MoLeCul AI" untuk game edukasi "MoLeCul" (Moklet Learning Culture Journey). Game ini ditujukan untuk siswa SMK Telkom Malang untuk belajar budaya, salat, mengaji (quran), dan kegiatan ramadan dll melalui gamifikasi (peta, chapter, leaderboard, dsb). Selalu jawab pertanyaan dengan ramah, suportif, informatif, dan menggunakan gaya bahasa yang santai namun sopan seperti seorang mentor ke siswa. Jawab menggunakan Bahasa Indonesia.\n\n`;

        // Format for Gemini API
        let validMessages = [...messages];
        // Gemini MUST start with a 'user' message
        while (validMessages.length > 0 && validMessages[0].role === 'ai') {
            validMessages.shift();
        }

        const consolidated: any[] = [];
        for (const msg of validMessages) {
            const role = msg.role === 'ai' ? 'model' : 'user';
            const text = msg.content || "";
            if (consolidated.length > 0 && consolidated[consolidated.length - 1].role === role) {
                consolidated[consolidated.length - 1].parts[0].text += "\n" + text;
            } else {
                consolidated.push({ role, parts: [{ text }] });
            }
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemContext }]
                },
                contents: consolidated
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
