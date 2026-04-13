import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeScenarioOperation } from "@/lib/scenarios/operations";
import type { ScenarioOperation } from "@/lib/scenarios/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserEmail = String(session?.user?.email || "").trim().toLowerCase();

    if (!currentUserEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const operation = (await req.json()) as ScenarioOperation;
    const result = await executeScenarioOperation(operation);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scenarios API error";
    console.error("Scenarios API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
