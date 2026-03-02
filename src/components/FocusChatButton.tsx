"use client";

import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FocusChatButton() {
    const { data: session } = useSession();
    const router = useRouter();
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

        // Tunggu sedikit agar UI effect terlihat, baru redirect external
        setTimeout(() => {
            window.open("https://s.id/MoLeCul", "_blank", "noopener,noreferrer");
            setClicked(false); // Reset in case user comes back
        }, 800);
    };

    return (
        <a
            href="https://s.id/MoLeCul"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            style={{
                background: '#ffffff',
                color: '#e11d48',
                borderRadius: 16,
                padding: '12px 16px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: clicked ? 'scale(0.95)' : 'scale(1)',
                position: 'relative'
            }}
        >
            <style>
                {`
                    @keyframes pulse-icon {
                        0% { transform: scale(1); opacity: 0.8; }
                        50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 5px rgba(225, 29, 72, 0.4)); }
                        100% { transform: scale(1); opacity: 0.8; }
                    }
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>

            <div style={{ position: 'relative', width: 28, height: 28 }}>
                <img src="/smk-logo.png" alt="SMK" style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 2, position: 'relative' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>
                        {clicked ? "MENGALIHKAN... ⚡+25 XP" : "YUK FOKUS NGOBROL"}
                    </span>
                    {!clicked && (
                        <span style={{ fontSize: 14, animation: 'pulse-icon 1.5s infinite ease-in-out', display: 'inline-block' }}>✨</span>
                    )}
                </div>
                {!clicked && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginTop: 2 }}>
                        Deep Conversation dg ChatGPT
                    </span>
                )}
            </div>
        </a>
    );
}
