"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopWeatherBar() {
    const pathname = usePathname();
    const [weather, setWeather] = useState<{
        city: string;
        temp: number;
        condition: string;
        icon: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

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

        const fetchWeatherData = async (lat: number, lon: number, defaultCity?: string) => {
            try {
                let city = defaultCity;

                // Jika kota tidak diketahui (dari GPS), reverse geocode pakai BigDataCloud API (gratis, tanpa key)
                if (!city) {
                    const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
                    if (geoRes.ok) {
                        const geoData = await geoRes.json();
                        city = geoData.city || geoData.locality || "Lokasi Anda";
                    }
                }

                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                if (!weatherRes.ok) throw new Error("Gagal ambil cuaca");

                const weatherData = await weatherRes.json();
                const { temperature, weathercode } = weatherData.current_weather;
                const condition = getCondition(weathercode);

                if (isMounted) {
                    setWeather({
                        city: city || "Lokasi Anda",
                        temp: Math.round(temperature),
                        condition: condition.text,
                        icon: condition.icon,
                    });
                    setLoading(false);
                }
            } catch (error) {
                console.error("Gagal memuat cuaca via koordinat:", error);
                fallbackWeather();
            }
        };

        const fallbackWeather = () => {
            if (isMounted) {
                setWeather({ city: "Malang (Default)", temp: 24, condition: "Cerah Berawan", icon: "⛅" });
                setLoading(false);
            }
        };

        const fetchByIP = async () => {
            try {
                const locRes = await fetch("https://ipapi.co/json/");
                if (!locRes.ok) throw new Error("Ipapi error");
                const locData = await locRes.json();
                await fetchWeatherData(locData.latitude, locData.longitude, locData.city);
            } catch (err) {
                fallbackWeather();
            }
        };

        // Mulai logika utama: Coba GPS Device -> Jika ditolak/timeout -> Coba IP API -> Jika gagal -> Fallback Malang
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeatherData(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("User menolak akses lokasi atau GPS gagal. Beralih ke IP Based Location.", error.message);
                    fetchByIP();
                },
                { timeout: 10000, enableHighAccuracy: true, maximumAge: 300000 }
            );
        } else {
            fetchByIP();
        }

        return () => {
            isMounted = false;
        };
    }, []);

    // Hide on immersive pages
    if (pathname === "/ai-tutor") return null;

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
