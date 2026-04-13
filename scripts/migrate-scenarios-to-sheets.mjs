import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

dotenv.config({ path: new URL("../.env.local", import.meta.url) });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEETS_SCENARIOS_TAB || "scenarios";
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n");

const HEADERS = [
  "id",
  "chapter",
  "title",
  "context",
  "tags_json",
  "choices_json",
  "is_published",
  "created_at",
  "updated_at",
];

function assertConfig() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!SPREADSHEET_ID) missing.push("GOOGLE_SHEETS_SPREADSHEET_ID");
  if (!SERVICE_ACCOUNT_EMAIL) missing.push("GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL");
  if (!PRIVATE_KEY) missing.push("GOOGLE_SHEETS_PRIVATE_KEY");

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
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
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const existingSheet = spreadsheet.data.sheets?.find(
    (sheet) => sheet.properties?.title === SHEET_NAME,
  );

  if (!existingSheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: SHEET_NAME,
              },
            },
          },
        ],
      },
    });
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:I1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [HEADERS],
    },
  });
}

async function loadAllScenarios() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  const PAGE_SIZE = 1000;
  let from = 0;
  let hasMore = true;
  const rows = [];

  while (hasMore) {
    const { data, error } = await supabase
      .from("scenarios")
      .select("id, chapter, title, context, tags, choices, is_published, created_at")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch scenarios from Supabase: ${error.message}`);
    }

    if (!data || data.length === 0) {
      hasMore = false;
      continue;
    }

    rows.push(...data);
    from += PAGE_SIZE;
    if (data.length < PAGE_SIZE) {
      hasMore = false;
    }
  }

  return rows;
}

async function main() {
  assertConfig();

  const sheets = createSheetsClient();
  await ensureSheet(sheets);

  const scenarios = await loadAllScenarios();
  const values = scenarios.map((row) => [
    row.id,
    String(row.chapter ?? 0),
    row.title ?? "",
    row.context ?? "",
    JSON.stringify(row.tags ?? null),
    JSON.stringify(row.choices ?? []),
    String(row.is_published ?? true),
    row.created_at ?? new Date().toISOString(),
    row.created_at ?? new Date().toISOString(),
  ]);

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:I`,
  });

  if (values.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:I${values.length + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });
  }

  console.log(`Migrated ${values.length} scenarios to Google Sheets (${SHEET_NAME}).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
