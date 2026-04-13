import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadEvidenceFile } from "@/lib/evidence/server";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "video/mp4",
]);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserEmail = String(session?.user?.email || "").trim().toLowerCase();

    if (!currentUserEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const matchesExtension = /\.(pdf|doc|docx|jpg|jpeg|png|mp4)$/i.test(file.name);
    if (!ALLOWED_MIME_TYPES.has(file.type) && !matchesExtension) {
      return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadEvidenceFile({
      buffer,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      userEmail: currentUserEmail,
    });

    return NextResponse.json(uploaded);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown evidence upload error";
    console.error("Evidence upload API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
