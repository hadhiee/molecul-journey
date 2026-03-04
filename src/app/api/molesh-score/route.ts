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

        const { sesiId, score, correctCount, totalQuestions } = await req.json();
        const userEmail = session.user.email.toLowerCase();
        const missionId = `MOLESH_SESI_${sesiId}`;

        // Check if already completed
        const { data: existing } = await supabase
            .from("user_progress")
            .select("id, score")
            .eq("user_email", userEmail)
            .eq("mission_id", missionId)
            .maybeSingle();

        if (existing) {
            // Update only if new score is higher
            if (score > (existing.score || 0)) {
                await supabase
                    .from("user_progress")
                    .update({
                        score,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", existing.id);
            }
        } else {
            // Insert new record
            await supabase.from("user_progress").insert({
                user_email: userEmail,
                mission_id: missionId,
                score,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
        }

        return NextResponse.json({ ok: true, score, correctCount, totalQuestions });
    } catch (error: any) {
        console.error("MOLESH score save error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
