"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { SYSTEM_IDS } from "@/lib/ids";

export default function GlobalActivityTracker() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            const trackActivity = async () => {
                try {
                    // Update user_progress with HEARTBEAT to show they are active
                    // We use mission_id: 'SYSTEM_HEARTBEAT' for this
                    // choice_label will store their status
                    const email = session.user?.email || "";
                    await supabase.from("user_progress").upsert({
                        user_email: email,
                        mission_id: SYSTEM_IDS.HEARTBEAT,
                        score: 0,
                        choice_label: "ONLINE",
                        created_at: new Date().toISOString()
                    }, { onConflict: 'user_email, mission_id' });
                } catch (e) {
                    console.error("Heartbeat failed", e);
                }
            };

            trackActivity();
            const interval = setInterval(trackActivity, 60000); // Pulse every minute
            return () => clearInterval(interval);
        }
    }, [status, session]);

    return null;
}
