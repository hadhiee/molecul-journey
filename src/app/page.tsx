import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  const userImage = session.user?.image || "";

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
    { name: "Kelas Tangguh: Fondasi ATTITUDE", emoji: "🛡️", bg: "#fff1f2", color: "#e11d48", nodes: 12, completed: 7 },
    { name: "Lab Inovasi: Use Tech Wisely", emoji: "💻", bg: "#eff6ff", color: "#3b82f6", nodes: 10, completed: 3 },
    { name: "Simulasi Industri: BISA di Dunia Kerja", emoji: "🏭", bg: "#f0fdf4", color: "#22c55e", nodes: 15, completed: 0 },
    { name: "Dampak Sosial: AKHLAK untuk Masyarakat", emoji: "🌍", bg: "#fefce8", color: "#f59e0b", nodes: 8, completed: 0 }
  ];

  const rankColors = [
    { bg: '#fef3c7', text: '#d97706' },
    { bg: '#f1f5f9', text: '#64748b' },
    { bg: '#fed7aa', text: '#c2410c' },
    { bg: '#f1f5f9', text: '#64748b' },
    { bg: '#f1f5f9', text: '#64748b' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px' }}>

      {/* 1. Banner User */}
      <div style={{
        background: 'linear-gradient(135deg, #e11d48, #be123c, #9f1239)',
        borderRadius: 28, padding: 28, color: 'white', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 48px -12px rgba(225,29,72,0.4)',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={userImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                alt={userName}
                style={{
                  width: 56, height: 56, borderRadius: 20,
                  border: '2px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                }}
              />
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' as const, opacity: 0.8, marginBottom: 4 }}>
                  Moklet Learning Culture
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Hai, {userName.split(" ")[0]}! 👋
                </div>
              </div>
            </div>
            <SignOutButton />
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '16px 20px', flex: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>{totalXP.toLocaleString()}</div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, opacity: 0.7 }}>Total XP</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '16px 20px', flex: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>{missionCount}</div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, opacity: 0.7 }}>Misi Selesai</div>
            </div>
          </div>

          {/* Mini Indicators */}
          <div style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.15)', padding: '6px 14px', borderRadius: 99 }}>
              🔥 <span style={{ opacity: 0.9 }}>Streak:</span> 5 Hari
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.15)', padding: '6px 14px', borderRadius: 99 }}>
              📁 <span style={{ opacity: 0.9 }}>Bukti:</span> 12 Minggu ini
            </div>
          </div>
        </div>
      </div>

      {/* 2. Panel Hari Ini (Check-in/Bukti/Refleksi) */}
      <div style={{
        background: 'white', borderRadius: 24, padding: 24, marginBottom: 32,
        border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12
      }}>
        <div style={{ gridColumn: 'span 3', marginBottom: 4 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
            Aktivitas Hari Ini
          </h3>
        </div>
        <button style={{
          background: '#f1f5f9', border: 'none', padding: '16px 12px', borderRadius: 16,
          display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, cursor: 'pointer'
        }}>
          <span style={{ fontSize: 24 }}>🗓️</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>Check-in</span>
        </button>
        <button style={{
          background: '#f1f5f9', border: 'none', padding: '16px 12px', borderRadius: 16,
          display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, cursor: 'pointer'
        }}>
          <span style={{ fontSize: 24 }}>📤</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>Tambah Bukti</span>
        </button>
        <Link href="/culture" style={{
          background: '#fff1f2', border: '1px solid #ffe4e6', padding: '16px 12px', borderRadius: 16,
          display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, textDecoration: 'none'
        }}>
          <span style={{ fontSize: 24 }}>📝</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#e11d48' }}>Refleksi</span>
        </Link>
      </div>

      {/* 3. Culture Hub Card */}
      <Link href="/culture" style={{ textDecoration: 'none', display: 'block', marginBottom: 40 }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          borderRadius: 24, padding: 24, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 24px -8px rgba(0,0,0,0.2)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#e11d48', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 6 }}>
              Culture Hub
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
              Pengenalan Moklet Learning Culture
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
              Pusat pembelajaran budaya & karakter ATTITUDE
            </div>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <span className="animate-float">📖</span>
          </div>
        </div>
      </Link>

      {/* 4. Game Cards */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Game Kompetensi</h2>
      </div>
      <div style={{ display: 'grid', gap: 16, marginBottom: 48 }}>
        {/* Lightning Challenge */}
        <Link href="/challenge" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f0f1e, #1e1b4b)', borderRadius: 20, padding: 20, color: 'white', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase' as const, marginBottom: 2 }}>Mode Kilat</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Tantangan Kilat</div>
            </div>
          </div>
        </Link>

        {/* Future Architect */}
        <Link href="/future" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #0c4a6e)', borderRadius: 20, padding: 20, color: 'white', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(56,189,248,0.2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏗️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' as const, marginBottom: 2 }}>Strategy</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Arsitek Masa Depan</div>
            </div>
          </div>
        </Link>

        {/* Moklet Runner */}
        <Link href="/runner" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #1a0a2e, #4c1d95)', borderRadius: 20, padding: 20, color: 'white', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏃</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#c4b5fd', textTransform: 'uppercase' as const, marginBottom: 2 }}>Action</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Moklet Runner</div>
            </div>
          </div>
        </Link>

        {/* Journey Map Sekolah */}
        <Link href="/journey" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: 20, padding: 20, color: '#1a2e05', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(101,163,13,0.2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#65a30d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🗺️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#65a30d', textTransform: 'uppercase' as const, marginBottom: 2 }}>Adventure Map</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Journey Map Sekolah</div>
            </div>
          </div>
        </Link>

        {/* Culture Simulation */}
        <Link href="/simulation" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: 20, padding: 20, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(37,99,235,0.2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🔮</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' as const, marginBottom: 2 }}>Decision Game</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Moklet Culture Simulation</div>
            </div>
          </div>
        </Link>
      </div>

      {/* 5. Pilih Chapter (Skill Tree) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Skill Tree: Pilih Chapter</h2>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#e11d48', background: '#fce7f3', padding: '5px 12px', borderRadius: 99, textTransform: 'uppercase' as const }}>4 Sectors</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 56 }}>
        {chapterData.map((ch, i) => (
          <Link key={i} href={`/chapter/${i + 1}`} style={{
            background: 'white', borderRadius: 24, overflow: 'hidden',
            border: '1px solid #e5e7eb', textDecoration: 'none',
            display: 'flex', flexDirection: 'column' as const,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          }}>
            <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, background: ch.bg, position: 'relative' }}>
              <span className="animate-float" style={{ position: 'relative', zIndex: 1, animationDelay: `${i * 0.2}s` }}>{ch.emoji}</span>
            </div>
            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' as const }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 800, marginBottom: 8 }}>
                <span style={{ color: ch.color }}>CH {i + 1}</span>
                <span style={{ color: '#94a3b8' }}>{ch.completed}/{ch.nodes} NODE</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3, marginBottom: 10, flex: 1 }}>
                {ch.name.split(":")[0]}
              </div>
              <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ width: `${(ch.completed / ch.nodes) * 100}%`, height: '100%', background: ch.color }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: ch.completed > 0 ? ch.color : '#94a3b8', textAlign: 'center' as const }}>
                {ch.completed > 0 ? 'RESUME ⚡' : 'START →'}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom: Leaderboard */}
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
            Belum ada data.
          </div>
        )}
      </div>
    </div>
  );
}
