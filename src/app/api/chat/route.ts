import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ reply: "Pesan kosong." }, { status: 400 });
        }

        const systemPrompt = `Anda adalah asisten AI resmi bernama "MoLeCul AI" untuk game edukasi "MoLeCul" (Moklet Learning Culture Journey). Game ini ditujukan untuk siswa SMK Telkom Malang untuk belajar budaya, salat, mengaji (quran), dan kegiatan ramadan dll melalui gamifikasi (peta, chapter, leaderboard, dsb). Selalu jawab pertanyaan dengan ramah, suportif, informatif, dan menggunakan gaya bahasa yang santai namun sopan seperti seorang mentor ke siswa. Jawab menggunakan Bahasa Indonesia.`;

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
