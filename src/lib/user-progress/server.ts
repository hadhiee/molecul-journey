import { google } from "googleapis";
import type { ProgressRow, ProgressRowWithIndex } from "./types";

const PROGRESS_HEADERS = [
  "id",
  "user_email",
  "mission_id",
  "score",
  "choice_label",
  "created_at",
  "updated_at",
] as const;

const DEFAULT_SHEET_NAME = process.env.GOOGLE_SHEETS_PROGRESS_TAB || "user_progress";
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

async function ensureProgressSheet() {
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
        range: `${DEFAULT_SHEET_NAME}!A1:G1`,
      });

      const currentHeaders = headerRow.data.values?.[0] || [];
      const needsHeader =
        currentHeaders.length !== PROGRESS_HEADERS.length ||
        PROGRESS_HEADERS.some((header, index) => currentHeaders[index] !== header);

      if (needsHeader) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${DEFAULT_SHEET_NAME}!A1:G1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [Array.from(PROGRESS_HEADERS)],
          },
        });
      }
    })();
  }

  return ensurePromise;
}

function normalizeValue(field: string, value: unknown) {
  if (value == null || value === "") {
    if (field === "score") {
      return 0;
    }

    return null;
  }

  if (field === "score") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (field === "user_email") {
    return String(value).toLowerCase().trim();
  }

  return String(value);
}

function buildRow(partial: Partial<ProgressRow>): ProgressRow {
  const now = new Date().toISOString();

  return {
    id: String(partial.id || crypto.randomUUID()),
    user_email: String(normalizeValue("user_email", partial.user_email) || ""),
    mission_id: (normalizeValue("mission_id", partial.mission_id) as string | null) || null,
    score: Number(normalizeValue("score", partial.score) || 0),
    choice_label: (normalizeValue("choice_label", partial.choice_label) as string | null) || null,
    created_at: String(normalizeValue("created_at", partial.created_at) || now),
    updated_at: String(normalizeValue("updated_at", partial.updated_at) || partial.created_at || now),
  };
}

function rowToValues(row: ProgressRow) {
  return PROGRESS_HEADERS.map((header) => {
    const value = row[header];
    return value == null ? "" : String(value);
  });
}

function valuesToRow(values: string[]): ProgressRow {
  const row: Record<string, unknown> = {};

  PROGRESS_HEADERS.forEach((header, index) => {
    row[header] = normalizeValue(header, values[index] ?? "");
  });

  return buildRow(row as Partial<ProgressRow>);
}

export async function listProgressRows(): Promise<ProgressRowWithIndex[]> {
  await ensureProgressSheet();
  const sheets = createSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${DEFAULT_SHEET_NAME}!A2:G`,
  });

  const rows = response.data.values || [];

  return rows.map((row, index) => ({
    rowIndex: index + 2,
    row: valuesToRow(row),
  }));
}

export async function getProgressRowById(id: string) {
  const rows = await listProgressRows();
  return rows.find((entry) => entry.row.id === String(id)) || null;
}

export async function appendProgressRow(payload: Partial<ProgressRow>) {
  await ensureProgressSheet();
  const sheets = createSheetsClient();
  const row = buildRow(payload);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${DEFAULT_SHEET_NAME}!A:G`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [rowToValues(row)],
    },
  });

  return row;
}

export async function updateProgressRowById(id: string, patch: Partial<ProgressRow>) {
  await ensureProgressSheet();
  const sheets = createSheetsClient();
  const existing = await getProgressRowById(id);

  if (!existing) {
    return null;
  }

  const nextRow = buildRow({
    ...existing.row,
    ...patch,
    id: existing.row.id,
    created_at: existing.row.created_at,
    updated_at: patch.updated_at || new Date().toISOString(),
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${DEFAULT_SHEET_NAME}!A${existing.rowIndex}:G${existing.rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [rowToValues(nextRow)],
    },
  });

  return nextRow;
}

export async function deleteProgressRowById(id: string) {
  await ensureProgressSheet();
  const sheets = createSheetsClient();
  const existing = await getProgressRowById(id);

  if (!existing) {
    return null;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: await getSheetId(),
              dimension: "ROWS",
              startIndex: existing.rowIndex - 1,
              endIndex: existing.rowIndex,
            },
          },
        },
      ],
    },
  });

  return existing.row;
}

async function getSheetId() {
  await ensureProgressSheet();
  const sheets = createSheetsClient();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const match = spreadsheet.data.sheets?.find((sheet) => sheet.properties?.title === DEFAULT_SHEET_NAME);
  const sheetId = match?.properties?.sheetId;

  if (sheetId == null) {
    throw new Error(`Sheet "${DEFAULT_SHEET_NAME}" was not found.`);
  }

  return sheetId;
}

export async function upsertProgressRow(
  payload: Partial<ProgressRow>,
  onConflictFields: string[] = ["id"],
) {
  const rows = await listProgressRows();
  const conflict = rows.find(({ row }) =>
    onConflictFields.every((field) => {
      const rowValue = (row as Record<string, unknown>)[field];
      const payloadValue = (payload as Record<string, unknown>)[field];
      return normalizeValue(field, rowValue) === normalizeValue(field, payloadValue);
    }),
  );

  if (!conflict) {
    return appendProgressRow(payload);
  }

  return updateProgressRowById(conflict.row.id, {
    ...payload,
    id: conflict.row.id,
    created_at: conflict.row.created_at,
    updated_at: payload.updated_at || new Date().toISOString(),
  });
}
