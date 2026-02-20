"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SignInContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // Auto-redirect if no error is present
        if (!error && !isRedirecting) {
            const timer = setTimeout(() => {
                setIsRedirecting(true);
                signIn("google", { callbackUrl: "/" });
            }, 800); // Small delay for UX
            return () => clearTimeout(timer);
        }
    }, [error, isRedirecting]);

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
                <div style={{ textAlign: 'center' as const, marginBottom: 32 }}>
                    <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#e11d48', background: '#fff1f2', padding: '5px 14px', borderRadius: 99, textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 16 }}>
                        Login Secure
                    </span>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', marginBottom: 4 }}>
                        MoLeCul
                    </h1>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.2em' }}>
                        Moklet Learning Culture
                    </p>
                </div>

                {error ? (
                    <>
                        <div style={{
                            marginBottom: 24, padding: 16, borderRadius: 12,
                            backgroundColor: '#fee2e2', border: '1px solid #fecaca',
                            color: '#991b1b', fontSize: 13, fontWeight: 600, textAlign: 'center'
                        }}>
                            {getErrorMessage(error)}
                        </div>
                        <button
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            style={{
                                width: '100%', padding: '16px 24px', border: 'none', borderRadius: 16,
                                background: '#e11d48', color: 'white', fontSize: 15, fontWeight: 800,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                                boxShadow: '0 12px 24px -4px rgba(225,29,72,0.35)',
                            }}
                        >
                            Coba Login Lagi
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{
                            width: 48, height: 48, border: '4px solid #f1f5f9',
                            borderTop: '4px solid #e11d48', borderRadius: '50%',
                            margin: '0 auto 24px', animation: 'spin 1s linear infinite'
                        }} />
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                            Mengantarkan ke Beranda...
                        </h2>
                        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 24 }}>
                            Sistem sedang memproses login Anda secara otomatis. Mohon tunggu sebentar.
                        </p>

                        <button
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            style={{
                                background: 'transparent', border: 'none', padding: 0,
                                color: '#e11d48', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Klik di sini jika tidak otomatis
                        </button>
                    </div>
                )}

                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f3f4f6', textAlign: 'center' as const }}>
                    <p style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>
                        &copy; {new Date().getFullYear()} MoLeCul Journey
                    </p>
                </div>
            </div>
            <style jsx global>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
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
