import { Readable } from "node:stream";
import { google } from "googleapis";

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL || "";
const PRIVATE_KEY = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const EVIDENCE_FOLDER_ID = process.env.GOOGLE_DRIVE_EVIDENCE_FOLDER_ID || "";

function assertDriveConfig() {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !EVIDENCE_FOLDER_ID) {
    throw new Error(
      "Google Drive config is incomplete. Set GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, and GOOGLE_DRIVE_EVIDENCE_FOLDER_ID (Shared Drive folder).",
    );
  }
}

function createDriveClient() {
  assertDriveConfig();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "user";
}

function sanitizeFileName(value: string) {
  const trimmed = value.trim();
  return trimmed.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 140) || "evidence";
}

export async function uploadEvidenceFile({
  buffer,
  fileName,
  mimeType,
  userEmail,
}: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  userEmail: string;
}) {
  const drive = createDriveClient();
  const normalizedEmail = sanitizeSegment(userEmail.split("@")[0] || "user");
  const safeName = sanitizeFileName(fileName);
  const driveFileName = `${normalizedEmail}_${Date.now()}_${safeName}`;

  const createdFile = await drive.files.create({
    requestBody: {
      name: driveFileName,
      parents: [EVIDENCE_FOLDER_ID],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  const fileId = createdFile.data.id;
  if (!fileId) {
    throw new Error("Failed to create Google Drive file.");
  }

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    supportsAllDrives: true,
  });

  return {
    fileId,
    storageToken: `gdrive:${fileId}`,
    webViewLink: createdFile.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
    webContentLink: createdFile.data.webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}
