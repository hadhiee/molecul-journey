"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh() {
    const router = useRouter();

    useEffect(() => {
        // Force refresh the server components to bypass Next.js client router cache.
        // This ensures XP updates from games reflect instantly on the homescreen.
        router.refresh();
    }, [router]);

    return null;
}
