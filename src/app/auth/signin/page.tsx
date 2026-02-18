"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const getErrorMessage = (error: string) => {
        switch (error) {
            case "OAuthSignin":
                return "Error configuring OAuth. Check NEXTAUTH_URL and Google Console configuration.";
            case "OAuthCallback":
                return "Error during OAuth callback. Try again.";
            case "AccessDenied":
                return "You do not have permission to sign in (Email domain restricted?).";
            default:
                return "An unknown error occurred.";
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f0f2f5' }}>
            <div style={{
                width: '100%', maxWidth: 420, background: 'white', borderRadius: 28,
                padding: 40, boxShadow: '0 20px 60px -10px rgba(0,0,0,0.1)',
                position: 'relative', zIndex: 1,
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center' as const, marginBottom: 40 }}>
                    <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#e11d48', background: '#fff1f2', padding: '5px 14px', borderRadius: 99, textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 16 }}>
                        Login Required
                    </span>
                    <h1 style={{ fontSize: 48, fontWeight: 800, background: 'linear-gradient(135deg, #1a1a2e, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.04em', fontStyle: 'italic', marginBottom: 4 }}>
                        MoLeCul
                    </h1>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.2em' }}>
                        Moklet Learning Culture
                    </p>
                </div>

                {error && (
                    <div style={{
                        marginBottom: 24, padding: 16, borderRadius: 12,
                        backgroundColor: '#fee2e2', border: '1px solid #fecaca',
                        color: '#991b1b', fontSize: 13, fontWeight: 600, textAlign: 'center'
                    }}>
                        {getErrorMessage(error)}
                    </div>
                )}

                <div style={{ textAlign: 'center' as const, marginBottom: 32 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 6 }}>Mulai Perjalanan</h2>
                    <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Masuk untuk memulai simulasi budaya MOKLET.</p>
                </div>

                <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    style={{
                        width: '100%', padding: '18px 24px', border: 'none', borderRadius: 16,
                        background: '#e11d48', color: 'white', fontSize: 15, fontWeight: 800,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                        boxShadow: '0 12px 24px -4px rgba(225,29,72,0.35)',
                        transition: 'all 0.2s',
                    }}
                >
                    <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: 20, height: 20, background: 'white', borderRadius: '50%', padding: 2 }} />
                    Sign in with Google
                </button>

                <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #f3f4f6', textAlign: 'center' as const }}>
                    <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, lineHeight: 1.5 }}>
                        Terbuka untuk akun <strong style={{ color: '#e11d48' }}>@smktelkom-mlg.sch.id</strong><br />
                        & akun Google lainnya untuk mengenal lebih dalam Moklet.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignIn() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInContent />
        </Suspense>
    );
}
