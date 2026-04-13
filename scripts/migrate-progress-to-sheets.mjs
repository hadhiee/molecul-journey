import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

dotenv.config({ path: new URL("../.env.local", import.meta.url) });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEETS_PROGRESS_TAB || "user_progress";
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n");

const HEADERS = [
  "id",
  "user_email",
  "mission_id",
  "score",
  "choice_label",
  "created_at",
  "updated_at",
];

function assertEnv() {
  const missing = [];

  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!SPREADSHEET_ID) missing.push("GOOGLE_SHEETS_SPREADSHEET_ID");
  if (!SERVICE_ACCOUNT_EMAIL) missing.push("GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL");
  if (!PRIVATE_KEY) missing.push("GOOGLE_SHEETS_PRIVATE_KEY");

  if (missing.length > 0) {
    throw new Error(`Missing env: ${missing.join(", ")}`);
  }
}

function createSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function ensureSheet(sheets) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = spreadsheet.data.sheets?.find((sheet) => sheet.properties?.title === SHEET_NAME);

  if (!existing) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
      },
    });
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:G1`,
    valueInputOption: "RAW",
    requestBody: { values: [HEADERS] },
  });
}

async function main() {
  assertEnv();

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
  const sheets = createSheetsClient();

  await ensureSheet(sheets);

  const allRows = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("user_progress")
      .select("id, user_email, mission_id, score, choice_label, created_at")
      .range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allRows.push(...data);
    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  const values = allRows.map((row) => [
    String(row.id || crypto.randomUUID()),
    String(row.user_email || "").toLowerCase(),
    row.mission_id || "",
    String(row.score || 0),
    row.choice_label || "",
    row.created_at || new Date().toISOString(),
    row.updated_at || row.created_at || new Date().toISOString(),
  ]);

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:G`,
  });

  if (values.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:G${values.length + 1}`,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  }

  console.log(`Migrated ${values.length} user_progress rows to Google Sheets (${SHEET_NAME}).`);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
