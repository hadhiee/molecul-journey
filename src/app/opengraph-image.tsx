import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MoLeCul - Moklet Learning Culture Journey';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #e11d48 0%, #be123c 50%, #9f1239 100%)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                {/* Molecule Icon */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        width: 280,
                        height: 280,
                        marginBottom: 30,
                    }}
                >
                    {/* Orbit rings */}
                    <div
                        style={{
                            position: 'absolute',
                            width: 260,
                            height: 100,
                            borderRadius: '50%',
                            border: '8px solid rgba(255,255,255,0.35)',
                            transform: 'rotate(60deg)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            width: 260,
                            height: 100,
                            borderRadius: '50%',
                            border: '8px solid rgba(255,255,255,0.35)',
                            transform: 'rotate(-60deg)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            width: 260,
                            height: 100,
                            borderRadius: '50%',
                            border: '8px solid rgba(255,255,255,0.35)',
                        }}
                    />
                    {/* Nucleus */}
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        }}
                    />
                    {/* Electrons */}
                    <div
                        style={{
                            position: 'absolute',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            top: 20,
                            right: 30,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            bottom: 20,
                            right: 30,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            left: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                    />
                </div>

                {/* Title */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 900,
                            color: 'white',
                            letterSpacing: 6,
                            textShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        }}
                    >
                        MOLECUL
                    </div>
                    <div
                        style={{
                            fontSize: 28,
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.85)',
                            letterSpacing: 2,
                        }}
                    >
                        Moklet Learning Culture Journey
                    </div>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 400,
                            color: 'rgba(255,255,255,0.65)',
                            marginTop: 8,
                        }}
                    >
                        SMK Telkom Malang
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
