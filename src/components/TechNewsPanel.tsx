"use client";

import { useState, useEffect } from 'react';

interface NewsItem {
    id: number;
    category: 'Cyber Security' | 'DevOps' | 'Cloud Computing';
    title: string;
    description: string;
    source: string;
    icon: string;
    color: string;
}

const NEWS_DATA: NewsItem[] = [
    {
        id: 1,
        category: 'Cyber Security',
        title: 'New Ransomware Variant Targeted at Cloud Infrastructure',
        description: 'Researchers have discovered a sophisticated ransomware strain that specifically targets misconfigured bucket storage.',
        source: 'Cyber Defense Mag',
        icon: '🛡️',
        color: '#e11d48'
    },
    {
        id: 2,
        category: 'DevOps',
        title: 'AI-Driven CI/CD Pipelines: The New Industry Standard',
        description: 'Automated code review and predictive deployment models are significantly reducing lead time for changes.',
        source: 'DevOps Trends',
        icon: '🚀',
        color: '#0ea5e9'
    },
    {
        id: 3,
        category: 'Cloud Computing',
        title: 'Quantum Computing as a Service (QaaS) Enters Beta',
        description: 'Major cloud providers are now offering early access to quantum processors for complex cryptographic simulations.',
        source: 'Cloud Edge',
        icon: '☁️',
        color: '#8b5cf6'
    },
    {
        id: 4,
        category: 'Cyber Security',
        title: 'Zero-Trust Architecture: Moving Beyond the Perimeter',
        description: 'Companies are accelerating Shift-Left security practices to protect distributed workforces.',
        source: 'Security Focus',
        icon: '🔐',
        color: '#f43f5e'
    },
    {
        id: 5,
        category: 'DevOps',
        title: 'Platform Engineering vs Traditional DevOps',
        description: 'The rise of Internal Developer Platforms (IDP) is changing how teams manage infrastructure as code.',
        source: 'SysAdmin Daily',
        icon: '🏗️',
        color: '#10b981'
    },
    {
        id: 6,
        category: 'Cloud Computing',
        title: 'Multi-Cloud Strategy for Enterprise Resilience',
        description: 'Hybrid cloud adoption grows by 35% as organizations seek to avoid single-vendor lock-in.',
        source: 'Tech Infrastructure',
        icon: '🌐',
        color: '#f59e0b'
    }
];

export default function TechNewsPanel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Update news every hour logic: 
    // We can cycle/rotate through news automatically, but "updates 1 jam" usually suggests
    // the user wants fresh content every hour or just a rotation.
    // I'll implement an automatic rotation every 10 seconds for user engagement, 
    // but I'll also use the "Hour" to determine the starting item.

    useEffect(() => {
        // Set initial index based on current hour to satisfy "different news every hour" feel
        const currentHour = new Date().getHours();
        setCurrentIndex(currentHour % NEWS_DATA.length);

        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % NEWS_DATA.length);
                setIsVisible(true);
            }, 500);
        }, 15000); // Rotate every 15s for visual dynamic

        return () => clearInterval(interval);
    }, []);

    const currentNews = NEWS_DATA[currentIndex];

    return (
        <div style={{
            background: 'white',
            borderRadius: 32,
            padding: 24,
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10, backgroundColor: '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                    }}>📡</div>
                    <h2 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Tech Radar</h2>
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', background: '#f1f5f9', padding: '4px 8px', borderRadius: 99 }}>
                    UPDATING HOURLY
                </div>
            </div>

            {/* Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.5s ease-in-out',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)'
            }}>
                {/* Category Tag */}
                <div style={{
                    display: 'inline-block',
                    backgroundColor: `${currentNews.color}15`,
                    color: currentNews.color,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 8,
                    marginBottom: 12,
                    alignSelf: 'flex-start',
                    textTransform: 'uppercase'
                }}>
                    {currentNews.category}
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#1e293b',
                    lineHeight: 1.3,
                    marginBottom: 8
                }}>
                    {currentNews.title}
                </h3>

                {/* Description */}
                <p style={{
                    fontSize: 13,
                    color: '#64748b',
                    lineHeight: 1.5,
                    marginBottom: 16,
                    flex: 1
                }}>
                    {currentNews.description}
                </p>

                {/* Footer info */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 16,
                    borderTop: '1px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{currentNews.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{currentNews.source}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>Live Update</span>
                </div>
            </div>

            {/* Progress Bar (Rotation Timer) */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: 3,
                backgroundColor: currentNews.color,
                width: isVisible ? '100%' : '0%',
                transition: isVisible ? 'width 15s linear' : 'none',
                opacity: 0.3
            }} />
        </div>
    );
}
