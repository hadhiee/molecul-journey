import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SignOutButton from "@/components/SignOutButton";
import HomeActivityPanel from "@/components/HomeActivityPanel";
import TechNewsPanel from "@/components/TechNewsPanel";
import { Suspense } from "react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userEmail = (session.user?.email || "").toLowerCase();
  const userName = session.user?.name || "Agent";
  const userImage = session.user?.image || "";

  // Fetch real XP & mission count from Supabase
  let totalXP = 0;
  let missionCount = 0;

  try {
    const { SYSTEM_IDS } = await import("@/lib/ids"); // Import dynamically for Server Component
    const { data: progress } = await supabase
      .from("user_progress")
      .select("score, mission_id, user_email")
      // We need to handle potential case mismatch if DB has mixed case.
      // Since we can't easily do ilike on all DBs, we'll try to be safe.
      // But standardizing on userEmail (lowercase) is best if data was inserted that way.
      .eq("user_email", userEmail);

    if (progress && progress.length > 0) {
      const systemValues = new Set([...Object.values(SYSTEM_IDS), "SYSTEM_LOGIN", "SYSTEM_HEARTBEAT", "SYSTEM_REFLECTION", "SYSTEM_CHECKIN", "SYSTEM_EVIDENCE", "JOURNEY_MAP"]);
      const actualMissions = progress.filter((p: any) => !systemValues.has(p.mission_id) && !systemValues.has(p.mission_id?.toUpperCase())); // safety check

      // Calculate XP only from non-system missions OR if business logic allows system XP, ensure it's not double counting
      // Assuming system events (like login) should NOT contribute to "Total XP" if they are spammy.
      // If we want ALL XP:
      totalXP = progress.reduce((sum: number, p: any) => sum + (p.score || 0), 0);
      missionCount = actualMissions.length;
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
        if (p.user_email) {
          const email = p.user_email.toLowerCase().trim();
          scoreMap[email] = (scoreMap[email] || 0) + (p.score || 0);
        }
      });
      leaderboard = Object.entries(scoreMap)
        .map(([email, score]) => ({ name: email.split("@")[0], score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }
  } catch (e) { }

  // Fetch chapter progress
  const chapterData = [
    { name: "Kelas Tangguh: Fondasi ATTITUDE", emoji: "🛡️", bg: "#fff1f2", color: "#e11d48", nodes: 0, completed: 0 },
    { name: "Lab Inovasi: Use Tech Wisely", emoji: "💻", bg: "#eff6ff", color: "#3b82f6", nodes: 0, completed: 0 },
    { name: "Simulasi Industri: BISA di Dunia Kerja", emoji: "🏭", bg: "#f0fdf4", color: "#22c55e", nodes: 0, completed: 0 },
    { name: "Dampak Sosial: AKHLAK untuk Masyarakat", emoji: "🌍", bg: "#fefce8", color: "#f59e0b", nodes: 0, completed: 0 }
  ];

  try {
    // Fetch generic scenario counts per chapter
    // Since this is a simple app, we can just fetch all scenarios light-weight
    // Or we can rely on hardcoded nodes count, but fetching is better for sync.
    const { data: allScenarios } = await supabase.from("scenarios").select("id, chapter");

    if (allScenarios) {
      allScenarios.forEach(s => {
        const chIdx = (s.chapter || 1) - 1;
        if (chapterData[chIdx]) {
          chapterData[chIdx].nodes++;
        }
      });
    }

    if (userEmail && allScenarios) {
      const { data: userProg } = await supabase
        .from("user_progress")
        .select("mission_id")
        .eq("user_email", userEmail)
        .in("mission_id", allScenarios.map(s => s.id));

      if (userProg) {
        const completedSet = new Set(userProg.map(p => p.mission_id));
        allScenarios.forEach(s => {
          if (completedSet.has(s.id)) {
            const chIdx = (s.chapter || 1) - 1;
            if (chapterData[chIdx]) {
              chapterData[chIdx].completed++;
            }
          }
        });
      }
    }
  } catch (e) { console.error("Chapter sync error", e); }

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
      <HomeActivityPanel userEmail={userEmail} />

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

      {/* 3.b Tech News Tracker */}
      <Suspense fallback={<div style={{ height: 200, background: '#f8fafc', borderRadius: 24, marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 12, fontWeight: 700 }}>Memuat Berita...</div>}>
        <TechNewsPanel />
      </Suspense>

      {/* --- CATEGORY: ACTION ARENA --- */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Action Arena</h2>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#e11d48', background: '#ffe4e6', padding: '4px 8px', borderRadius: 6 }}>KETANGKASAN</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>

        {/* Moklet Runner */}
        <Link href="/runner" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #1a0a2e, #4c1d95)', borderRadius: 20, padding: 16, color: 'white', height: '100%', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>🏃</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Moklet Runner</div>
            <div style={{ fontSize: 9, opacity: 0.7 }}>Endless Run</div>
          </div>
        </Link>

        {/* 3D Attitude Fighter */}
        <Link href="/fighter-3d" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #450a0a, #7f1d1d)', borderRadius: 20, padding: 16, color: 'white', height: '100%', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>🥊</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Attitude Fighter</div>
            <div style={{ fontSize: 9, opacity: 0.7 }}>Combat Arena</div>
          </div>
        </Link>

        {/* Space Shooter */}
        <Link href="/space-shooter" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #172554, #1e3a8a)', borderRadius: 20, padding: 16, color: 'white', height: '100%', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>🚀</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Space Culture</div>
            <div style={{ fontSize: 9, opacity: 0.7 }}>Galactic Shooter</div>
          </div>
        </Link>

        {/* Culture Tetris */}
        <Link href="/tetris" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #312e81, #4338ca)', borderRadius: 20, padding: 16, color: 'white', height: '100%', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>🧩</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Moklet Tetris</div>
            <div style={{ fontSize: 9, opacity: 0.7 }}>Puzzle Logic</div>
          </div>
        </Link>
      </div>


      {/* --- CATEGORY: STRATEGY LAB --- */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Strategy Lab</h2>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#0ea5e9', background: '#e0f2fe', padding: '4px 8px', borderRadius: 6 }}>BERPIKIR KRITIS</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 12, marginBottom: 32 }}>

        {/* Culture Simulation - Full Width */}
        <Link href="/simulation" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: 20, padding: 16, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(37,99,235,0.2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🔮</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' as const, marginBottom: 2 }}>Decision Game</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Moklet Culture Simulation</div>
            </div>
            <div style={{ fontSize: 20, opacity: 0.5 }}>→</div>
          </div>
        </Link>

        {/* 2 Column sub-grid for smaller strategy games */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {/* Future Architect */}
          <Link href="/future" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #334155)', borderRadius: 20, padding: 16, color: 'white', height: '100%', border: '1px solid rgba(148,163,184,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>🏗️</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Arsitek Masa Depan</div>
            </div>
          </Link>

          {/* Lightning Challenge */}
          <Link href="/challenge" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #2e1065, #581c87)', borderRadius: 20, padding: 16, color: 'white', height: '100%', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>⚡</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Tantangan Kilat</div>
            </div>
          </Link>
        </div>
      </div>


      {/* --- CATEGORY: EXPLORATION ZONE --- */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Exploration Zone</h2>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 8px', borderRadius: 6 }}>PETUALANGAN</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 12, marginBottom: 48 }}>

        {/* Journey Map - Full Width */}
        <Link href="/journey" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', borderRadius: 20, padding: 16, color: 'white', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(34,197,94,0.3)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🗺️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#86efac', textTransform: 'uppercase' as const, marginBottom: 2 }}>Adventure Map</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Journey Map Sekolah</div>
            </div>
            <div style={{ fontSize: 20, opacity: 0.5 }}>→</div>
          </div>
        </Link>

        {/* 3D Explorations */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {/* Self Discovery 3D */}
          <Link href="/discovery-3d" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 20, padding: 16, color: 'white', height: '100%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>💎</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Crystal Discovery</div>
            </div>
          </Link>

          {/* Integrity Tower */}
          <Link href="/integrity-3d" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 20, padding: 16, color: 'white', height: '100%', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>🧱</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Integrity Tower</div>
            </div>
          </Link>
        </div>
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

      {/* Admin Panel Link */}
      {userEmail === "hadhiee@gmail.com" && (
        <div style={{ marginTop: 40, borderTop: '1px solid #f1f5f9', paddingTop: 24, textAlign: 'center' }}>
          <Link href="/admin/logs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a2e', color: 'white', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontSize: 13, fontWeight: 800 }}>
            <span>🔒</span> Control Center (Admin Status)
          </Link>
        </div>
      )}
    </div>
  );
}
