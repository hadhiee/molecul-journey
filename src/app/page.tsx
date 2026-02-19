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
      .eq("user_email", userEmail);

    if (progress && progress.length > 0) {
      const systemValues = new Set([...Object.values(SYSTEM_IDS), "SYSTEM_LOGIN", "SYSTEM_HEARTBEAT", "SYSTEM_REFLECTION", "SYSTEM_CHECKIN", "SYSTEM_EVIDENCE", "JOURNEY_MAP"]);
      const actualMissions = progress.filter((p: any) => !systemValues.has(p.mission_id) && !systemValues.has(p.mission_id?.toUpperCase()));

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
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 24, background: '#e11d48', borderRadius: 2 }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Action Arena</h2>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#e11d48', background: '#ffe4e6', padding: '4px 10px', borderRadius: 20 }}>KETANGKASAN</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 40 }}>

        {/* Moklet Runner */}
        <Link href="/runner" style={{ textDecoration: 'none' }}>
          <div className="game-card" style={{
            background: 'linear-gradient(135deg, #2e1065, #4c1d95)',
            borderRadius: 24, padding: '20px 16px',
            color: 'white', height: '100%',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 10px 20px -5px rgba(76,29,149,0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)' }} />
            <div style={{
              width: 56, height: 56, borderRadius: 20,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, marginBottom: 12,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>🏃</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>Moklet Runner</div>
            <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>Endless Run</div>
          </div>
        </Link>

        {/* 3D Attitude Fighter */}
        <Link href="/fighter-3d" style={{ textDecoration: 'none' }}>
          <div className="game-card" style={{
            background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
            borderRadius: 24, padding: '20px 16px',
            color: 'white', height: '100%',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 10px 20px -5px rgba(153,27,27,0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)' }} />
            <div style={{
              width: 56, height: 56, borderRadius: 20,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, marginBottom: 12,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>🥊</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>Attitude Fighter</div>
            <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>Combat Arena</div>
          </div>
        </Link>

        {/* Space Shooter */}
        <Link href="/space-shooter" style={{ textDecoration: 'none' }}>
          <div className="game-card" style={{
            background: 'linear-gradient(135deg, #1e3a8a, #1e40af)',
            borderRadius: 24, padding: '20px 16px',
            color: 'white', height: '100%',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 10px 20px -5px rgba(30,64,175,0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)' }} />
            <div style={{
              width: 56, height: 56, borderRadius: 20,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, marginBottom: 12,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>🚀</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>Space Culture</div>
            <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>Galactic Shooter</div>
          </div>
        </Link>

        {/* Culture Tetris */}
        <Link href="/tetris" style={{ textDecoration: 'none' }}>
          <div className="game-card" style={{
            background: 'linear-gradient(135deg, #4338ca, #5b21b6)',
            borderRadius: 24, padding: '20px 16px',
            color: 'white', height: '100%',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 10px 20px -5px rgba(91,33,182,0.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)' }} />
            <div style={{
              width: 56, height: 56, borderRadius: 20,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, marginBottom: 12,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>🧩</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>Moklet Tetris</div>
            <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>Puzzle Logic</div>
          </div>
        </Link>
      </div>

      {/* --- CATEGORY: STRATEGY LAB --- */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 24, background: '#0ea5e9', borderRadius: 2 }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Strategy Lab</h2>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#0ea5e9', background: '#e0f2fe', padding: '4px 10px', borderRadius: 20 }}>BERPIKIR KRITIS</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 14, marginBottom: 40 }}>

        {/* Culture Simulation - Full Width */}
        <Link href="/simulation" style={{ textDecoration: 'none' }}>
          <div className="game-card" style={{
            background: 'linear-gradient(135deg, #ffffff, #eff6ff)',
            borderRadius: 24, padding: 24,
            color: '#1e3a8a',
            display: 'flex', alignItems: 'center', gap: 20,
            border: '2px solid #dbeafe',
            boxShadow: '0 10px 30px -10px rgba(59,130,246,0.15)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0,
              color: 'white',
              boxShadow: '0 8px 16px rgba(59,130,246,0.3)'
            }}>🔮</div>
            <div style={{ flex: 1, zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' as const, marginBottom: 4 }}>Decision Game</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Moklet Culture Simulation</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Asah kemampuan pengambilan keputusanmu</div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 20, background: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#3b82f6'
            }}>→</div>
          </div>
        </Link>

        {/* 2 Column sub-grid for smaller strategy games */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {/* Future Architect */}
          <Link href="/future" style={{ textDecoration: 'none' }}>
            <div className="game-card" style={{
              background: 'linear-gradient(135deg, #0f172a, #334155)',
              borderRadius: 24, padding: '20px 16px',
              color: 'white', height: '100%',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 10px 20px -5px rgba(15,23,42,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 18,
                background: '#0ea5e9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 12,
                boxShadow: '0 4px 12px rgba(14,165,233,0.3)'
              }}>🏗️</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Arsitek Masa Depan</div>
            </div>
          </Link>

          {/* Lightning Challenge */}
          <Link href="/challenge" style={{ textDecoration: 'none' }}>
            <div className="game-card" style={{
              background: 'linear-gradient(135deg, #4c0519, #831843)',
              borderRadius: 24, padding: '20px 16px',
              color: 'white', height: '100%',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 10px 20px -5px rgba(131,24,67,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 18,
                background: '#e879f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 12,
                boxShadow: '0 4px 12px rgba(232,121,249,0.3)'
              }}>⚡</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Tantangan Kilat</div>
            </div>
          </Link>
        </div>
      </div>

      {/* --- CATEGORY: EXPLORATION ZONE --- */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 24, background: '#16a34a', borderRadius: 2 }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Exploration Zone</h2>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: 20 }}>PETUALANGAN</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 14, marginBottom: 56 }}>

        {/* Journey Map - Full Width */}
        <Link href="/journey" style={{ textDecoration: 'none' }}>
          <div className="game-card" style={{
            background: 'linear-gradient(135deg, #14532d, #14532d)',
            borderRadius: 24, padding: 24,
            color: 'white',
            display: 'flex', alignItems: 'center', gap: 20,
            boxShadow: '0 10px 30px -10px rgba(22,163,74,0.3)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)' }} />
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: '#22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0,
              boxShadow: '0 8px 16px rgba(34,197,94,0.3)'
            }}>🗺️</div>
            <div style={{ flex: 1, zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#86efac', textTransform: 'uppercase' as const, marginBottom: 4 }}>Adventure Map</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Journey Map Sekolah</div>
              <div style={{ fontSize: 12, color: '#bbf7d0', marginTop: 2 }}>Jelajahi setiap sudut budaya sekolah</div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white'
            }}>→</div>
          </div>
        </Link>

        {/* 3D Explorations */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {/* Self Discovery 3D */}
          <Link href="/discovery-3d" style={{ textDecoration: 'none' }}>
            <div className="game-card" style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              borderRadius: 24, padding: '20px 16px',
              color: 'white', height: '100%',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 10px 20px -5px rgba(15,23,42,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 18,
                background: '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 12,
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
              }}>💎</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Crystal Discovery</div>
            </div>
          </Link>

          {/* Integrity Tower */}
          <Link href="/integrity-3d" style={{ textDecoration: 'none' }}>
            <div className="game-card" style={{
              background: 'linear-gradient(135deg, #312e81, #3730a3)',
              borderRadius: 24, padding: '20px 16px',
              color: 'white', height: '100%',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 10px 20px -5px rgba(49,46,129,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 18,
                background: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 12,
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
              }}>🧱</div>
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
