"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MOLESH_SESSIONS } from "@/data/moleshData";
import type { QuizQuestion } from "@/data/moleshData";

export default function MoleshSesiPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [sesiId, setSesiId] = useState<number>(0);
    const [phase, setPhase] = useState<"intro" | "content" | "activity" | "quiz" | "result">("intro");
    const [currentSection, setCurrentSection] = useState(0);
    const [quizIndex, setQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        params.then(p => setSesiId(parseInt(p.id)));
    }, [params]);

    const sesi = MOLESH_SESSIONS.find(s => s.id === sesiId);

    if (!sesi) {
        return (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8' }}>Memuat sesi...</div>
            </div>
        );
    }

    const handleAnswer = (optIdx: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(optIdx);
        setShowExplanation(true);
        const isCorrect = optIdx === sesi.quiz[quizIndex].correctIndex;
        if (isCorrect) setCorrectCount(c => c + 1);
        setAnswers([...answers, optIdx]);
    };

    const nextQuiz = () => {
        setSelectedAnswer(null);
        setShowExplanation(false);
        if (quizIndex < sesi.quiz.length - 1) {
            setQuizIndex(quizIndex + 1);
        } else {
            setPhase("result");
        }
    };

    const scoreXP = Math.round((correctCount / sesi.quiz.length) * sesi.xpReward);

    const saveScore = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/molesh-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sesiId: sesi.id,
                    score: scoreXP,
                    correctCount,
                    totalQuestions: sesi.quiz.length,
                }),
            });
            if (res.ok) setSaved(true);
        } catch (e) {
            console.error(e);
        }
        setSaving(false);
    };

    // Render phases
    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <button
                    onClick={() => {
                        if (phase === "intro") router.push("/molesh");
                        else if (phase === "content" && currentSection === 0) setPhase("intro");
                        else if (phase === "content") setCurrentSection(currentSection - 1);
                        else if (phase === "activity") setPhase("content");
                        else if (phase === "quiz") setPhase("activity");
                        else router.push("/molesh");
                    }}
                    style={{ fontSize: 13, fontWeight: 700, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >← Kembali</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, color: sesi.pilarColor, background: sesi.pilarBg, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.05em' }}>{sesi.pilar}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Sesi {sesi.id}/6</span>
                </div>
            </div>

            {/* Progress Steps */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
                {["Intro", "Materi", "Aktivitas", "Kuis", "Hasil"].map((label, i) => {
                    const phases = ["intro", "content", "activity", "quiz", "result"];
                    const currentPhaseIdx = phases.indexOf(phase);
                    const isActive = i <= currentPhaseIdx;
                    return (
                        <div key={label} style={{ flex: 1 }}>
                            <div style={{ height: 4, borderRadius: 2, background: isActive ? sesi.pilarColor : '#e5e7eb', transition: 'background 0.3s' }} />
                            <div style={{ fontSize: 8, fontWeight: 700, color: isActive ? sesi.pilarColor : '#cbd5e1', textAlign: 'center', marginTop: 4 }}>{label}</div>
                        </div>
                    );
                })}
            </div>

            {/* ===== INTRO PHASE ===== */}
            {phase === "intro" && (
                <div>
                    <div style={{ fontSize: 48, marginBottom: 16, textAlign: 'center' }}>{sesi.emoji}</div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1e293b', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em' }}>
                        {sesi.title}
                    </h1>
                    <div style={{ fontSize: 14, color: '#64748b', textAlign: 'center', fontWeight: 600, marginBottom: 8 }}>{sesi.subtitle}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: sesi.pilarColor, background: sesi.pilarBg, padding: '4px 12px', borderRadius: 20 }}>{sesi.pilar}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', background: '#f8fafc', padding: '4px 12px', borderRadius: 20 }}>⏱ {sesi.duration}</span>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        borderRadius: 20, padding: 24, marginBottom: 20,
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: '#64748b', letterSpacing: '0.1em', marginBottom: 10 }}>🎯 TUJUAN PEMBELAJARAN</div>
                        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, fontWeight: 500 }}>{sesi.objective}</div>
                    </div>

                    <div style={{
                        background: 'white', borderRadius: 20, padding: 24, marginBottom: 28,
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: '#64748b', letterSpacing: '0.1em', marginBottom: 10 }}>📖 PEMBUKAAN</div>
                        <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, fontWeight: 500 }}>{sesi.intro}</div>
                    </div>

                    <button
                        onClick={() => { setPhase("content"); setCurrentSection(0); }}
                        style={{
                            width: '100%', padding: '16px 24px', background: sesi.pilarColor,
                            color: 'white', border: 'none', borderRadius: 16, fontSize: 15,
                            fontWeight: 800, cursor: 'pointer',
                            boxShadow: `0 8px 24px -4px ${sesi.pilarColor}40`,
                        }}
                    >
                        Mulai Belajar →
                    </button>
                </div>
            )}

            {/* ===== CONTENT PHASE ===== */}
            {phase === "content" && (
                <div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 12 }}>
                        MATERI {currentSection + 1} / {sesi.sections.length}
                    </div>

                    <div style={{
                        background: 'white', borderRadius: 24, padding: 28,
                        border: '1px solid #e5e7eb', marginBottom: 20,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 16,
                                background: sesi.pilarBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 24
                            }}>
                                {sesi.sections[currentSection].icon}
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', flex: 1 }}>
                                {sesi.sections[currentSection].title}
                            </h2>
                        </div>
                        <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.9, fontWeight: 500, whiteSpace: 'pre-line' }}>
                            {sesi.sections[currentSection].body}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        {currentSection > 0 && (
                            <button
                                onClick={() => setCurrentSection(currentSection - 1)}
                                style={{
                                    flex: 1, padding: '14px 20px', background: '#f1f5f9',
                                    color: '#64748b', border: 'none', borderRadius: 14, fontSize: 14,
                                    fontWeight: 700, cursor: 'pointer'
                                }}
                            >← Sebelumnya</button>
                        )}
                        <button
                            onClick={() => {
                                if (currentSection < sesi.sections.length - 1) {
                                    setCurrentSection(currentSection + 1);
                                } else {
                                    setPhase("activity");
                                }
                            }}
                            style={{
                                flex: 1, padding: '14px 20px', background: sesi.pilarColor,
                                color: 'white', border: 'none', borderRadius: 14, fontSize: 14,
                                fontWeight: 800, cursor: 'pointer',
                                boxShadow: `0 6px 20px -4px ${sesi.pilarColor}40`
                            }}
                        >
                            {currentSection < sesi.sections.length - 1 ? 'Lanjut →' : 'Ke Aktivitas →'}
                        </button>
                    </div>
                </div>
            )}

            {/* ===== ACTIVITY PHASE ===== */}
            {phase === "activity" && (
                <div>
                    <div style={{
                        background: `linear-gradient(135deg, ${sesi.pilarColor}15, ${sesi.pilarColor}08)`,
                        borderRadius: 24, padding: 28, marginBottom: 20,
                        border: `1px solid ${sesi.pilarColor}25`,
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16, textAlign: 'center' }}>{sesi.activity.icon}</div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: sesi.pilarColor, letterSpacing: '0.1em', marginBottom: 8, textAlign: 'center' }}>AKTIVITAS</div>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', textAlign: 'center', marginBottom: 16, letterSpacing: '-0.02em' }}>
                            {sesi.activity.title}
                        </h2>
                        <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.9, fontWeight: 500, whiteSpace: 'pre-line' }}>
                            {sesi.activity.description}
                        </div>
                    </div>

                    <div style={{
                        background: '#fffbeb', borderRadius: 16, padding: 20, marginBottom: 20,
                        border: '1px solid #fde68a'
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#92400e', marginBottom: 6 }}>💡 Refleksi Penutup</div>
                        <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.7, fontWeight: 500 }}>{sesi.closing}</div>
                    </div>

                    <button
                        onClick={() => { setPhase("quiz"); setQuizIndex(0); setCorrectCount(0); setAnswers([]); setSelectedAnswer(null); setShowExplanation(false); }}
                        style={{
                            width: '100%', padding: '16px 24px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white', border: 'none', borderRadius: 16, fontSize: 15,
                            fontWeight: 800, cursor: 'pointer',
                            boxShadow: '0 8px 24px -4px rgba(245,158,11,0.4)',
                        }}
                    >
                        🧠 Mulai Kuis ({sesi.quiz.length} soal) →
                    </button>
                </div>
            )}

            {/* ===== QUIZ PHASE ===== */}
            {phase === "quiz" && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Soal {quizIndex + 1} / {sesi.quiz.length}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>✓ {correctCount} benar</div>
                    </div>

                    {/* Quiz progress dots */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                        {sesi.quiz.map((_, i) => (
                            <div key={i} style={{
                                flex: 1, height: 6, borderRadius: 3,
                                background: i < quizIndex ? (answers[i] === sesi.quiz[i].correctIndex ? '#10b981' : '#ef4444') :
                                    i === quizIndex ? sesi.pilarColor : '#e5e7eb'
                            }} />
                        ))}
                    </div>

                    <div style={{
                        background: 'white', borderRadius: 24, padding: 28,
                        border: '1px solid #e5e7eb', marginBottom: 20,
                    }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', lineHeight: 1.6, marginBottom: 24 }}>
                            {sesi.quiz[quizIndex].question}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {sesi.quiz[quizIndex].options.map((opt, i) => {
                                const isSelected = selectedAnswer === i;
                                const isCorrect = i === sesi.quiz[quizIndex].correctIndex;
                                const showResult = showExplanation;

                                let bg = '#f8fafc';
                                let borderColor = '#e5e7eb';
                                let color = '#334155';

                                if (showResult && isCorrect) { bg = '#f0fdf4'; borderColor = '#10b981'; color = '#065f46'; }
                                else if (showResult && isSelected && !isCorrect) { bg = '#fef2f2'; borderColor = '#ef4444'; color = '#991b1b'; }
                                else if (isSelected) { bg = `${sesi.pilarColor}10`; borderColor = sesi.pilarColor; }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        disabled={selectedAnswer !== null}
                                        style={{
                                            padding: '14px 18px', background: bg,
                                            border: `2px solid ${borderColor}`, borderRadius: 14,
                                            fontSize: 14, fontWeight: 600, color,
                                            cursor: selectedAnswer !== null ? 'default' : 'pointer',
                                            textAlign: 'left', lineHeight: 1.5,
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <span style={{
                                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                            background: showResult && isCorrect ? '#10b981' : showResult && isSelected ? '#ef4444' : '#e5e7eb',
                                            color: showResult && (isCorrect || isSelected) ? 'white' : '#94a3b8',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 800
                                        }}>
                                            {showResult && isCorrect ? '✓' : showResult && isSelected ? '✗' : String.fromCharCode(65 + i)}
                                        </span>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>

                        {showExplanation && (
                            <div style={{
                                marginTop: 20, padding: 18, borderRadius: 14,
                                background: selectedAnswer === sesi.quiz[quizIndex].correctIndex ? '#f0fdf4' : '#fef2f2',
                                border: `1px solid ${selectedAnswer === sesi.quiz[quizIndex].correctIndex ? '#bbf7d0' : '#fecaca'}`
                            }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: selectedAnswer === sesi.quiz[quizIndex].correctIndex ? '#065f46' : '#991b1b', marginBottom: 6 }}>
                                    {selectedAnswer === sesi.quiz[quizIndex].correctIndex ? '🎉 Benar!' : '❌ Kurang tepat'}
                                </div>
                                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, fontWeight: 500 }}>
                                    {sesi.quiz[quizIndex].explanation}
                                </div>
                            </div>
                        )}
                    </div>

                    {showExplanation && (
                        <button
                            onClick={nextQuiz}
                            style={{
                                width: '100%', padding: '16px 24px', background: sesi.pilarColor,
                                color: 'white', border: 'none', borderRadius: 16, fontSize: 15,
                                fontWeight: 800, cursor: 'pointer',
                                boxShadow: `0 6px 20px -4px ${sesi.pilarColor}40`
                            }}
                        >
                            {quizIndex < sesi.quiz.length - 1 ? 'Soal Berikutnya →' : 'Lihat Hasil 🏆'}
                        </button>
                    )}
                </div>
            )}

            {/* ===== RESULT PHASE ===== */}
            {phase === "result" && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>
                        {correctCount === sesi.quiz.length ? '🏆' : correctCount >= sesi.quiz.length * 0.6 ? '🎉' : '📚'}
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1e293b', marginBottom: 8, letterSpacing: '-0.02em' }}>
                        {correctCount === sesi.quiz.length ? 'Sempurna!' : correctCount >= sesi.quiz.length * 0.6 ? 'Bagus Sekali!' : 'Terus Belajar!'}
                    </h2>
                    <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600, marginBottom: 24 }}>
                        Sesi {sesi.id}: {sesi.title}
                    </div>

                    <div style={{
                        background: 'white', borderRadius: 24, padding: 28,
                        border: '1px solid #e5e7eb', marginBottom: 24,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981' }}>{correctCount}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>BENAR</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: '#ef4444' }}>{sesi.quiz.length - correctCount}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>SALAH</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: '#f59e0b' }}>+{scoreXP}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>XP</div>
                            </div>
                        </div>

                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                            <div style={{
                                width: `${(correctCount / sesi.quiz.length) * 100}%`,
                                height: '100%',
                                background: correctCount === sesi.quiz.length ? '#10b981' : correctCount >= sesi.quiz.length * 0.6 ? '#f59e0b' : '#ef4444',
                                borderRadius: 4, transition: 'width 0.5s'
                            }} />
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                            Akurasi: {Math.round((correctCount / sesi.quiz.length) * 100)}%
                        </div>
                    </div>

                    {/* Review answers */}
                    <div style={{ textAlign: 'left', marginBottom: 24 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 12 }}>REVIEW JAWABAN:</div>
                        {sesi.quiz.map((q, i) => {
                            const isCorrect = answers[i] === q.correctIndex;
                            return (
                                <div key={q.id} style={{
                                    background: isCorrect ? '#f0fdf4' : '#fef2f2',
                                    borderRadius: 12, padding: 14, marginBottom: 8,
                                    border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                                    display: 'flex', alignItems: 'flex-start', gap: 12,
                                }}>
                                    <span style={{ fontSize: 14, flexShrink: 0 }}>{isCorrect ? '✅' : '❌'}</span>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>{q.question}</div>
                                        {!isCorrect && (
                                            <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>Jawaban benar: {q.options[q.correctIndex]}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        {!saved ? (
                            <button
                                onClick={saveScore}
                                disabled={saving}
                                style={{
                                    flex: 1, padding: '16px 24px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white', border: 'none', borderRadius: 16, fontSize: 15,
                                    fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.7 : 1,
                                    boxShadow: '0 8px 24px -4px rgba(16,185,129,0.4)',
                                }}
                            >
                                {saving ? 'Menyimpan...' : '💾 Simpan Nilai & XP'}
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push("/molesh")}
                                style={{
                                    flex: 1, padding: '16px 24px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: 'white', border: 'none', borderRadius: 16, fontSize: 15,
                                    fontWeight: 800, cursor: 'pointer',
                                    boxShadow: '0 8px 24px -4px rgba(99,102,241,0.4)',
                                }}
                            >
                                ✅ Tersimpan! Kembali ke MOLESH →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
