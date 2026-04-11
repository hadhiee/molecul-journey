import type { CSSProperties } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import AutoRefresh from "@/components/AutoRefresh";
import EventCard from "@/components/EventCard";
import FocusChatButton from "@/components/FocusChatButton";
import HomeActivityPanel from "@/components/HomeActivityPanel";
import SignOutButton from "@/components/SignOutButton";
import TechNewsPanel from "@/components/TechNewsPanel";
import ThemeSelector from "@/components/ThemeSelector";
import { EVENTS } from "@/data/events";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SpotlightCard = {
  title: string;
  description: string;
  href: string;
  badge: string;
  icon: string;
  background: string;
  borderColor: string;
  glow: string;
  size?: "wide";
};

type ModuleCard = {
  title: string;
  description: string;
  href: string;
  icon: string;
  iconBackground: string;
  badge?: string;
};

type ModuleSection = {
  title: string;
  label: string;
  description: string;
  accent: string;
  softAccent: string;
  items: ModuleCard[];
};

const spotlightCards: SpotlightCard[] = [
  {
    title: "MoDy AI Tutor",
    description: "Asisten belajar cepat untuk tanya materi, kultur, dan strategi belajar harian.",
    href: "/ai-tutor",
    badge: "AI Assistant",
    icon: "✨",
    background: "linear-gradient(135deg, #312e81 0%, #5b21b6 55%, #7c3aed 100%)",
    borderColor: "rgba(196, 181, 253, 0.34)",
    glow: "rgba(91, 33, 182, 0.34)",
    size: "wide",
  },
  {
    title: "Culture Hub",
    description: "Ruang utama untuk kenal nilai ATTITUDE, budaya belajar, dan ritme Moklet.",
    href: "/culture",
    badge: "Core",
    icon: "📘",
    background: "linear-gradient(135deg, #0f172a 0%, #111827 55%, #1f2937 100%)",
    borderColor: "rgba(148, 163, 184, 0.28)",
    glow: "rgba(15, 23, 42, 0.28)",
  },
  {
    title: "MOLESH Leadership",
    description: "Masuk ke kurikulum Sadari, Peduli, dan Berani dengan alur belajar yang terstruktur.",
    href: "/molesh",
    badge: "Leadership",
    icon: "👑",
    background: "linear-gradient(135deg, #1f1147 0%, #312e81 55%, #4c1d95 100%)",
    borderColor: "rgba(167, 139, 250, 0.32)",
    glow: "rgba(76, 29, 149, 0.34)",
  },
  {
    title: "Career Explorer",
    description: "Jelajahi peta karier IT dan lihat peluang belajar yang nyambung dengan jurusanmu.",
    href: "/karier",
    badge: "Future Skills",
    icon: "🚀",
    background: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 55%, #0ea5e9 100%)",
    borderColor: "rgba(125, 211, 252, 0.3)",
    glow: "rgba(14, 165, 233, 0.3)",
  },
  {
    title: "3D Seragam",
    description: "Cek referensi visual seragam sekolah dalam mode 3D yang gampang dipahami.",
    href: "/seragam",
    badge: "3D Preview",
    icon: "👔",
    background: "linear-gradient(135deg, #10172a 0%, #1e1b4b 55%, #4c1d95 100%)",
    borderColor: "rgba(244, 114, 182, 0.3)",
    glow: "rgba(30, 27, 75, 0.32)",
  },
];

const quickActions = [
  { label: "Mulai Journey", href: "/journey" },
  { label: "Buka AI Tutor", href: "/ai-tutor" },
  { label: "Lihat Event", href: "/events" },
];

