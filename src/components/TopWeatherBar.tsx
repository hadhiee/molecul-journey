"use client";

import { useEffect, useState } from "react";

export default function TopWeatherBar() {
    const [weather, setWeather] = useState<{
        city: string;
        temp: number;
        condition: string;
        icon: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getWeatherData() {
            try {
                // 1. Get location via IP
                const locRes = await fetch("https://ipapi.co/json/");
                const locData = await locRes.json();
                const { city, latitude, longitude } = locData;

                // 2. Get weather via Open-Meteo
                const weatherRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
                );
                const weatherData = await weatherRes.json();
                const { temperature, weathercode } = weatherData.current_weather;

                // 3. Map weather code to emoji/text
                // Ref: https://open-meteo.com/en/docs
                const getCondition = (code: number) => {
                    if (code === 0) return { text: "Cerah", icon: "☀️" };
                    if (code <= 3) return { text: "Berawan", icon: "☁️" };
                    if (code <= 48) return { text: "Kabut", icon: "🌫️" };
                    if (code <= 57) return { text: "Gerimis", icon: "🌦️" };
                    if (code <= 67) return { text: "Hujan", icon: "🌧️" };
                    if (code <= 77) return { text: "Salju", icon: "❄️" };
                    if (code <= 82) return { text: "Hujan Deras", icon: "⛈️" };
                    if (code <= 99) return { text: "Badai Guntur", icon: "🌩️" };
                    return { text: "Unknown", icon: "🌡️" };
                };

                const condition = getCondition(weathercode);

                setWeather({
                    city: city || "Unknown Location",
                    temp: Math.round(temperature),
                    condition: condition.text,
                    icon: condition.icon,
                });
            } catch (error) {
                console.error("Failed to fetch weather:", error);
                // Fallback weather
                setWeather({
                    city: "Malang (Default)",
                    temp: 24,
                    condition: "Cerah Berawan",
                    icon: "⛅",
                });
            } finally {
                setLoading(false);
            }
        }

        getWeatherData();
    }, []);

    if (loading || !weather) {
        return (
            <div style={{
                background: "#e11d48",
                color: "white",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                position: "sticky",
                top: 0,
                zIndex: 2000
            }}>
                <div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span>Memuat info cuaca...</span>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            background: "#e11d48",
            color: "white",
            padding: "8px 20px",
            fontSize: "12px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 2000,
            letterSpacing: "0.02em"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px" }}>📍</span>
                <span>{weather.city ? weather.city.toUpperCase() : "LOKASI ANDA"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "99px" }}>
                <span>{weather.icon}</span>
                <span>{weather.temp}°C</span>
                <span style={{ opacity: 0.8, fontWeight: 600 }}>{weather.condition}</span>
            </div>
        </div>
    );
}
