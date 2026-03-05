"use client";

import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function FocusChatButton() {
    const { data: session } = useSession();
    const [clicked, setClicked] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!clicked) {
            setClicked(true);
            try {
                const email = session?.user?.email;
                if (email) {
                    await supabase.from("user_progress").insert({
                        user_email: email.toLowerCase(),
                        mission_id: null,
                        score: 25,
                        choice_label: "Fokus Ngobrol sama AI"
                    });
                }
            } catch (err) { }
        }

        setTimeout(() => {
            window.open("https://s.id/MoLeCul", "_blank", "noopener,noreferrer");
            setClicked(false);
        }, 600);
    };

    return (
        <a
            href="https://s.id/MoLeCul"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textDecoration: 'none', cursor: 'pointer',
                transition: 'all 0.2s',
                transform: clicked ? 'scale(0.92)' : 'scale(1)',
            }}
        >
            <style>
                {`
                    @keyframes pulse-chat {
                        0% { box-shadow: 0 4px 16px -4px rgba(225,29,72,0.4); }
                        50% { box-shadow: 0 6px 24px -4px rgba(225,29,72,0.6); }
                        100% { box-shadow: 0 4px 16px -4px rgba(225,29,72,0.4); }
                    }
                `}
            </style>
            <div style={{
                width: 46, height: 46, borderRadius: 16,
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid white',
                position: 'relative',
                animation: 'pulse-chat 2s infinite ease-in-out',
            }}>
                {clicked ? (
                    <span style={{ fontSize: 16, color: 'white' }}>⚡</span>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
                <span style={{
                    position: 'absolute', top: -5, right: -5,
                    width: 14, height: 14, borderRadius: 7,
                    background: '#f59e0b', border: '2px solid white',
                    fontSize: 7, fontWeight: 900, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✨</span>
            </div>
            <span style={{ fontSize: 8, fontWeight: 800, color: '#e11d48', marginTop: 2, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                {clicked ? '+25 XP' : 'Ngobrol'}
            </span>
        </a>
    );
}
