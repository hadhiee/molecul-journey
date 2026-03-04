import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { careerId, xp } = await req.json();
        const userEmail = session.user.email.toLowerCase();
        const missionId = `CAREER_EXPLORE_${careerId}`;

        // Check if already claimed
        const { data: existing } = await supabase
            .from("user_progress")
            .select("id")
            .eq("user_email", userEmail)
            .eq("mission_id", missionId)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ ok: true, message: "Already claimed", xp });
        }

        // Insert new record
        await supabase.from("user_progress").insert({
            user_email: userEmail,
            mission_id: missionId,
            score: xp,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        return NextResponse.json({ ok: true, xp });
    } catch (error: any) {
        console.error("Career XP save error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
