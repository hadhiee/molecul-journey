"use client";
import React, { useEffect, useState } from "react";

export default function ThemeSelector() {
    const [theme, setTheme] = useState("red");

    useEffect(() => {
        const saved = localStorage.getItem("moklet-theme");
        if (saved) {
            setTheme(saved);
            document.documentElement.setAttribute("data-theme", saved);
        }
    }, []);

    const changeTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem("moklet-theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const themes = [
        { id: 'red', color: '#e11d48' },
        { id: 'blue', color: '#3b82f6' },
        { id: 'green', color: '#22c55e' },
        { id: 'yellow', color: '#f59e0b' },
        { id: 'dark', color: '#334155' }
    ];

    return (
        <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 99,
            backdropFilter: 'blur(8px)'
        }}>
            {themes.map(t => (
                <button
                    key={t.id}
                    onClick={() => changeTheme(t.id)}
                    style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: t.color,
                        border: theme === t.id ? '2px solid white' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        transform: theme === t.id ? 'scale(1.2)' : 'scale(1)'
                    }}
                    aria-label={`Change theme to ${t.id}`}
                />
            ))}
        </div>
    );
}
