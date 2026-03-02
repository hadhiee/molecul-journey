import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import Sekolah3DViewer from "./Sekolah3DViewer";

export const metadata = {
    title: "Eksplorasi 3D Gedung Sekolah | MoLeCul",
};

export default async function Sekolah3DPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    const userEmail = session.user?.email || "";

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px' }}>
            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontWeight: 700, fontSize: 14 }}>
                    ← Kembali ke Beranda
                </Link>
                <SignOutButton />
            </div>

            <div style={{
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                borderRadius: 32, padding: '48px 32px', color: 'white', marginBottom: 48,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 50px -12px rgba(15,23,42,0.3)',
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, background: '#e11d48', padding: '6px 12px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Virtual Tour
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Environment
                        </span>
                    </div>
                    <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        Gedung Sekolah 3D
                    </h1>
                    <p style={{ fontSize: 18, opacity: 0.9, fontWeight: 500, marginBottom: 24, maxWidth: 600, lineHeight: 1.5 }}>
                        Jelajahi dan kenali lingkungan kebanggaan Mokleters dalam bentuk model 3 dimensi!
                    </p>
                </div>
                <div style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', opacity: 0.2, filter: 'blur(40px)' }} />
            </div>

            {/* 3D Viewer Client Component */}
            <Sekolah3DViewer userEmail={userEmail} />
        </div>
    );
}
