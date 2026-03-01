"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import styles from "./AIChatWidget.module.css";

interface Message {
    role: "user" | "ai";
    content: string;
}

export default function AIChatWidget() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [xpPopup, setXpPopup] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content: "Halo! Saya adalah asisten AI MoLeCul. Ada yang bisa saya bantu tentang pengalaman belajarmu hari ini?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const toggleChat = () => setIsOpen((prev) => !prev);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMsg }],
                }),
            });

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                { role: "ai", content: data.reply || "Maaf, terjadi kesalahan saat merespon." },
            ]);

            // Add XP for chatting
            if (session?.user?.email) {
                try {
                    await supabase.from("user_progress").insert({
                        user_email: session.user.email.toLowerCase(),
                        mission_id: null,
                        score: 5,
                        choice_label: "Ngobrol dengan MoDy AI (Widget)"
                    });
                    setXpPopup(true);
                    setTimeout(() => setXpPopup(false), 2000);
                } catch (e) {
                    console.error("Gagal tambah XP:", e);
                }
            }

        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "ai", content: "Maaf, jaringan sepertinya bermasalah." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Hide widget on the dedicated AI tutor page
    if (pathname === "/ai-tutor") return null;

    return (
        <div className={styles.chatContainer}>
            <div className={`${styles.chatWindow} ${isOpen ? "" : styles.hidden}`}>
                <div className={styles.chatHeader}>
                    <div className={styles.headerTitle}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect>
                            <path d="M2 14h2"></path><path d="M20 14h2"></path>
                            <path d="M15 13v2"></path><path d="M9 13v2"></path>
                        </svg>
                        MoLeCul AI
                    </div>
                    <button className={styles.closeButton} onClick={toggleChat} aria-label="Tutup Chat">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className={styles.chatBody}>
                    {messages.map((msg, i) => (
                        <div key={i} className={styles.messageRow}>
                            <div className={msg.role === "user" ? styles.messageUser : styles.messageAi}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className={styles.messageRow}>
                            <div className={styles.typingIndicator}>
                                <div className={styles.typingDot}></div>
                                <div className={styles.typingDot}></div>
                                <div className={styles.typingDot}></div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <form onSubmit={sendMessage} className={styles.chatFooter} style={{ position: 'relative' }}>
                    {xpPopup && (
                        <div style={{
                            position: 'absolute', top: -30, right: 10,
                            background: '#22c55e', color: 'white', padding: '4px 10px',
                            borderRadius: 12, fontSize: 11, fontWeight: 'bold',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            animation: 'modalIn 0.3s ease-out'
                        }}>
                            +5 XP! ⚡
                        </div>
                    )}
                    <input
                        type="text"
                        className={styles.chatInput}
                        placeholder="Tanya apapun tentang MoLeCul..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className={styles.sendButton} disabled={!input.trim() || isLoading}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>

            {!isOpen && (
                <button className={styles.toggleButton} onClick={toggleChat} aria-label="Buka Chat AI">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            )}
        </div>
    );
}
