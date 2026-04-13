import {
  appendProgressRow,
  deleteProgressRowById,
  getProgressRowById,
  listProgressRows,
  updateProgressRowById,
  upsertProgressRow,
} from "./server";
import type {
  ProgressFilter,
  ProgressOperation,
  ProgressOperationResult,
  ProgressOrder,
  ProgressRange,
  ProgressRow,
  ProgressRowWithIndex,
} from "./types";

function normalizeForCompare(field: string, value: unknown) {
  if (value == null) {
    return null;
  }

  if (field === "score") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (field === "user_email" || field === "mission_id" || field === "choice_label" || field === "id") {
    return String(value).trim().toLowerCase();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return String(value).trim();
}

function matchesFilter(row: ProgressRow, filter: ProgressFilter) {
  const value = (row as Record<string, unknown>)[filter.field];

  if (filter.op === "eq") {
    return normalizeForCompare(filter.field, value) === normalizeForCompare(filter.field, filter.value);
  }

  if (filter.op === "in") {
    return filter.value.some((item) => normalizeForCompare(filter.field, item) === normalizeForCompare(filter.field, value));
  }

  const rowValue = normalizeForCompare(filter.field, value);
  const likePattern = String(filter.value || "")
    .trim()
    .toLowerCase()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/%/g, ".*")
    .replace(/_/g, ".");

  return new RegExp(`^${likePattern}$`, "i").test(String(rowValue || ""));
}

function applyFilters(rows: ProgressRowWithIndex[], filters: ProgressFilter[] = []) {
  return rows.filter(({ row }) => filters.every((filter) => matchesFilter(row, filter)));
}

function applyOrder(rows: ProgressRowWithIndex[], order?: ProgressOrder) {
  if (!order) {
    return rows;
  }

  return [...rows].sort((left, right) => {
    const leftValue = (left.row as Record<string, unknown>)[order.field];
    const rightValue = (right.row as Record<string, unknown>)[order.field];

    if (leftValue == null && rightValue == null) {
      return 0;
    }

    if (leftValue == null) {
      return order.ascending ? -1 : 1;
    }

    if (rightValue == null) {
      return order.ascending ? 1 : -1;
    }

    if (leftValue < rightValue) {
      return order.ascending ? -1 : 1;
    }

    if (leftValue > rightValue) {
      return order.ascending ? 1 : -1;
    }

    return 0;
  });
}

function applyRange(rows: ProgressRowWithIndex[], range?: ProgressRange, limit?: number) {
  let nextRows = rows;

  if (range) {
    nextRows = nextRows.slice(range.from, range.to + 1);
  }

  if (typeof limit === "number") {
    nextRows = nextRows.slice(0, limit);
  }

  return nextRows;
}

function result<T>(data: T): ProgressOperationResult<T> {
  return { data, error: null };
}

export async function executeProgressOperation(operation: ProgressOperation): Promise<ProgressOperationResult> {
  if (operation.action === "insert") {
    const payloads = Array.isArray(operation.payload) ? operation.payload : [operation.payload || {}];
    const inserted = [];

    for (const payload of payloads) {
      inserted.push(await appendProgressRow(payload));
    }

    return result(Array.isArray(operation.payload) ? inserted : inserted[0] || null);
  }

  if (operation.action === "upsert") {
    const payloads = Array.isArray(operation.payload) ? operation.payload : [operation.payload || {}];
    const onConflictFields = (operation.options?.onConflict || "id")
      .split(",")
      .map((field) => field.trim())
      .filter(Boolean);

    const upserted = [];
    for (const payload of payloads) {
      upserted.push(await upsertProgressRow(payload, onConflictFields));
    }

    return result(Array.isArray(operation.payload) ? upserted : upserted[0] || null);
  }

  if (operation.action === "update") {
    const rows = applyFilters(await listProgressRows(), operation.filters);
    const target = rows[0];
    const payload = Array.isArray(operation.payload) ? operation.payload[0] || {} : operation.payload || {};

    if (!target) {
      return result(null);
    }

    const updated = await updateProgressRowById(target.row.id, payload);
    return result(updated);
  }

  if (operation.action === "delete") {
    const rows = applyFilters(await listProgressRows(), operation.filters);
    const deleted = [];

    for (const entry of rows) {
      const row = await deleteProgressRowById(entry.row.id);
      if (row) {
        deleted.push(row);
      }
    }

    return result(deleted);
  }

  const selectedRows = applyRange(
    applyOrder(applyFilters(await listProgressRows(), operation.filters), operation.order),
    operation.range,
    operation.limit,
  ).map((entry) => entry.row);

  if (operation.maybeSingle) {
    return result(selectedRows[0] || null);
  }

  return result(selectedRows);
}

export async function canMutateProgressRows(filters: ProgressFilter[] = [], currentUserEmail: string) {
  const matches = applyFilters(await listProgressRows(), filters);
  return matches.every(({ row }) => row.user_email === currentUserEmail);
}

export async function getMatchingProgressRows(filters: ProgressFilter[] = []) {
  return applyFilters(await listProgressRows(), filters).map(({ row }) => row);
}

export async function getProgressRowOwnership(id: string) {
  const row = await getProgressRowById(id);
  return row?.row.user_email || null;
}
