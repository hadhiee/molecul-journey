import { google } from "googleapis";
import type { ScenarioChoice, ScenarioRow, ScenarioRowWithIndex } from "./types";

const SCENARIO_HEADERS = [
  "id",
  "chapter",
  "title",
  "context",
  "tags_json",
  "choices_json",
  "is_published",
  "created_at",
  "updated_at",
] as const;

const DEFAULT_SHEET_NAME = process.env.GOOGLE_SHEETS_SCENARIOS_TAB || "scenarios";
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL || "";
const PRIVATE_KEY = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n");

let ensurePromise: Promise<void> | null = null;

function assertSheetsConfig() {
  if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error(
      "Google Sheets config is incomplete. Set GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SHEETS_PRIVATE_KEY.",
    );
  }
}

function createSheetsClient() {
  assertSheetsConfig();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function ensureScenarioSheet() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const sheets = createSheetsClient();
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const existingSheet = spreadsheet.data.sheets?.find(
        (sheet) => sheet.properties?.title === DEFAULT_SHEET_NAME,
      );

      if (!existingSheet) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: DEFAULT_SHEET_NAME,
                  },
                },
              },
            ],
          },
        });
      }

      const headerRow = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${DEFAULT_SHEET_NAME}!A1:I1`,
      });

      const currentHeaders = headerRow.data.values?.[0] || [];
      const needsHeader =
        currentHeaders.length !== SCENARIO_HEADERS.length ||
        SCENARIO_HEADERS.some((header, index) => currentHeaders[index] !== header);

      if (needsHeader) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${DEFAULT_SHEET_NAME}!A1:I1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [Array.from(SCENARIO_HEADERS)],
          },
        });
      }
    })();
  }

  return ensurePromise;
}

function parseJsonValue(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeScenarioValue(field: string, value: unknown) {
  if (field === "chapter") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (field === "is_published") {
    if (typeof value === "boolean") {
      return value;
    }

    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  if (field === "tags_json" || field === "choices_json") {
    return parseJsonValue(value);
  }

  if (value == null || value === "") {
    if (field === "updated_at" || field === "created_at") {
      return null;
    }

    return "";
  }

  return String(value);
}

function buildScenarioRow(partial: Partial<ScenarioRow>): ScenarioRow {
  const now = new Date().toISOString();
  const choices = Array.isArray(partial.choices) ? partial.choices : [];

  return {
    id: String(partial.id || ""),
    chapter: Number(normalizeScenarioValue("chapter", partial.chapter)),
    title: String(normalizeScenarioValue("title", partial.title)),
    context: String(normalizeScenarioValue("context", partial.context)),
    tags: (partial.tags as ScenarioRow["tags"]) || null,
    choices: choices as ScenarioChoice[],
    is_published: Boolean(normalizeScenarioValue("is_published", partial.is_published ?? true)),
    created_at: String(normalizeScenarioValue("created_at", partial.created_at) || now),
    updated_at: String(normalizeScenarioValue("updated_at", partial.updated_at) || partial.created_at || now),
  };
}

function rowToValues(row: ScenarioRow) {
  return [
    row.id,
    String(row.chapter),
    row.title,
    row.context,
    JSON.stringify(row.tags || null),
    JSON.stringify(row.choices || []),
    String(row.is_published),
    row.created_at,
    row.updated_at,
  ];
}

function valuesToRow(values: string[]): ScenarioRow {
  return buildScenarioRow({
    id: String(normalizeScenarioValue("id", values[0] ?? "")),
    chapter: Number(normalizeScenarioValue("chapter", values[1] ?? 0)),
    title: String(normalizeScenarioValue("title", values[2] ?? "")),
    context: String(normalizeScenarioValue("context", values[3] ?? "")),
    tags: normalizeScenarioValue("tags_json", values[4] ?? "") as ScenarioRow["tags"],
    choices: (normalizeScenarioValue("choices_json", values[5] ?? "") as ScenarioChoice[]) || [],
    is_published: Boolean(normalizeScenarioValue("is_published", values[6] ?? "true")),
    created_at: String(normalizeScenarioValue("created_at", values[7] ?? "") || new Date().toISOString()),
    updated_at: String(normalizeScenarioValue("updated_at", values[8] ?? "") || values[7] || new Date().toISOString()),
  });
}

export async function listScenarioRows(): Promise<ScenarioRowWithIndex[]> {
  await ensureScenarioSheet();
  const sheets = createSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${DEFAULT_SHEET_NAME}!A2:I`,
  });

  const rows = response.data.values || [];

  return rows
    .map((row, index) => ({
      rowIndex: index + 2,
      row: valuesToRow(row),
    }))
    .filter(({ row }) => row.id);
}

export async function clearScenarioRows() {
  await ensureScenarioSheet();
  const sheets = createSheetsClient();

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${DEFAULT_SHEET_NAME}!A2:I`,
  });
}

export async function replaceScenarioRows(rows: Partial<ScenarioRow>[]) {
  await ensureScenarioSheet();
  const sheets = createSheetsClient();
  const nextRows = rows.map((row) => rowToValues(buildScenarioRow(row)));

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${DEFAULT_SHEET_NAME}!A2:I`,
  });

  if (nextRows.length === 0) {
    return [];
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${DEFAULT_SHEET_NAME}!A2:I${nextRows.length + 1}`,
    valueInputOption: "RAW",
    requestBody: {
      values: nextRows,
    },
  });

  return nextRows.map((values) => valuesToRow(values));
}
