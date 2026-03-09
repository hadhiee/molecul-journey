import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SignOutButton from "@/components/SignOutButton";
import HomeActivityPanel from "@/components/HomeActivityPanel";
import TechNewsPanel from "@/components/TechNewsPanel";
import { EVENTS } from '@/data/events';
import EventCard from '@/components/EventCard';
import AutoRefresh from '@/components/AutoRefresh';
import { Suspense } from "react";
import FocusChatButton from "@/components/FocusChatButton";
import ThemeSelector from "@/components/ThemeSelector";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userEmail = (session.user?.email || "").toLowerCase();
  const userName = session.user?.name || "Agent";
  const userImage = session.user?.image || "";

  // Fetch real XP, mission count, and leaderboard from Supabase
  let totalXP = 0;
  let missionCount = 0;
  let leaderboard: { name: string; score: number }[] = [];

  try {
    const { SYSTEM_IDS } = await import("@/lib/ids"); // Import dynamically for Server Component

    // Fetch ALL progress data — Supabase default limit is 1000!
    // We must paginate to get everything.
    let allProgress: any[] = [];
    const PAGE_SIZE = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("user_progress")
        .select("score, mission_id, user_email")
        .range(from, from + PAGE_SIZE - 1);

      if (error || !data || data.length === 0) {
        hasMore = false;
      } else {
        allProgress = allProgress.concat(data);
        from += PAGE_SIZE;
        if (data.length < PAGE_SIZE) hasMore = false;
      }
    }

    if (allProgress.length > 0) {
      // --- Build leaderboard scoreMap (case-insensitive) ---
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

      // --- Get totalXP for current user from the SAME scoreMap ---
      totalXP = scoreMap[userEmail] || 0;

      // --- Mission count (filter by current user, case-insensitive) ---
      const systemValues = new Set([...Object.values(SYSTEM_IDS), "SYSTEM_LOGIN", "SYSTEM_HEARTBEAT", "SYSTEM_REFLECTION", "SYSTEM_CHECKIN", "SYSTEM_EVIDENCE", "JOURNEY_MAP"]);
      const userProgress = allProgress.filter((p: any) =>
        p.user_email && p.user_email.toLowerCase().trim() === userEmail
      );
      const actualMissions = userProgress.filter((p: any) => p.mission_id && !systemValues.has(p.mission_id) && !systemValues.has(p.mission_id?.toUpperCase()));
      missionCount = actualMissions.length;
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
      <AutoRefresh />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <ThemeSelector />
      </div>

      {/* 1. Banner User */}
      <div style={{
        background: 'var(--theme-bg)',
        borderRadius: 28, padding: 28, color: 'white', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 48px -12px var(--theme-shadow)',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={userImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                alt={userName}
                style={{
                  width: 64, height: 64, borderRadius: 24,
                  border: '2px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}
              />
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 4 }}>
                  Moklet Learning Culture
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em' }}>
                  Hai, {userName.split(" ")[0]}! 👋
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
              <SignOutButton />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div className={styles.glassStat}>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>{totalXP.toLocaleString()}</div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.05em' }}>Total XP</div>
            </div>
            <div className={styles.glassStat}>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>{missionCount}</div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.05em' }}>Misi Selesai</div>
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

      {/* 🔔 FITUR UNGGULAN (TERBARU) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
        {/* 3D Seragam */}
        <Link href="/seragam" className={styles.featureCard} style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          border: '1px solid rgba(225,29,72,0.3)',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.2, background: 'radial-gradient(circle at top right, rgba(225,29,72,0.6), transparent 70%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2, marginBottom: 24 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 16,
              background: 'linear-gradient(135deg, #e11d48, #be123c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 8px 20px rgba(225,29,72,0.4)',
            }}>👔</div>
            <span style={{ fontSize: 9, fontWeight: 900, background: 'rgba(225,29,72,0.2)', color: '#fda4af', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(225,29,72,0.3)' }}>NEW</span>
          </div>
          <div style={{ zIndex: 2 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'white', marginBottom: 4 }}>3D Seragam</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.4 }}>
              Review model 3D seragam
            </div>
          </div>
        </Link>

        {/* BOMBI Mascot */}
        <Link href="/bombi" className={styles.featureCard} style={{
          background: 'linear-gradient(135deg, #0c1929, #1e1b4b)',
          border: '1px solid rgba(59,130,246,0.3)',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.2, background: 'radial-gradient(circle at top right, rgba(59,130,246,0.6), transparent 70%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2, marginBottom: 24 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 16,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 8px 20px rgba(59,130,246,0.4)',
            }}>🤖</div>
            <span style={{ fontSize: 9, fontWeight: 900, background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(59,130,246,0.3)' }}>3D</span>
          </div>
          <div style={{ zIndex: 2 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'white', marginBottom: 4 }}>BOMBI 3D</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.4 }}>
              Bocah Moklet Bionik
            </div>
          </div>
        </Link>

        {/* MoDy - AI Moklet Buddy Card (Spans full width) */}
        <Link href="/ai-tutor" className={styles.featureCard} style={{
          background: 'linear-gradient(135deg, #312e81, #4c1d95, #6d28d9)',
          border: '1px solid rgba(139,92,246,0.4)',
          gridColumn: '1 / -1'
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.2, background: 'radial-gradient(circle at 80% 20%, rgba(167,139,250,0.6), transparent 60%)' }} />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  MoDy AI Tutor
                </span>
                <span style={{ fontSize: 9, fontWeight: 900, background: '#22c55e', color: 'white', padding: '2px 10px', borderRadius: 20 }}>READY</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.02em', color: 'white' }}>
                Chat dengan Gemini AI
              </div>
              <div style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 500 }}>
                Tanya pelajaran, info lomba, atau tips belajar 🎓
              </div>
            </div>
            <div style={{
              width: 64, height: 64, borderRadius: 24,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
            }}>
              <span className="animate-float">✨</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Culture Hub Card */}
      <Link href="/culture" className={styles.featureCard} style={{
        background: 'linear-gradient(135deg, #0f172a, #111827, #1f2937)',
        marginBottom: 32,
        padding: 24,
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--theme-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>
              Culture Hub
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.03em', color: 'white' }}>
              Pengenalan Moklet Culture
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
              Pusat pembelajaran karakter & nilai ATTITUDE
            </div>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: 20,
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <span className="animate-float">📘</span>
          </div>
        </div>
      </Link>

      {/* MOLESH Leadership Card */}
      <Link href="/molesh" className={styles.featureCard} style={{
        background: 'linear-gradient(135deg, #1a1145, #312e81, #4c1d95)',
        marginBottom: 32,
        padding: 24,
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(circle at 90% 10%, rgba(245,158,11,0.5), transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 900, background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: 20, letterSpacing: '0.1em' }}>LEADERSHIP</span>
              <span style={{ fontSize: 9, fontWeight: 900, background: 'rgba(255,255,255,0.15)', color: '#c4b5fd', padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>6 SESI + KUIS</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.03em', color: 'white' }}>
              MOLESH
            </div>
            <div style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 500, lineHeight: 1.5 }}>
              Moklet Leadership: <span style={{ color: '#60a5fa' }}>Sadari</span> · <span style={{ color: '#34d399' }}>Peduli</span> · <span style={{ color: '#f87171' }}>Berani</span>
            </div>
            <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 500, marginTop: 4 }}>
              Kurikulum khusus RPL, TKJ & PG 🎓
            </div>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: 20,
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <span className="animate-float">👑</span>
          </div>
        </div>
      </Link>

      {/* Career Explorer Card */}
      <Link href="/karier" className={styles.featureCard} style={{
        background: 'linear-gradient(135deg, #0c4a6e, #0369a1, #0ea5e9)',
        marginBottom: 32,
        padding: 24,
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.12, background: 'radial-gradient(circle at 85% 15%, rgba(245,158,11,0.6), transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 900, background: '#f59e0b', color: '#1e293b', padding: '3px 10px', borderRadius: 20, letterSpacing: '0.1em' }}>CAREER</span>
              <span style={{ fontSize: 9, fontWeight: 900, background: 'rgba(255,255,255,0.15)', color: '#bae6fd', padding: '3px 10px', borderRadius: 20 }}>+XP TIAP EXPLORE</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.03em', color: 'white' }}>
              Career Explorer
            </div>
            <div style={{ fontSize: 13, color: '#bae6fd', fontWeight: 500, lineHeight: 1.5 }}>
              Jelajahi potensi karier IT masa depan & fakta teknologi menarik
            </div>
            <div style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 500, marginTop: 4 }}>
              RPL · TKJ · PG · Emerging Tech 🚀
            </div>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: 20,
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <span className="animate-float">🚀</span>
          </div>
        </div>
      </Link>

      {/* 3.b Tech News Tracker */}
      <Suspense fallback={<div style={{ height: 200, background: '#f8fafc', borderRadius: 24, marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 12, fontWeight: 700 }}>Memuat Berita...</div>}>
        <TechNewsPanel />
      </Suspense>

      {/* --- SECTION DIVIDER: GAMES --- */}
      <div style={{ marginTop: 40, marginBottom: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Training Grounds</h2>
        <div style={{ width: 40, height: 4, background: 'var(--theme-primary)', borderRadius: 99, margin: '8px auto 0' }} />
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 8, fontWeight: 500 }}>Asah karaktermu melalui berbagai mini-games seru</p>
      </div>

      {/* --- CATEGORY: ACTION ARENA --- */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 24, background: 'var(--theme-primary)', borderRadius: 2 }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Action Arena</h2>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--theme-primary)', background: 'var(--theme-light)', padding: '4px 10px', borderRadius: 20 }}>KETANGKASAN</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 12, marginBottom: 48 }}>
        {/* Moklet Runner */}
        <Link href="/runner" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#4c1d95' }}>🏃</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Moklet Runner</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Endless escape training</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* 3D Attitude Fighter */}
        <Link href="/fighter-3d" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#991b1b' }}>🥊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Attitude Fighter</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Combat arena for discipline</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* Space Shooter */}
        <Link href="/space-shooter" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#1e40af' }}>🚀</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Space Culture</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Protect the galaxy values</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* Culture Tetris */}
        <Link href="/tetris" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#4338ca' }}>🧩</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Moklet Tetris</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Puzzle logic mission</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* Moklet Snake */}
        <Link href="/snake" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#16a34a' }}>🐍</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Moklet Snake</div>
              <span style={{ fontSize: 8, fontWeight: 800, background: '#e11d48', color: 'white', padding: '1px 6px', borderRadius: 4 }}>NEW</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Collect ATTITUDE values</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* Culture Connect */}
        <Link href="/culture-connect" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#059669' }}>🔗</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Culture Connect</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Matching logic challenge</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* Focus Guard */}
        <Link href="/focus-guard" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#d97706' }}>🛡️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Focus Guard</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Action smasher challenge</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>
      </div>

      {/* --- CATEGORY: STRATEGY LAB --- */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 24, background: '#0ea5e9', borderRadius: 2 }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Strategy Lab</h2>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#0ea5e9', background: '#e0f2fe', padding: '4px 10px', borderRadius: 20 }}>BERPIKIR KRITIS</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 12, marginBottom: 48 }}>
        <Link href="/simulation" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#3b82f6' }}>🔮</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Moklet Culture Simulation</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Interactive decision laboratory</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        <Link href="/future" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#0ea5e9' }}>🏗️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Arsitek Masa Depan</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Mastering school life strategy</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        <Link href="/challenge" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#be123c' }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Tantangan Kilat</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Quick thinking & values quiz</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>
      </div>

      {/* --- CATEGORY: PUSPRESNAS ARENA --- */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 24, background: '#8b5cf6', borderRadius: 2 }} />
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>Puspresnas Arena</h2>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500 }}>Ajang Talenta Nasional</div>
          </div>
        </div>
        <Link href="/events" style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6' }}>Lihat Semua →</Link>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="hide-scrollbar" style={{
        display: 'flex', gap: 16, overflowX: 'auto',
        paddingBottom: 20, margin: '0 -24px', paddingLeft: 24, paddingRight: 24,
        scrollSnapType: 'x mandatory'
      }}>
        {EVENTS.map(event => (
          <div key={event.id} style={{ minWidth: 260, width: '75%', scrollSnapAlign: 'center' }}>
            <EventCard event={event} />
          </div>
        ))}
      </div>

      {/* --- CATEGORY: EXPLORATION ZONE --- */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 24, background: '#16a34a', borderRadius: 2 }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Exploration Zone</h2>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: 20 }}>PETUALANGAN</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 12, marginBottom: 56 }}>
        <Link href="/sekolah-3d" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#2563eb' }}>🏛️</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Gedung Sekolah 3D</div>
              <span style={{ fontSize: 8, fontWeight: 800, background: '#e11d48', color: 'white', padding: '1px 6px', borderRadius: 4 }}>NEW</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Tour kampus virtual interaktif</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* Manajemen Sekolah */}
        <Link href="/manajemen" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#d97706' }}>🤝</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Manajemen Sekolah</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Kenali struktur organisasi sekolah</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* Profil YPT */}
        <Link href="/profil-ypt" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#ef4444' }}>🏢</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Profil YPT</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Mengenal Yayasan Pendidikan Telkom</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* Ekstrakurikuler */}
        <Link href="/ekskul" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#10b981' }}>⚽</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Ekstrakurikuler</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Wadah minat bakat siswa</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* Journey Map */}
        <Link href="/journey" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#22c55e' }}>🗺️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Journey Map Sekolah</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Peta petualangan budaya sekolah</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>

        {/* Discovery 3D */}
        <Link href="/discovery-3d" className={styles.gameCardNew}>
          <div className={styles.iconWrapper} style={{ color: '#ffffff', background: '#8b5cf6' }}>💎</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>Discovery 3D</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Crystal self discovery lab</div>
          </div>
          <div className={styles.arrowBtn}>→</div>
        </Link>
      </div>

      {/* 5. Pilih Chapter (Skill Tree) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Skill Tree: Pilih Chapter</h2>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--theme-primary)', background: 'var(--theme-light)', padding: '5px 12px', borderRadius: 99, textTransform: 'uppercase' }}>4 Sectors</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 56 }}>
        {chapterData.map((ch, i) => (
          <Link key={i} href={`/chapter/${i + 1}`} style={{
            background: 'white', borderRadius: 24, overflow: 'hidden',
            border: '1px solid #e5e7eb', textDecoration: 'none',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          }}>
            <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, background: ch.bg, position: 'relative' }}>
              <span className="animate-float" style={{ position: 'relative', zIndex: 1, animationDelay: `${i * 0.2}s` }}>{ch.emoji}</span>
            </div>
            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
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
              <div style={{ fontSize: 10, fontWeight: 800, color: ch.completed > 0 ? ch.color : '#94a3b8', textAlign: 'center' }}>
                {ch.completed > 0 ? 'RESUME ⚡' : 'START →'}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom: Leaderboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Leaderboard</h2>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--theme-primary)', background: 'var(--theme-light)', padding: '5px 12px', borderRadius: 99, textTransform: 'uppercase' }}>Top {leaderboard.length || '-'}</span>
      </div>
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 40 }}>
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
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>{player.score.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>XP</div>
            </div>
          </div>
        )) : (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
            Belum ada data.
          </div>
        )}
      </div>

      {/* About App Banner */}
      <Link href="/about" style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'linear-gradient(135deg, #e11d48, #be123c)',
          borderRadius: 24, padding: 24, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 10px 25px -5px rgba(225,29,72,0.3)',
          position: 'relative', overflow: 'hidden',
          marginBottom: 40
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Tentang MoLeCul</div>
            <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 500, maxWidth: 200 }}>
              Pelajari filosofi, fitur, dan tim di balik aplikasi ini
            </div>
          </div>
          <div style={{ fontSize: 48, zIndex: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>ℹ️</div>
        </div>
      </Link>

      {/* Admin Panel Link */}
      {userEmail === "hadhiee@gmail.com" && (
        <div style={{ marginBottom: 120, borderTop: '1px solid #f1f5f9', paddingTop: 24, textAlign: 'center' }}>
          <Link href="/admin/logs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a2e', color: 'white', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontSize: 13, fontWeight: 800 }}>
            <span>🔒</span> Control Center (Admin Status)
          </Link>
        </div>
      )}

      {/* ===== FIXED BOTTOM NAVIGATION BAR ===== */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        padding: '6px 8px env(safe-area-inset-bottom, 8px)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      }}>
        {/* Home */}
        <Link href="/" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          textDecoration: 'none', padding: '4px 10px', borderRadius: 12,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--theme-primary)" stroke="var(--theme-primary)" strokeWidth="0">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" fill="none" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--theme-primary)', letterSpacing: '0.02em' }}>Home</span>
        </Link>

        {/* Journey */}
        <Link href="/journey" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          textDecoration: 'none', padding: '4px 10px', borderRadius: 12,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
          </svg>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.02em' }}>Journey</span>
        </Link>

        {/* Center: MoDy + Fokus Ngobrol */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: -18, position: 'relative' }}>
          {/* Fokus Ngobrol */}
          <FocusChatButton />
          {/* MoDy */}
          <Link href="/ai-tutor" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textDecoration: 'none',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 18,
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px -4px rgba(99,102,241,0.5)',
              border: '3px solid white',
              position: 'relative',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" /><path d="M20 14h2" />
                <path d="M15 13v2" /><path d="M9 13v2" />
              </svg>
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: 8,
                background: '#22c55e', border: '2px solid white',
                fontSize: 7, fontWeight: 900, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>AI</span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#6366f1', marginTop: 2, letterSpacing: '0.02em' }}>MoDy</span>
          </Link>
        </div>

        {/* Culture */}
        <Link href="/culture" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          textDecoration: 'none', padding: '4px 10px', borderRadius: 12,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.02em' }}>Culture</span>
        </Link>

        {/* Events */}
        <Link href="/events" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          textDecoration: 'none', padding: '4px 10px', borderRadius: 12,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" />
            <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.02em' }}>Lomba</span>
        </Link>
      </nav>
    </div>
  );
}
