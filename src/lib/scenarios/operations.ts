import { listScenarioRows } from "./server";
import type {
  ScenarioFilter,
  ScenarioOperation,
  ScenarioOperationResult,
  ScenarioOrder,
  ScenarioRange,
  ScenarioRow,
  ScenarioRowWithIndex,
} from "./types";

function normalizeForCompare(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value == null) {
    return null;
  }

  const asNumber = Number(value);
  if (!Number.isNaN(asNumber) && String(value).trim() !== "") {
    return asNumber;
  }

  return String(value).trim().toLowerCase();
}

function matchesFilter(row: ScenarioRow, filter: ScenarioFilter) {
  const value = (row as Record<string, unknown>)[filter.field];

  if (filter.op === "eq") {
    return normalizeForCompare(value) === normalizeForCompare(filter.value);
  }

  return filter.value.some((item) => normalizeForCompare(item) === normalizeForCompare(value));
}

function applyFilters(rows: ScenarioRowWithIndex[], filters: ScenarioFilter[] = []) {
  return rows.filter(({ row }) => filters.every((filter) => matchesFilter(row, filter)));
}

function applyOrder(rows: ScenarioRowWithIndex[], order?: ScenarioOrder) {
  if (!order) {
    return rows;
  }

  return [...rows].sort((left, right) => {
    const leftValue = normalizeForCompare((left.row as Record<string, unknown>)[order.field]);
    const rightValue = normalizeForCompare((right.row as Record<string, unknown>)[order.field]);

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

function applyRange(rows: ScenarioRowWithIndex[], range?: ScenarioRange, limit?: number) {
  let nextRows = rows;

  if (range) {
    nextRows = nextRows.slice(range.from, range.to + 1);
  }

  if (typeof limit === "number") {
    nextRows = nextRows.slice(0, limit);
  }

  return nextRows;
}

function result<T>(data: T): ScenarioOperationResult<T> {
  return { data, error: null };
}

export async function executeScenarioOperation(operation: ScenarioOperation): Promise<ScenarioOperationResult> {
  const selectedRows = applyRange(
    applyOrder(applyFilters(await listScenarioRows(), operation.filters), operation.order),
    operation.range,
    operation.limit,
  ).map((entry) => entry.row);

  if (operation.single) {
    if (!selectedRows[0]) {
      return { data: null, error: { message: "Expected a single scenario row" } };
    }

    return result(selectedRows[0]);
  }

  if (operation.maybeSingle) {
    return result(selectedRows[0] || null);
  }

  return result(selectedRows);
}