const moduleSections: ModuleSection[] = [
  {
    title: "Training Grounds",
    label: "Action Arena",
    description: "Mini game cepat untuk fokus, disiplin, dan respons saat menghadapi distraksi.",
    accent: "#e11d48",
    softAccent: "#fff1f2",
    items: [
      { title: "Moklet Runner", description: "Endless escape training", href: "/runner", icon: "🏃", iconBackground: "#4c1d95" },
      { title: "Attitude Fighter", description: "Combat arena for discipline", href: "/fighter-3d", icon: "🥊", iconBackground: "#991b1b" },
      { title: "Space Culture", description: "Protect the galaxy values", href: "/space-shooter", icon: "🚀", iconBackground: "#1e40af" },
      { title: "Moklet Tetris", description: "Puzzle logic mission", href: "/tetris", icon: "🧩", iconBackground: "#4338ca" },
      { title: "Moklet Snake", description: "Collect ATTITUDE values", href: "/snake", icon: "🐍", iconBackground: "#16a34a", badge: "New" },
      { title: "Culture Connect", description: "Matching logic challenge", href: "/culture-connect", icon: "🔗", iconBackground: "#059669" },
      { title: "Focus Guard", description: "Action smasher challenge", href: "/focus-guard", icon: "🛡️", iconBackground: "#d97706" },
    ],
  },
  {
    title: "Simulation Lab",
    label: "Strategy Lab",
    description: "Latihan berpikir kritis dan pengambilan keputusan lewat skenario yang lebih realistis.",
    accent: "#0ea5e9",
    softAccent: "#e0f2fe",
    items: [
      { title: "Culture Simulation", description: "Interactive decision laboratory", href: "/simulation", icon: "🔮", iconBackground: "#3b82f6" },
      { title: "Arsitek Masa Depan", description: "Mastering school life strategy", href: "/future", icon: "🏗️", iconBackground: "#0ea5e9" },
      { title: "Tantangan Kilat", description: "Quick thinking and values quiz", href: "/challenge", icon: "⚡", iconBackground: "#be123c" },
    ],
  },
  {
    title: "Exploration Zone",
    label: "Campus & Identity",
    description: "Kenali ruang, identitas, dan ekosistem Moklet lewat pengalaman yang lebih interaktif.",
    accent: "#16a34a",
    softAccent: "#dcfce7",
    items: [
      { title: "Gedung Sekolah 3D", description: "Tour kampus virtual interaktif", href: "/sekolah-3d", icon: "🏛️", iconBackground: "#2563eb", badge: "New" },
      { title: "Manajemen Sekolah", description: "Kenali struktur organisasi sekolah", href: "/manajemen", icon: "🤝", iconBackground: "#d97706" },
      { title: "Profil YPT", description: "Mengenal Yayasan Pendidikan Telkom", href: "/profil-ypt", icon: "🏢", iconBackground: "#ef4444" },
      { title: "Ekstrakurikuler", description: "Wadah minat bakat siswa", href: "/ekskul", icon: "⚽", iconBackground: "#10b981" },
      { title: "Journey Map Sekolah", description: "Peta petualangan budaya sekolah", href: "/journey", icon: "🗺️", iconBackground: "#22c55e" },
      { title: "Discovery 3D", description: "Crystal self discovery lab", href: "/discovery-3d", icon: "💎", iconBackground: "#8b5cf6" },
    ],
  },
];

const navItems = [
  {
    href: "/",
    label: "Home",
    active: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 4l9 8" />
        <path d="M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10" />
      </svg>
    ),
  },
  {
    href: "/journey",
    label: "Journey",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    href: "/culture",
    label: "Culture",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    href: "/events",
    label: "Lomba",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
];

