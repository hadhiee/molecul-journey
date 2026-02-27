"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface Message {
    role: "user" | "ai";
    content: string;
    timestamp: Date;
}

const TOPIC_CHIPS = [
    { label: "💡 Apa itu ATTITUDE?", prompt: "Jelaskan apa itu budaya ATTITUDE di Moklet secara lengkap" },
    { label: "🏆 Tips Lomba OSN", prompt: "Berikan tips dan strategi untuk memenangkan OSN bidang Informatika" },
    { label: "💻 Belajar Coding", prompt: "Saya ingin belajar coding dari dasar, mulai dari mana?" },
    { label: "🎯 Persiapan LKS", prompt: "Bagaimana cara mempersiapkan diri untuk LKS bidang Cyber Security?" },
    { label: "📖 Motivasi Belajar", prompt: "Saya sedang malas belajar, berikan motivasi dong" },
    { label: "🌐 Cloud Computing", prompt: "Jelaskan tentang Cloud Computing dan bagaimana belajarnya untuk pemula" },
    { label: "🔒 Cyber Security", prompt: "Apa itu Cyber Security dan kenapa penting untuk siswa SMK?" },
    { label: "🤖 Tentang AI", prompt: "Jelaskan tentang Artificial Intelligence dan perannya di dunia IT" },
];

function formatAIContent(text: string): string {
    // Bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="codeBlock">$1</pre>');
    // Inline code
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
}

