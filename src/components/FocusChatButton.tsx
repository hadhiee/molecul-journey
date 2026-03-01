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
                        mission_id: "MODY_FOCUS_CHAT",
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
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 900,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: clicked ? 'scale(0.95)' : 'scale(1)'
            }}
        >
            <img src="/smk-logo.png" alt="SMK" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            {clicked ? "MENGALIHKAN... ⚡+25 XP" : "YUK FOKUS NGOBROL SAMA AI"}
        </a>
    );
}
