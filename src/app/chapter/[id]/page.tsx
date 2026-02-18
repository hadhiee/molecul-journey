import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: chapterId } = await params;
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email?.toLowerCase();

    const { data: scenarios } = await supabase
        .from("scenarios")
        .select("*")
        .eq("chapter", chapterId)
        .order("created_at", { ascending: true });

    let completedIds = new Set<string>();
    if (userEmail && scenarios && scenarios.length > 0) {
        const { data: progress } = await supabase
            .from("user_progress")
            .select("mission_id")
            .eq("user_email", userEmail)
            .in("mission_id", scenarios.map(s => s.id));

        if (progress) {
            progress.forEach(p => completedIds.add(p.mission_id));
        }
    }

    const chapterNames: Record<string, string> = {
        "1": "Kelas Tangguh: Fondasi ATTITUDE",
        "2": "Lab Inovasi: Use Tech Wisely",
        "3": "Simulasi Industri: BISA di Dunia Kerja",
        "4": "Dampak Sosial: AKHLAK untuk Masyarakat"
    };

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Link href="/" style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#94a3b8', textDecoration: 'none', marginBottom: 20 }}>
                ← Kembali
            </Link>
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#e11d48', background: '#fff1f2', padding: '4px 12px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                Chapter {chapterId}
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.03em', marginBottom: 28, lineHeight: 1.3 }}>
                {chapterNames[chapterId] || "Chapter Detail"}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {scenarios?.map((s, i) => (
                    <Link key={s.id} href={`/mission/${s.id}`} style={{
                        background: 'white', border: '1px solid #e5e7eb', borderRadius: 16,
                        padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        textDecoration: 'none', gap: 12, transition: 'all 0.3s',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: 20, fontWeight: 900,
                                color: completedIds.has(s.id) ? '#22c55e' : '#e5e7eb',
                                minWidth: 32, flexShrink: 0
                            }}>
                                {completedIds.has(s.id) ? '✓' : String(i + 1).padStart(2, '0')}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 14, fontWeight: 700,
                                    color: completedIds.has(s.id) ? '#059669' : '#1a1a2e',
                                    marginBottom: 6, lineHeight: 1.4,
                                    textDecoration: completedIds.has(s.id) ? 'line-through' : 'none',
                                    opacity: completedIds.has(s.id) ? 0.7 : 1
                                }}>
                                    {s.title}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {Array.isArray(s.tags) ? s.tags.map((tag: string) => (
                                        <span key={tag} style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#f8fafc', color: '#94a3b8', border: '1px solid #f1f5f9' }}>
                                            {tag}
                                        </span>
                                    )) : (
                                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#f8fafc', color: '#94a3b8', border: '1px solid #f1f5f9' }}>
                                            General
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{
                            width: 32, height: 32, minWidth: 32, borderRadius: 10,
                            background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#cbd5e1', fontSize: 14, flexShrink: 0,
                        }}>
                            →
                        </div>
                    </Link>
                ))}

                {!scenarios?.length && (
                    <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8', fontWeight: 600, fontSize: 14 }}>
                        Belum ada misi di chapter ini.
                    </div>
                )}
            </div>
        </div>
    );
}
