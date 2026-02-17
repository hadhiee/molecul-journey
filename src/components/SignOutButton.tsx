"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 12,
                padding: '10px 18px',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)',
            }}
        >
            Keluar ↗
        </button>
    );
}
