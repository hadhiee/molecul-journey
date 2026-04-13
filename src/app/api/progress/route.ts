import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeProgressOperation, getMatchingProgressRows } from "@/lib/user-progress/operations";
import type { ProgressFilter, ProgressOperation, ProgressRow } from "@/lib/user-progress/types";

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "hadhiee@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function hasUserEmailMismatch(filters: ProgressFilter[] = [], currentUserEmail: string) {
  return filters.some((filter) => {
    if (filter.field !== "user_email") {
      return false;
    }

    if (filter.op === "eq") {
      return normalizeEmail(filter.value) !== currentUserEmail;
    }

    return filter.value.some((value) => normalizeEmail(value) !== currentUserEmail);
  });
}

function ensurePayloadOwnership(payload: ProgressOperation["payload"], currentUserEmail: string, isAdmin: boolean) {
  const items = Array.isArray(payload) ? payload : payload ? [payload] : [];

  return items.map((item) => {
    const nextItem = { ...item };
    const payloadEmail = normalizeEmail(nextItem.user_email);

    if (!isAdmin && payloadEmail && payloadEmail !== currentUserEmail) {
      throw new Error("Forbidden");
    }

    if (!payloadEmail) {
      nextItem.user_email = currentUserEmail;
    } else if (!isAdmin) {
      nextItem.user_email = currentUserEmail;
    }

    return nextItem;
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserEmail = normalizeEmail(session?.user?.email);

    if (!currentUserEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = ADMIN_EMAILS.has(currentUserEmail);
    const operation = (await req.json()) as ProgressOperation;

    if (!isAdmin && hasUserEmailMismatch(operation.filters, currentUserEmail)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (operation.action === "select") {
      const nextOperation = {
        ...operation,
        filters: isAdmin
          ? operation.filters
          : [...(operation.filters || []), { field: "user_email", op: "eq", value: currentUserEmail } satisfies ProgressFilter],
      };

      const result = await executeProgressOperation(nextOperation);
      return NextResponse.json(result);
    }

    if (operation.action === "insert" || operation.action === "upsert") {
      const payloads = ensurePayloadOwnership(operation.payload, currentUserEmail, isAdmin);
      const nextOperation = {
        ...operation,
        payload: Array.isArray(operation.payload) ? payloads : payloads[0] || null,
      };

      const result = await executeProgressOperation(nextOperation);
      return NextResponse.json(result);
    }

    const targetRows = await getMatchingProgressRows(operation.filters);

    if (!isAdmin && targetRows.some((row) => normalizeEmail(row.user_email) !== currentUserEmail)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let nextOperation = operation;
    if (operation.action === "update") {
      const payloads = ensurePayloadOwnership(operation.payload, currentUserEmail, isAdmin);
      nextOperation = {
        ...operation,
        payload: Array.isArray(operation.payload) ? payloads[0] : payloads[0] || null,
      };
    }

    const result = await executeProgressOperation(nextOperation);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown progress API error";
    const status = message === "Forbidden" ? 403 : 500;
    console.error("Progress API error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