export default function AITutorPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [typingText, setTypingText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    // Load messages from sessionStorage
    useEffect(() => {
        const saved = sessionStorage.getItem("ai-tutor-messages");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.length > 0) {
                    setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
                    setShowWelcome(false);
                }
            } catch { }
        }
    }, []);

    // Save messages to sessionStorage
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem("ai-tutor-messages", JSON.stringify(messages));
        }
    }, [messages]);

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingText, scrollToBottom]);

    // Typing effect for AI responses
    const typeWriter = useCallback((fullText: string, callback: () => void) => {
        setIsTyping(true);
        let i = 0;
        const speed = 8; // ms per character
        const chunkSize = 3; // characters per tick

        const type = () => {
            if (i < fullText.length) {
                const nextI = Math.min(i + chunkSize, fullText.length);
                setTypingText(fullText.substring(0, nextI));
                i = nextI;
                setTimeout(type, speed);
            } else {
                setIsTyping(false);
                setTypingText("");
                callback();
            }
        };
        type();
    }, []);

    const sendMessage = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || isLoading || isTyping) return;

        setInput("");
        setShowWelcome(false);

        const userMessage: Message = {
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await res.json();
            const aiReply = data.reply || "Maaf, terjadi kesalahan saat memproses pesan.";

            setIsLoading(false);

            typeWriter(aiReply, () => {
                const aiMessage: Message = {
                    role: "ai",
                    content: aiReply,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMessage]);
            });
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            const errMessage: Message = {
                role: "ai",
                content: "Maaf, terjadi masalah koneksi. Silakan coba lagi.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errMessage]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleTopicClick = (prompt: string) => {
        sendMessage(prompt);
    };

    const clearChat = () => {
        setMessages([]);
        setShowWelcome(true);
        sessionStorage.removeItem("ai-tutor-messages");
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.backButton} aria-label="Kembali">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className={styles.headerInfo}>
                        <div className={styles.headerAvatar}>
                            <div className={styles.avatarPulse} />
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
                                <path d="M2 14h2" /><path d="M20 14h2" />
                                <path d="M15 13v2" /><path d="M9 13v2" />
                            </svg>
                        </div>
                        <div>
                            <h1 className={styles.headerTitle}>MoDy - AI Moklet Buddy</h1>
                            <div className={styles.headerStatus}>
                                <span className={styles.statusDot} />
                                Powered by Gemini AI
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    {messages.length > 0 && (
                        <button className={styles.clearButton} onClick={clearChat} title="Hapus percakapan">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>
                    )}
                </div>
            </header>

            {/* Chat Area */}
            <div className={styles.chatArea} ref={chatBodyRef}>
                {showWelcome && (
                    <div className={styles.welcomeContainer}>
                        <div className={styles.welcomeIcon}>
                            <div className={styles.welcomeIconGlow} />
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
                                <path d="M2 14h2" /><path d="M20 14h2" />
                                <path d="M15 13v2" /><path d="M9 13v2" />
                            </svg>
                        </div>
                        <h2 className={styles.welcomeTitle}>Halo! Saya MoDy - AI Moklet Buddy 🎓</h2>
                        <p className={styles.welcomeSubtitle}>
                            Asisten belajar pribadi kamu dari MoLeCul. Tanya apapun tentang pelajaran,
                            budaya sekolah, persiapan lomba, atau minta saran belajar!
                        </p>

                        <div className={styles.featuresGrid}>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>📚</div>
                                <div className={styles.featureTitle}>Bantuan Belajar</div>
                                <div className={styles.featureDesc}>Tanya pelajaran apapun</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>🏆</div>
                                <div className={styles.featureTitle}>Persiapan Lomba</div>
                                <div className={styles.featureDesc}>OSN, LKS, FIKSI</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>💡</div>
                                <div className={styles.featureTitle}>Budaya ATTITUDE</div>
                                <div className={styles.featureDesc}>Karakter & nilai</div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>🎯</div>
                                <div className={styles.featureTitle}>Motivasi</div>
                                <div className={styles.featureDesc}>Semangat & inspirasi</div>
                            </div>
                        </div>

                        <div className={styles.topicSection}>
                            <p className={styles.topicLabel}>✨ Mulai dari topik ini:</p>
                            <div className={styles.topicChips}>
                                {TOPIC_CHIPS.map((chip, i) => (
                                    <button
                                        key={i}
                                        className={styles.topicChip}
                                        onClick={() => handleTopicClick(chip.prompt)}
                                        style={{ animationDelay: `${i * 0.05}s` }}
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`${styles.messageWrapper} ${msg.role === "user" ? styles.messageWrapperUser : styles.messageWrapperAi
                            }`}
                    >
                        {msg.role === "ai" && (
                            <div className={styles.aiAvatar}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
                                    <path d="M2 14h2" /><path d="M20 14h2" />
                                    <path d="M15 13v2" /><path d="M9 13v2" />
                                </svg>
                            </div>
                        )}
                        <div className={styles.messageContent}>
                            <div
                                className={`${styles.messageBubble} ${msg.role === "user" ? styles.messageBubbleUser : styles.messageBubbleAi
                                    }`}
                            >
                                {msg.role === "ai" ? (
                                    <div
                                        className={styles.aiMessageContent}
                                        dangerouslySetInnerHTML={{
                                            __html: formatAIContent(msg.content),
                                        }}
                                    />
                                ) : (
                                    <div className={styles.userMessageContent}>{msg.content}</div>
                                )}
                            </div>
                            <div className={`${styles.messageTime} ${msg.role === "user" ? styles.messageTimeUser : ""}`}>
                                {formatTime(msg.timestamp)}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing indicator / live typing */}
                {isLoading && (
                    <div className={`${styles.messageWrapper} ${styles.messageWrapperAi}`}>
                        <div className={styles.aiAvatar}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
                                <path d="M2 14h2" /><path d="M20 14h2" />
                                <path d="M15 13v2" /><path d="M9 13v2" />
                            </svg>
                        </div>
                        <div className={styles.messageContent}>
                            <div className={`${styles.messageBubble} ${styles.messageBubbleAi}`}>
                                <div className={styles.loadingDots}>
                                    <span /><span /><span />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isTyping && typingText && (
                    <div className={`${styles.messageWrapper} ${styles.messageWrapperAi}`}>
                        <div className={styles.aiAvatar}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
                                <path d="M2 14h2" /><path d="M20 14h2" />
                                <path d="M15 13v2" /><path d="M9 13v2" />
                            </svg>
                        </div>
                        <div className={styles.messageContent}>
                            <div className={`${styles.messageBubble} ${styles.messageBubbleAi}`}>
                                <div
                                    className={styles.aiMessageContent}
                                    dangerouslySetInnerHTML={{
                                        __html: formatAIContent(typingText),
                                    }}
                                />
                                <span className={styles.cursor} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
                <div className={styles.inputContainer}>
                    <textarea
                        ref={inputRef}
                        className={styles.textInput}
                        placeholder="Ketik pertanyaanmu di sini..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading || isTyping}
                        rows={1}
                    />
                    <button
                        className={styles.sendButton}
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || isLoading || isTyping}
                        aria-label="Kirim"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
                <p className={styles.disclaimer}>
                    MoDy - AI Moklet Buddy menggunakan Gemini AI. Jawaban mungkin tidak selalu 100% akurat.
                </p>
            </div>
        </div>
    );
}
