"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { stringToUUID } from "@/lib/ids";
import Link from "next/link";

interface Scenario {
    id: string;
    title: string;
    context: string;
    choices: { id: string; label: string; feedback: string }[];
    chapter: number;
}

export default function LightningChallenge() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [timer, setTimer] = useState(12);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [answers, setAnswers] = useState<{ correct: boolean; score: number }[]>([]);
    const [flash, setFlash] = useState<"none" | "correct" | "wrong">("none");
    const [shakeWrong, setShakeWrong] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [combo, setCombo] = useState(1);

    const TOTAL_QUESTIONS = 5;

    useEffect(() => {
        if (status === "unauthenticated") router.push("/auth/signin");
    }, [status, router]);

    // Fetch random scenarios
    const loadScenarios = useCallback(async () => {
        const { data } = await supabase
            .from("scenarios")
            .select("*")
            .limit(50);

        if (data && data.length > 0) {
            // Shuffle and pick TOTAL_QUESTIONS
            const shuffled = data.sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
            setScenarios(shuffled);
        }
    }, []);

    useEffect(() => { loadScenarios(); }, [loadScenarios]);

    // Timer countdown
    useEffect(() => {
        if (phase !== "playing") return;
        if (timer <= 0) {
            handleTimeout();
            return;
        }
        timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [timer, phase]);

    const startGame = () => {
        setPhase("playing");
        setCurrentIndex(0);
        setStreak(0);
        setBestStreak(0);
        setTotalScore(0);
        setAnswers([]);
        setTimer(12);
        setCombo(1);
    };

    const handleTimeout = () => {
        // Timeout = wrong answer
        setStreak(0);
        setCombo(1);
        setAnswers(prev => [...prev, { correct: false, score: 0 }]);
        setShakeWrong(true);
        setTimeout(() => {
            setShakeWrong(false);
            nextQuestion();
        }, 800);
    };

    const handleAnswer = (choiceIndex: number) => {
        if (selectedChoice !== null) return;
        setSelectedChoice(choiceIndex);
        if (timerRef.current) clearTimeout(timerRef.current);

        const choice = scenarios[currentIndex].choices[choiceIndex];
        const isCorrect = choice.id === "A";

        // Time bonus: faster = more points
        const timeBonus = Math.round(timer * 10);
        const baseScore = isCorrect ? 200 : (choice.id === "B" ? 80 : 0);
        const comboMultiplier = isCorrect ? combo : 1;
        const questionScore = (baseScore + timeBonus) * comboMultiplier;

        if (isCorrect) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > bestStreak) setBestStreak(newStreak);
            setCombo(Math.min(combo + 1, 5));
            setFlash("correct");
        } else {
            setStreak(0);
            setCombo(1);
            setFlash("wrong");
            setShakeWrong(true);
        }

        setTotalScore(prev => prev + questionScore);
        setAnswers(prev => [...prev, { correct: isCorrect, score: questionScore }]);

        setTimeout(() => {
            setFlash("none");
            setShakeWrong(false);
            nextQuestion();
        }, 1200);
    };

    const nextQuestion = () => {
        if (currentIndex + 1 >= scenarios.length) {
            finishGame();
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedChoice(null);
            setTimer(12);
        }
    };

    const finishGame = async () => {
        setPhase("result");
        // Save to Supabase
        if (session?.user?.email) {
            await supabase.from("user_progress").insert({
                user_email: session.user.email,
                mission_id: stringToUUID(scenarios[0]?.id.toString()),
                score: totalScore,
                choice_label: "LIGHTNING"
            });
        }
    };

    const scenario = scenarios[currentIndex];
    const timerPercent = (timer / 12) * 100;
    const timerColor = timer > 6 ? '#22c55e' : timer > 3 ? '#f59e0b' : '#ef4444';

    // ========== INTRO SCREEN ==========
    if (phase === "intro") {
        return (
            <div style={{ minHeight: '100vh', background: '#0f0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <style>{`
                    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                    @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                `}</style>
                <div style={{ textAlign: 'center' as const, maxWidth: 400, width: '100%' }}>
                    <div style={{ fontSize: 80, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>⚡</div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: 8 }}>
                        Tantangan Kilat
                    </h1>
                    <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, marginBottom: 32, lineHeight: 1.6 }}>
                        {TOTAL_QUESTIONS} pertanyaan acak. 12 detik per soal.<br />
                        Jawab cepat & benar untuk <strong style={{ color: '#f59e0b' }}>Combo Multiplier</strong>!
                    </p>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                        {[
                            { icon: '⏱️', label: '12 Detik', desc: 'Per Soal' },
                            { icon: '🔥', label: 'Streak', desc: 'Combo x5' },
                            { icon: '💎', label: 'Bonus', desc: 'Time Bonus' },
                        ].map((item, i) => (
                            <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 }}>
                                <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: 'white' }}>{item.label}</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={startGame}
                        disabled={scenarios.length === 0}
                        style={{
                            width: '100%', padding: 20, border: 'none', borderRadius: 18,
                            background: scenarios.length > 0 ? 'linear-gradient(135deg, #e11d48, #f43f5e)' : '#333',
                            color: 'white', fontSize: 16, fontWeight: 900,
                            textTransform: 'uppercase' as const, letterSpacing: '0.2em',
                            cursor: scenarios.length > 0 ? 'pointer' : 'not-allowed',
                            boxShadow: '0 12px 32px -4px rgba(225,29,72,0.5)',
                            animation: scenarios.length > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
                        }}
                    >
                        {scenarios.length > 0 ? '🚀 MULAI!' : 'Memuat...'}
                    </button>

                    <Link href="/" style={{ display: 'block', marginTop: 20, fontSize: 12, color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                        ← Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // ========== RESULT SCREEN ==========
    if (phase === "result") {
        const correctCount = answers.filter(a => a.correct).length;
        const accuracy = Math.round((correctCount / answers.length) * 100);
        const grade = accuracy >= 80 ? 'S' : accuracy >= 60 ? 'A' : accuracy >= 40 ? 'B' : 'C';
        const gradeColor = grade === 'S' ? '#f59e0b' : grade === 'A' ? '#22c55e' : grade === 'B' ? '#3b82f6' : '#94a3b8';
        const emoji = grade === 'S' ? '👑' : grade === 'A' ? '🔥' : grade === 'B' ? '💪' : '📚';

        return (
            <div style={{ minHeight: '100vh', background: '#0f0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <style>{`
                    @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                `}</style>
                <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' as const }}>
                    <div style={{ fontSize: 64, marginBottom: 8, animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>{emoji}</div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 4 }}>Tantangan Selesai!</h1>
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>{session?.user?.name}</p>

                    {/* Grade Badge */}
                    <div style={{
                        width: 100, height: 100, margin: '0 auto 28px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${gradeColor}33, ${gradeColor}11)`,
                        border: `3px solid ${gradeColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
                    }}>
                        <span style={{ fontSize: 40, fontWeight: 900, color: gradeColor }}>{grade}</span>
                    </div>

                    {/* Score */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, marginBottom: 20, animation: 'slideUp 0.5s ease 0.3s both' }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 8 }}>Total Skor</div>
                        <div style={{ fontSize: 48, fontWeight: 900, color: 'white', fontFamily: "'Courier New', monospace" }}>{totalScore.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: '#e11d48', fontWeight: 700 }}>XP</div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28, animation: 'slideUp 0.5s ease 0.4s both' }}>
                        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: 14 }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>{correctCount}/{answers.length}</div>
                            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const }}>Benar</div>
                        </div>
                        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: 14 }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>{bestStreak}</div>
                            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const }}>Best Streak</div>
                        </div>
                        <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: 14 }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: '#3b82f6' }}>{accuracy}%</div>
                            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const }}>Akurasi</div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10, animation: 'slideUp 0.5s ease 0.5s both' }}>
                        <button onClick={() => { loadScenarios(); setPhase("intro"); }} style={{
                            width: '100%', padding: 18, border: 'none', borderRadius: 16,
                            background: 'linear-gradient(135deg, #e11d48, #f43f5e)', color: 'white',
                            fontSize: 13, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.15em',
                            cursor: 'pointer', boxShadow: '0 8px 20px -4px rgba(225,29,72,0.4)',
                        }}>
                            🔄 Main Lagi
                        </button>
                        <Link href="/" style={{
                            display: 'block', textAlign: 'center' as const, padding: 16, borderRadius: 14,
                            background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: 12, fontWeight: 800,
                            textTransform: 'uppercase' as const, letterSpacing: '0.1em', textDecoration: 'none',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            Halaman Utama
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ========== PLAYING SCREEN ==========
    if (!scenario) return null;

    return (
        <div style={{
            minHeight: '100vh', background: '#0f0f1e', padding: '24px 16px',
            animation: shakeWrong ? 'shake 0.4s ease' : 'none',
        }}>
            <style>{`
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
                @keyframes flashGreen { 0% { background: rgba(34,197,94,0.3); } 100% { background: transparent; } }
                @keyframes flashRed { 0% { background: rgba(239,68,68,0.3); } 100% { background: transparent; } }
                @keyframes timerPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Flash overlay */}
            {flash !== "none" && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
                    animation: flash === "correct" ? 'flashGreen 0.6s ease' : 'flashRed 0.6s ease',
                }} />
            )}

            <div style={{ maxWidth: 480, margin: '0 auto' }}>
                {/* HUD Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Link href="/" style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                            ← Keluar
                        </Link>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>{currentIndex + 1}/{scenarios.length}</span>
                    </div>
                    {streak > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.15)', padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(245,158,11,0.3)' }}>
                            <span style={{ fontSize: 14 }}>🔥</span>
                            <span style={{ fontSize: 13, fontWeight: 900, color: '#f59e0b' }}>x{streak}</span>
                        </div>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 900, color: 'white', fontFamily: "'Courier New', monospace" }}>
                        {totalScore.toLocaleString()} <span style={{ fontSize: 10, color: '#e11d48' }}>XP</span>
                    </div>
                </div>

                {/* Timer Bar */}
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, marginBottom: 24, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${timerPercent}%`, background: timerColor,
                        borderRadius: 99, transition: 'width 1s linear, background 0.3s',
                        boxShadow: `0 0 12px ${timerColor}66`,
                    }} />
                </div>

                {/* Timer Number */}
                <div style={{ textAlign: 'center' as const, marginBottom: 20 }}>
                    <span style={{
                        fontSize: 56, fontWeight: 900, color: timerColor,
                        fontFamily: "'Courier New', monospace",
                        animation: timer <= 3 ? 'timerPulse 0.5s ease-in-out infinite' : 'none',
                        textShadow: `0 0 30px ${timerColor}44`,
                    }}>
                        {timer}
                    </span>
                </div>

                {/* Combo Indicator */}
                {combo > 1 && (
                    <div style={{ textAlign: 'center' as const, marginBottom: 16 }}>
                        <span style={{
                            display: 'inline-block', background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            color: 'white', fontSize: 11, fontWeight: 900,
                            padding: '6px 16px', borderRadius: 99, letterSpacing: '0.1em',
                            boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                        }}>
                            COMBO x{combo}
                        </span>
                    </div>
                )}

                {/* Question Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20, padding: 24, marginBottom: 20, animation: 'fadeIn 0.4s ease',
                }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1.4, marginBottom: 12 }}>
                        {scenario.title}
                    </h2>
                    <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic' }}>
                        &ldquo;{scenario.context}&rdquo;
                    </p>
                </div>

                {/* Choices */}
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                    {scenario.choices?.map((choice: any, i: number) => {
                        const isSelected = selectedChoice === i;
                        const isCorrectChoice = choice.id === "A";
                        const showFeedback = selectedChoice !== null;

                        let cardBg = 'rgba(255,255,255,0.04)';
                        let cardBorder = '1px solid rgba(255,255,255,0.08)';

                        if (showFeedback) {
                            if (isSelected && isCorrectChoice) {
                                cardBg = 'rgba(34,197,94,0.15)';
                                cardBorder = '2px solid #22c55e';
                            } else if (isSelected && !isCorrectChoice) {
                                cardBg = 'rgba(239,68,68,0.15)';
                                cardBorder = '2px solid #ef4444';
                            } else if (isCorrectChoice) {
                                cardBg = 'rgba(34,197,94,0.08)';
                                cardBorder = '1px solid rgba(34,197,94,0.3)';
                            }
                        }

                        return (
                            <div
                                key={i}
                                onClick={() => handleAnswer(i)}
                                style={{
                                    background: cardBg, border: cardBorder,
                                    borderRadius: 16, padding: 16,
                                    display: 'flex', alignItems: 'flex-start', gap: 14,
                                    cursor: selectedChoice === null ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    opacity: showFeedback && !isSelected && !isCorrectChoice ? 0.4 : 1,
                                }}
                            >
                                <div style={{
                                    width: 34, height: 34, minWidth: 34, borderRadius: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: 14, flexShrink: 0,
                                    background: showFeedback && isSelected
                                        ? (isCorrectChoice ? '#22c55e' : '#ef4444')
                                        : 'rgba(255,255,255,0.08)',
                                    color: showFeedback && isSelected ? 'white' : '#94a3b8',
                                }}>
                                    {showFeedback && isSelected ? (isCorrectChoice ? '✓' : '✗') : choice.id}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.5, paddingTop: 5 }}>
                                    {choice.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
