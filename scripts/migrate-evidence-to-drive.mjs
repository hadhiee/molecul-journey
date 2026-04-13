import { Readable } from "node:stream";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config({ path: new URL("../.env.local", import.meta.url) });

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEETS_PROGRESS_TAB || "user_progress";
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const EVIDENCE_FOLDER_ID = process.env.GOOGLE_DRIVE_EVIDENCE_FOLDER_ID || "";
const SYSTEM_EVIDENCE_ID = "203aa7de-0e2d-4f49-8b87-9432a6301804";

function assertConfig() {
  const missing = [];
  if (!SPREADSHEET_ID) missing.push("GOOGLE_SHEETS_SPREADSHEET_ID");
  if (!SERVICE_ACCOUNT_EMAIL) missing.push("GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL");
  if (!PRIVATE_KEY) missing.push("GOOGLE_SHEETS_PRIVATE_KEY");
  if (!EVIDENCE_FOLDER_ID) missing.push("GOOGLE_DRIVE_EVIDENCE_FOLDER_ID (Shared Drive folder)");

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

function createAuth(scopes) {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes,
  });
}

function createSheetsClient() {
  return google.sheets({ version: "v4", auth: createAuth(["https://www.googleapis.com/auth/spreadsheets"]) });
}

function createDriveClient() {
  return google.drive({ version: "v3", auth: createAuth(["https://www.googleapis.com/auth/drive"]) });
}

function sanitizeSegment(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "user";
}

function sanitizeFileName(value) {
  const trimmed = value.trim();
  return trimmed.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 140) || "evidence";
}

async function uploadToDrive(drive, buffer, fileName, mimeType, userEmail) {
  const normalizedEmail = sanitizeSegment((userEmail || "user").split("@")[0]);
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
    fields: "id",
    supportsAllDrives: true,
  });

  const fileId = createdFile.data.id;
  if (!fileId) {
    throw new Error(`Failed to upload ${fileName} to Google Drive.`);
  }

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    supportsAllDrives: true,
  });

  return fileId;
}

async function main() {
  assertConfig();

  const sheets = createSheetsClient();
  const drive = createDriveClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:G`,
  });

  const rows = response.data.values || [];
  let migrated = 0;

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2;
    const missionId = row[2] || "";
    const choiceLabel = row[4] || "";
    const userEmail = row[1] || "user";

    if (missionId !== SYSTEM_EVIDENCE_ID || !choiceLabel.includes("|https://") || !choiceLabel.includes("supabase")) {
      continue;
    }

    const [fileName, sourceUrl, mimeType = "application/octet-stream"] = choiceLabel.split("|");
    const fileResponse = await fetch(sourceUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download legacy evidence file: ${sourceUrl}`);
    }

    const buffer = Buffer.from(await fileResponse.arrayBuffer());
    const fileId = await uploadToDrive(drive, buffer, fileName, mimeType, userEmail);
    const nextChoiceLabel = `${fileName}|gdrive:${fileId}|${mimeType}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!E${rowIndex}:G${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[nextChoiceLabel, row[5] || new Date().toISOString(), new Date().toISOString()]],
      },
    });

    migrated += 1;
  }

  console.log(`Migrated ${migrated} legacy evidence rows to Google Drive.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
