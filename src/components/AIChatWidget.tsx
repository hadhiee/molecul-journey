"use client";

import { useState } from "react";
import styles from "./AIChatWidget.module.css";

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => setIsOpen((prev) => !prev);

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

                {/* Body for iframe */}
                <div className={styles.chatBody} style={{ padding: 0, overflow: 'hidden' }}>
                    <iframe
                        /* 
                          Catatan Penting: 
                          Situs utama ChatGPT (chatgpt.com) biasanya memblokir akses iframe (X-Frame-Options: DENY). 
                          Jika tertulis "chatgpt.com refused to connect", itu berarti kebijakan blokir milik OpenAI yang bekerja.
                          Kamu bisa mengganti URL di bawah dengan penyedia Chatbot Embed (seperti Chatbase, Typebot, dll) yang mengizinkan Iframe.
                        */
                        src="https://chatgpt.com"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="AI Assistant"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                    />
                </div>
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