const rankColors = [
  { bg: "#fef3c7", text: "#d97706" },
  { bg: "#f1f5f9", text: "#64748b" },
  { bg: "#fed7aa", text: "#c2410c" },
  { bg: "#f1f5f9", text: "#64748b" },
  { bg: "#f1f5f9", text: "#64748b" },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userEmail = (session.user?.email || "").toLowerCase();
  const userName = session.user?.name || "Agent";
  const userImage = session.user?.image || "";
  const firstName = userName.split(" ")[0] || "Agent";

  let totalXP = 0;
  let missionCount = 0;
  let userRank = 0;
  let leaderboard: { name: string; score: number }[] = [];

  try {
    const CORE_MISSIONS = [
      "RUNNER", "FIGHTER", "SPACE_SHOOTER", "TETRIS", "SNAKE_GAME", "FOCUS_GAME",
      "CONNECT_GAME", "SIMULATION", "FUTURE", "CHALLENGE",
      "DISCOVERY_3D", "INTEGRITY_3D_STACK", "SYSTEM_EXPLORE_SEKOLAH_3D", "SYSTEM_EXPLORE_BOMBI_3D",
      "SYSTEM_EXPLORE_MANAJEMEN", "SYSTEM_EXPLORE_PERSONIL", "SYSTEM_MINIGAME_STRUKTUR",
      "SYSTEM_EXPLORE_EKSKUL", "NONTON YPT",
      "MOLESH_SESI_1", "MOLESH_SESI_2", "MOLESH_SESI_3", "MOLESH_SESI_4", "MOLESH_SESI_5", "MOLESH_SESI_6",
      "CAREER_EXPLORE_FRONTEND", "CAREER_EXPLORE_BACKEND", "CAREER_EXPLORE_DEVOPS",
      "CAREER_EXPLORE_MOBDEV", "CAREER_EXPLORE_CYBERSEC", "CAREER_EXPLORE_NETENG",
      "CAREER_EXPLORE_GAMEDEV", "CAREER_EXPLORE_GAMEART",
      "SERAGAM_3D_SENIN-UPACARA", "SERAGAM_3D_SENIN", "SERAGAM_3D_SELASA",
      "SERAGAM_3D_RABU", "SERAGAM_3D_KAMIS", "SERAGAM_3D_KAMIS-PUTRA", "SERAGAM_3D_JUMAT",
    ];

    let allProgress: any[] = [];
    const pageSize = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("user_progress")
        .select("score, mission_id, choice_label, user_email")
        .range(from, from + pageSize - 1);

      if (error || !data || data.length === 0) {
        hasMore = false;
      } else {
        allProgress = allProgress.concat(data);
        from += pageSize;
        if (data.length < pageSize) {
          hasMore = false;
        }
      }
    }

    if (allProgress.length > 0) {
      const scoreMap: Record<string, number> = {};
      allProgress.forEach((progress: any) => {
        if (progress.user_email) {
          const normalizedEmail = progress.user_email.toLowerCase().trim();
          scoreMap[normalizedEmail] = (scoreMap[normalizedEmail] || 0) + (progress.score || 0);
        }
      });

      const rankedUsers = Object.entries(scoreMap)
        .map(([email, score]) => ({ email, name: email.split("@")[0], score }))
        .sort((a, b) => b.score - a.score);

      leaderboard = rankedUsers.slice(0, 5).map(({ name, score }) => ({ name, score }));
      totalXP = scoreMap[userEmail] || 0;
      userRank = rankedUsers.findIndex((player) => player.email === userEmail) + 1;

      const userProgress = allProgress.filter(
        (progress: any) => progress.user_email && progress.user_email.toLowerCase().trim() === userEmail,
      );

      const userCompletedIds = new Set(
        userProgress.map((progress) => ((progress.mission_id || progress.choice_label || "") as string).toUpperCase()),
      );

      const completedCount = CORE_MISSIONS.filter((missionId) => {
        const target = missionId.toUpperCase();
        return Array.from(userCompletedIds).some((userMissionId) => userMissionId.includes(target));
      }).length;

      missionCount = Math.max(0, CORE_MISSIONS.length - completedCount);
    } else {
      missionCount = CORE_MISSIONS.length;
    }
  } catch (error) {
    console.error("Home progress sync error", error);
  }

  const chapterData = [
    { name: "Kelas Tangguh: Fondasi ATTITUDE", emoji: "🛡️", bg: "#fff1f2", color: "#e11d48", nodes: 0, completed: 0 },
    { name: "Lab Inovasi: Use Tech Wisely", emoji: "💻", bg: "#eff6ff", color: "#3b82f6", nodes: 0, completed: 0 },
    { name: "Simulasi Industri: BISA di Dunia Kerja", emoji: "🏭", bg: "#f0fdf4", color: "#22c55e", nodes: 0, completed: 0 },
    { name: "Dampak Sosial: AKHLAK untuk Masyarakat", emoji: "🌍", bg: "#fefce8", color: "#f59e0b", nodes: 0, completed: 0 },
  ];

  try {
    const { data: allScenarios } = await supabase.from("scenarios").select("id, chapter");

    if (allScenarios) {
      allScenarios.forEach((scenario) => {
        const chapterIndex = (scenario.chapter || 1) - 1;
        if (chapterData[chapterIndex]) {
          chapterData[chapterIndex].nodes++;
        }
      });
    }

    if (userEmail && allScenarios) {
      const { data: userProgress } = await supabase
        .from("user_progress")
        .select("mission_id")
        .eq("user_email", userEmail)
        .in("mission_id", allScenarios.map((scenario) => scenario.id));

      if (userProgress) {
        const completedSet = new Set(userProgress.map((progress) => progress.mission_id));
        allScenarios.forEach((scenario) => {
          if (completedSet.has(scenario.id)) {
            const chapterIndex = (scenario.chapter || 1) - 1;
            if (chapterData[chapterIndex]) {
              chapterData[chapterIndex].completed++;
            }
          }
        });
      }
    }
  } catch (error) {
    console.error("Chapter sync error", error);
  }

  const totalNodes = chapterData.reduce((sum, chapter) => sum + chapter.nodes, 0);
  const completedNodes = chapterData.reduce((sum, chapter) => sum + chapter.completed, 0);
  const completionPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  const activeChapters = chapterData.filter((chapter) => chapter.completed > 0).length;

  return (
    <div className={styles.page}>
      <AutoRefresh />

      <div className={styles.backgroundOrbOne} />
      <div className={styles.backgroundOrbTwo} />
      <div className={styles.backgroundOrbThree} />

      <header className={styles.topbar}>
        <div className={styles.brandBlock}>
          <div className={styles.brandLogo}>
            <img src="/smk-logo.png" alt="SMK Telkom Malang" />
          </div>
          <div>
            <p className={styles.brandEyebrow}>Moklet Learning Culture Journey</p>
            <h1 className={styles.brandTitle}>MoLeCul Home</h1>
          </div>
        </div>

        <div className={styles.topbarTools}>
          <div className={styles.brandStrip}>
            <img src="/brand-logos.png" alt="Brand Logos" />
          </div>
          <ThemeSelector />
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <span className={styles.heroEyebrow}>Dashboard yang lebih fokus</span>
            <h2 className={styles.heroTitle}>Hai, {firstName}. Semua hal penting ada di satu home yang lebih rapi.</h2>
            <p className={styles.heroDescription}>
              Lanjutkan progress budaya belajar, masuk ke modul utama, dan cek update harian tanpa perlu lompat-lompat menu.
            </p>
          </div>

          <div className={styles.heroActions}>
            {quickActions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={index === 0 ? styles.primaryAction : styles.secondaryAction}
              >
                {action.label}
              </Link>
            ))}
          </div>

          <div className={styles.heroMetaRow}>
            <span className={styles.heroMetaChip}>Progress chapter {completedNodes}/{totalNodes || 0} node</span>
            <span className={styles.heroMetaChip}>Aktif di {activeChapters || 0} dari 4 chapter</span>
            <span className={styles.heroMetaChip}>Theme siap diganti langsung</span>
          </div>
        </div>

        <div className={styles.heroAside}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.profileIdentity}>
                <img
                  src={userImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                  alt={userName}
                  className={styles.profileAvatar}
                />
                <div>
                  <p className={styles.profileLabel}>Akun aktif</p>
                  <h3 className={styles.profileName}>{userName}</h3>
                  <p className={styles.profileEmail}>{userEmail}</p>
                </div>
              </div>
              <SignOutButton />
            </div>

            <div className={styles.metricGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricValue}>{totalXP.toLocaleString()}</span>
                <span className={styles.metricLabel}>Total XP</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricValue}>{missionCount}</span>
                <span className={styles.metricLabel}>Misi Tersisa</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricValue}>{userRank > 0 ? `#${userRank}` : "-"}</span>
                <span className={styles.metricLabel}>Peringkatmu</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricValue}>{completionPercent}%</span>
                <span className={styles.metricLabel}>Progress Chapter</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Daily Hub</p>
            <h2 className={styles.sectionTitle}>Aktivitas hari ini</h2>
            <p className={styles.sectionDescription}>Check-in, bukti aktivitas, dan refleksi ada di satu blok yang gampang diakses.</p>
          </div>
        </div>
        <HomeActivityPanel userEmail={userEmail} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Highlights</p>
            <h2 className={styles.sectionTitle}>Akses cepat ke fitur utama</h2>
            <p className={styles.sectionDescription}>Disusun seperti landing modern: jelas, kontras, dan langsung menunjukkan area yang paling sering dipakai.</p>
          </div>
        </div>

        <div className={styles.spotlightGrid}>
          {spotlightCards.map((card) => {
            const featureStyle: CSSProperties = {
              background: card.background,
              borderColor: card.borderColor,
              boxShadow: `0 28px 80px -36px ${card.glow}`,
            };

            return (
              <Link
                key={card.href}
                href={card.href}
                className={`${styles.spotlightCard} ${card.size === "wide" ? styles.spotlightCardWide : ""}`}
                style={featureStyle}
              >
                <div className={styles.spotlightHeader}>
                  <div className={styles.spotlightIcon}>{card.icon}</div>
                  <span className={styles.spotlightBadge}>{card.badge}</span>
                </div>
                <div>
                  <h3 className={styles.spotlightTitle}>{card.title}</h3>
                  <p className={styles.spotlightDescription}>{card.description}</p>
                </div>
                <span className={styles.spotlightLink}>Buka modul</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Live Feed</p>
            <h2 className={styles.sectionTitle}>Tech Radar</h2>
            <p className={styles.sectionDescription}>Update topik RPL, TKJ, dan PG tetap tampil sebagai bagian dari ritme belajar harian.</p>
          </div>
        </div>

        <Suspense fallback={<div className={styles.loadingPanel}>Memuat berita terbaru...</div>}>
          <TechNewsPanel />
        </Suspense>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Learning Tracks</p>
            <h2 className={styles.sectionTitle}>Modul dan area eksplorasi</h2>
            <p className={styles.sectionDescription}>Dikelompokkan per tujuan supaya home terasa seperti gateway produk yang lebih jelas.</p>
          </div>
        </div>

        <div className={styles.moduleGrid}>
          {moduleSections.map((section) => (
            <div key={section.label} className={styles.moduleSectionCard}>
              <div className={styles.moduleSectionHeader}>
                <div>
                  <span
                    className={styles.moduleSectionLabel}
                    style={{ color: section.accent, background: section.softAccent }}
                  >
                    {section.label}
                  </span>
                  <h3 className={styles.moduleSectionTitle}>{section.title}</h3>
                  <p className={styles.moduleSectionDescription}>{section.description}</p>
                </div>
              </div>

              <div className={styles.moduleItemList}>
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href} className={styles.moduleItem}>
                    <div className={styles.moduleIcon} style={{ background: item.iconBackground }}>
                      {item.icon}
                    </div>
                    <div className={styles.moduleItemCopy}>
                      <div className={styles.moduleItemTitleRow}>
                        <h4 className={styles.moduleItemTitle}>{item.title}</h4>
                        {item.badge ? <span className={styles.moduleItemBadge}>{item.badge}</span> : null}
                      </div>
                      <p className={styles.moduleItemDescription}>{item.description}</p>
                    </div>
                    <span className={styles.moduleArrow}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Competition Hub</p>
            <h2 className={styles.sectionTitle}>Puspresnas Arena</h2>
            <p className={styles.sectionDescription}>Event card tetap ditonjolkan, tapi sekarang masuk dalam section yang lebih konsisten dengan keseluruhan home.</p>
          </div>
          <Link href="/events" className={styles.inlineLink}>Lihat semua</Link>
        </div>

        <div className={`${styles.eventsStrip} hide-scrollbar`}>
          {EVENTS.map((event) => (
            <div key={event.id} className={styles.eventCardWrap}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.statsSection}`}>
        <div className={styles.statsGrid}>
          <div className={styles.sectionPanel}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Progress Map</p>
                <h2 className={styles.sectionTitle}>Skill tree chapter</h2>
                <p className={styles.sectionDescription}>Tampilan chapter dibuat lebih clean dan mudah dibaca sebagai progress cards.</p>
              </div>
            </div>

            <div className={styles.chapterGrid}>
              {chapterData.map((chapter, index) => {
                const [title, subtitle] = chapter.name.split(":");
                const width = chapter.nodes > 0 ? `${(chapter.completed / chapter.nodes) * 100}%` : "0%";

                return (
                  <Link key={chapter.name} href={`/chapter/${index + 1}`} className={styles.chapterCard}>
                    <div className={styles.chapterVisual} style={{ background: chapter.bg }}>
                      <span className={styles.chapterEmoji}>{chapter.emoji}</span>
                      <span className={styles.chapterIndex}>CH {index + 1}</span>
                    </div>

                    <div className={styles.chapterBody}>
                      <div className={styles.chapterMeta}>
                        <span style={{ color: chapter.color }}>Chapter {index + 1}</span>
                        <span>{chapter.completed}/{chapter.nodes} node</span>
                      </div>
                      <h3 className={styles.chapterTitle}>{title}</h3>
                      <p className={styles.chapterSubtitle}>{subtitle || "Progress pembelajaran aktif"}</p>
                      <div className={styles.chapterProgressBar}>
                        <div className={styles.chapterProgressFill} style={{ width, background: chapter.color }} />
                      </div>
                      <span className={styles.chapterAction}>{chapter.completed > 0 ? "Lanjutkan chapter" : "Mulai chapter"}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className={styles.sectionPanel}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Top Players</p>
                <h2 className={styles.sectionTitle}>Leaderboard</h2>
                <p className={styles.sectionDescription}>Lebih ringkas, lebih rapi, dan tetap menonjolkan ranking secara cepat.</p>
              </div>
            </div>

            <div className={styles.leaderboardCard}>
              {leaderboard.length > 0 ? (
                leaderboard.map((player, index) => (
                  <div key={`${player.name}-${index}`} className={styles.leaderboardRow}>
                    <div
                      className={styles.leaderRank}
                      style={{ background: rankColors[index]?.bg || "#f1f5f9", color: rankColors[index]?.text || "#64748b" }}
                    >
                      {index + 1}
                    </div>
                    <div className={styles.leaderCopy}>
                      <h3 className={styles.leaderName}>{player.name}</h3>
                      <p className={styles.leaderSubtext}>MoLeCul score</p>
                    </div>
                    <div className={styles.leaderScoreBlock}>
                      <span className={styles.leaderScore}>{player.score.toLocaleString()}</span>
                      <span className={styles.leaderScoreLabel}>XP</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>Belum ada data leaderboard.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Link href="/about" className={styles.aboutBanner}>
          <div>
            <p className={styles.aboutEyebrow}>About MoLeCul</p>
            <h2 className={styles.aboutTitle}>Pelajari filosofi, fitur, dan tim di balik platform ini.</h2>
            <p className={styles.aboutDescription}>Cocok dipakai sebagai jalur orientasi, pembiasaan, sampai penguatan budaya belajar digital.</p>
          </div>
          <span className={styles.aboutArrow}>↗</span>
        </Link>
      </section>

      {userEmail === "hadhiee@gmail.com" ? (
        <section className={styles.adminSection}>
          <Link href="/admin/logs" className={styles.adminLink}>Buka Control Center</Link>
        </section>
      ) : null}

      <footer className={styles.footer}>
        <p className={styles.footerTagline}>ATTITUDE IS EVERYTHING</p>
        <p className={styles.footerMeta}>SMK TELKOM MALANG © 2026</p>
      </footer>

      <nav className={styles.bottomNav}>
        {navItems.slice(0, 2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.bottomNavItem} ${item.active ? styles.bottomNavItemActive : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

        <div className={styles.bottomNavCenter}>
          <FocusChatButton />
          <Link href="/ai-tutor" className={styles.modyButton}>
            <div className={styles.modyButtonIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
              <span className={styles.modyDot}>AI</span>
            </div>
            <span>MoDy</span>
          </Link>
        </div>

        {navItems.slice(2).map((item) => (
          <Link key={item.href} href={item.href} className={styles.bottomNavItem}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
