import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SignOutButton from "@/components/SignOutButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userEmail = session.user?.email || "";
  const userName = session.user?.name || "Agent";

  // Fetch real XP & mission count from Supabase
  let totalXP = 0;
  let missionCount = 0;

  try {
    const { data: progress } = await supabase
      .from("user_progress")
      .select("score, mission_id")
      .eq("user_email", userEmail);

    if (progress && progress.length > 0) {
      totalXP = progress.reduce((sum: number, p: any) => sum + (p.score || 0), 0);
      missionCount = progress.length;
    }
  } catch (e) { }

  // Fetch leaderboard
  let leaderboard: { name: string; score: number }[] = [];
  try {
    const { data: allProgress } = await supabase
      .from("user_progress")
      .select("user_email, score");

    if (allProgress && allProgress.length > 0) {
      const scoreMap: Record<string, number> = {};
      allProgress.forEach((p: any) => {
        scoreMap[p.user_email] = (scoreMap[p.user_email] || 0) + (p.score || 0);
      });
      leaderboard = Object.entries(scoreMap)
        .map(([email, score]) => ({ name: email.split("@")[0], score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }
  } catch (e) { }

  const chapterData = [
    { name: "Kelas Tangguh: Fondasi ATTITUDE", emoji: "🛡️", bg: "#fff1f2" },
    { name: "Lab Inovasi: Use Tech Wisely", emoji: "💻", bg: "#eff6ff" },
    { name: "Simulasi Industri: BISA di Dunia Kerja", emoji: "🏭", bg: "#f0fdf4" },
    { name: "Dampak Sosial: AKHLAK untuk Masyarakat", emoji: "🌍", bg: "#fefce8" }
  ];

  const rankColors = [
    { bg: '#fef3c7', text: '#d97706' },
    { bg: '#f1f5f9', text: '#64748b' },
    { bg: '#fed7aa', text: '#c2410c' },
    { bg: '#f1f5f9', text: '#64748b' },
    { bg: '#f1f5f9', text: '#64748b' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 48px' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #e11d48, #be123c, #9f1239)',
        borderRadius: 24, padding: 28, color: 'white', marginBottom: 32,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 16px 48px -8px rgba(225,29,72,0.4)',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const, opacity: 0.7 }}>
              Moklet Learning Culture
            </div>
            <SignOutButton />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4, lineHeight: 1.2 }}>
            Selamat Datang, {userName.split(" ")[0]} 👋
          </div>
          <div style={{ fontSize: 13, opacity: 0.7, fontWeight: 500, marginBottom: 20 }}>
            {userEmail}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '14px 20px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.2)', flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{totalXP.toLocaleString()}</div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', opacity: 0.7 }}>Total XP</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '14px 20px', textAlign: 'center' as const, border: '1px solid rgba(255,255,255,0.2)', flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{missionCount}</div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', opacity: 0.7 }}>Misi Selesai</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightning Challenge CTA */}
      <Link href="/challenge" style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f0f1e, #1e1b4b, #312e81)',
          borderRadius: 20, padding: 24, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid rgba(139,92,246,0.3)',
          boxShadow: '0 8px 32px -4px rgba(99,102,241,0.2)',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 6 }}>
              ⚡ Mode Baru
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
              Tantangan Kilat
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
              5 soal acak • 12 detik per soal • Combo multiplier!
            </div>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
            boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
          }}>
            ⚡
          </div>
        </div>
      </Link>

      {/* Future Architect CTA */}
      <Link href="/future" style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e3a5f, #0c4a6e)',
          borderRadius: 20, padding: 24, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid rgba(56,189,248,0.3)',
          boxShadow: '0 8px 32px -4px rgba(14,165,233,0.2)',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 6 }}>
              🏗️ Strategy Game
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
              Arsitek Masa Depan
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
              4 fase kehidupan • 8 dilema strategis • Profil masa depanmu!
            </div>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
            boxShadow: '0 4px 16px rgba(14,165,233,0.4)',
          }}>
            🏗️
          </div>
        </div>
      </Link>

      {/* Moklet Runner CTA */}
      <Link href="/runner" style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a0a2e, #2d1b4e, #4c1d95)',
          borderRadius: 20, padding: 24, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid rgba(139,92,246,0.3)',
          boxShadow: '0 8px 32px -4px rgba(139,92,246,0.2)',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#c4b5fd', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 6 }}>
              🎮 Grafis Game
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
              Moklet Runner
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
              Endless runner • Kumpulkan ATTITUDE • Double jump!
            </div>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
            boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
          }}>
            🏃
          </div>
        </div>
      </Link>

      {/* Journey Map CTA */}
      <Link href="/journey" style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7, #d9f99d)',
          borderRadius: 20, padding: 24, color: '#1a2e05',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid rgba(101,163,13,0.3)',
          boxShadow: '0 8px 32px -4px rgba(101,163,13,0.15)',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#65a30d', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 6 }}>
              🗺️ Adventure Map
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
              Journey Map Sekolah
            </div>
            <div style={{ fontSize: 12, color: '#4d7c0f', fontWeight: 500 }}>
              Jelajahi 5 lokasi • Hadapi skenario • Bangun ATTITUDE!
            </div>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #65a30d, #84cc16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
            boxShadow: '0 4px 16px rgba(101,163,13,0.3)',
          }}>
            🧑‍🎓
          </div>
        </div>
      </Link>

      {/* Simulation CTA */}
      <Link href="/simulation" style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe, #bfdbfe)',
          borderRadius: 20, padding: 24, color: '#1e3a8a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid rgba(37,99,235,0.3)',
          boxShadow: '0 8px 32px -4px rgba(37,99,235,0.15)',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 6 }}>
              🧠 Decision Game
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
              Moklet Culture Simulation
            </div>
            <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 500 }}>
              Simulasi keputusan visual novel • 40 Skenario • Uji Integritas!
            </div>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
            boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
          }}>
            🔮
          </div>
        </div>
      </Link>

      {/* Section: Chapters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Pilih Chapter</h2>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#e11d48', background: '#fce7f3', padding: '5px 12px', borderRadius: 99, textTransform: 'uppercase' as const }}>4 Sectors</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 40 }}>
        {chapterData.map((ch, i) => (
          <Link key={i} href={`/chapter/${i + 1}`} style={{
            background: 'white', borderRadius: 20, overflow: 'hidden',
            border: '1px solid #e5e7eb', textDecoration: 'none',
            display: 'flex', flexDirection: 'column' as const,
          }}>
            <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: ch.bg, position: 'relative' }}>
              <span style={{ position: 'relative', zIndex: 1 }}>{ch.emoji}</span>
              <span style={{ position: 'absolute', right: 8, bottom: 0, fontSize: 48, fontWeight: 900, opacity: 0.06, lineHeight: 1 }}>0{i + 1}</span>
            </div>
            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' as const }}>
              <span style={{ display: 'inline-block', fontSize: 9, fontWeight: 800, color: '#e11d48', background: '#fff1f2', padding: '2px 8px', borderRadius: 6, marginBottom: 8, textTransform: 'uppercase' as const, width: 'fit-content' }}>
                Chapter {i + 1}
              </span>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.35, marginBottom: 12, flex: 1 }}>
                {ch.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                  <strong style={{ color: '#1a1a2e' }}>10</strong> Misi
                </span>
                <span style={{ width: 24, height: 24, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 12 }}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Leaderboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Leaderboard</h2>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#e11d48', background: '#fce7f3', padding: '5px 12px', borderRadius: 99, textTransform: 'uppercase' as const }}>Top {leaderboard.length || '-'}</span>
      </div>
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {leaderboard.length > 0 ? leaderboard.map((player, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', padding: '16px 20px',
            borderBottom: i < leaderboard.length - 1 ? '1px solid #f3f4f6' : 'none',
            gap: 14,
          }}>
            <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, background: rankColors[i]?.bg || '#f1f5f9', color: rankColors[i]?.text || '#64748b' }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{player.name}</div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>{player.score.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>XP</div>
            </div>
          </div>
        )) : (
          <div style={{ padding: '32px 20px', textAlign: 'center' as const, color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
            Belum ada data. Selesaikan misi untuk tampil di sini!
          </div>
        )}
      </div>
    </div>
  );
}
