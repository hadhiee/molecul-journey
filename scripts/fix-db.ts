import { google } from "googleapis";
import * as dotenv from "dotenv";
import { SYSTEM_IDS } from "../src/lib/ids";

dotenv.config({ path: ".env.local" });

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEETS_SCENARIOS_TAB || "scenarios";
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL!;
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

async function ensureHeader(sheets: ReturnType<typeof createSheetsClient>) {
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:I1`,
        valueInputOption: "RAW",
        requestBody: {
            values: [HEADERS],
        },
    });
}

async function fix() {
    console.log("Ensuring system scenarios exist in Google Sheets...");
    const sheets = createSheetsClient();
    await ensureHeader(sheets);

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:I`,
    });

    const rows = response.data.values || [];
    const rowMap = new Map(rows.map((row, index) => [row[0], index + 2]));
    const now = new Date().toISOString();

    for (const [key, uuid] of Object.entries(SYSTEM_IDS)) {
        const values = [[
            uuid,
            "0",
            `System Event: ${key}`,
            "System Generated",
            JSON.stringify([]),
            JSON.stringify([]),
            "true",
            now,
            now,
        ]];

        const existingRowIndex = rowMap.get(uuid);
        if (existingRowIndex) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A${existingRowIndex}:I${existingRowIndex}`,
                valueInputOption: "RAW",
                requestBody: { values },
            });
            console.log(`Updated ${key}.`);
            continue;
        }

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:I`,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values },
        });
        console.log(`Inserted ${key}.`);
    }
}

fix().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
