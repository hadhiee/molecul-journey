import type { ProgressFilter, ProgressOperation, ProgressOperationResult } from "@/lib/user-progress/types";
import type { ScenarioFilter, ScenarioOperation, ScenarioOperationResult } from "@/lib/scenarios/types";

type SupportedTable = "user_progress" | "scenarios";

class SheetsQueryBuilder implements PromiseLike<any> {
  private readonly table: SupportedTable;
  private operation: ProgressOperation | ScenarioOperation;

  constructor(table: SupportedTable) {
    this.table = table;
    this.operation =
      table === "user_progress"
        ? {
            action: "select",
            filters: [],
          }
        : {
            action: "select",
            filters: [],
          };
  }

  select(fields = "*") {
    this.operation.fields = fields;
    return this;
  }

  insert(payload: ProgressOperation["payload"]) {
    if (this.table !== "user_progress") {
      throw new Error(`Insert is not supported for ${this.table}.`);
    }

    this.operation = {
      ...(this.operation as ProgressOperation),
      action: "insert",
      payload,
    };
    return this;
  }

  update(payload: ProgressOperation["payload"]) {
    if (this.table !== "user_progress") {
      throw new Error(`Update is not supported for ${this.table}.`);
    }

    this.operation = {
      ...(this.operation as ProgressOperation),
      action: "update",
      payload,
    };
    return this;
  }

  upsert(payload: ProgressOperation["payload"], options?: ProgressOperation["options"]) {
    if (this.table !== "user_progress") {
      throw new Error(`Upsert is not supported for ${this.table}.`);
    }

    this.operation = {
      ...(this.operation as ProgressOperation),
      action: "upsert",
      payload,
      options,
    };
    return this;
  }

  delete() {
    if (this.table !== "user_progress") {
      throw new Error(`Delete is not supported for ${this.table}.`);
    }

    this.operation = {
      ...(this.operation as ProgressOperation),
      action: "delete",
    };
    return this;
  }

  eq(field: string, value: unknown) {
    const filter =
      this.table === "user_progress"
        ? ({ field, op: "eq", value } satisfies ProgressFilter)
        : ({ field, op: "eq", value } satisfies ScenarioFilter);

    this.operation.filters = [...(this.operation.filters || []), filter];
    return this;
  }

  in(field: string, value: unknown[]) {
    const filter =
      this.table === "user_progress"
        ? ({ field, op: "in", value } satisfies ProgressFilter)
        : ({ field, op: "in", value } satisfies ScenarioFilter);

    this.operation.filters = [...(this.operation.filters || []), filter];
    return this;
  }

  like(field: string, value: string) {
    if (this.table !== "user_progress") {
      throw new Error(`Like is not supported for ${this.table}.`);
    }

    this.operation.filters = [
      ...(this.operation.filters || []),
      { field, op: "like", value } satisfies ProgressFilter,
    ];
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.operation.order = {
      field,
      ascending: options?.ascending ?? true,
    };
    return this;
  }

  range(from: number, to: number) {
    this.operation.range = { from, to };
    return this;
  }

  limit(limit: number) {
    this.operation.limit = limit;
    return this;
  }

  maybeSingle() {
    this.operation.maybeSingle = true;
    return this;
  }

  single() {
    this.operation.maybeSingle = true;
    if (this.table === "scenarios") {
      (this.operation as ScenarioOperation).single = true;
    }
    return this;
  }

  async execute() {
    if (this.table === "user_progress") {
      return this.executeProgress();
    }

    return this.executeScenarios();
  }

  private async executeProgress() {
    const operation = this.operation as ProgressOperation;

    if (typeof window === "undefined") {
      const { executeProgressOperation } = await import("@/lib/user-progress/operations");
      return executeProgressOperation(operation);
    }

    const response = await fetch("/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(operation),
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: json.error || "Progress request failed",
        },
      } satisfies ProgressOperationResult;
    }

    return json satisfies ProgressOperationResult;
  }

  private async executeScenarios() {
    const operation = this.operation as ScenarioOperation;

    if (typeof window === "undefined") {
      const { executeScenarioOperation } = await import("@/lib/scenarios/operations");
      return executeScenarioOperation(operation);
    }

    const response = await fetch("/api/scenarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(operation),
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: json.error || "Scenarios request failed",
        },
      } satisfies ScenarioOperationResult;
    }

    return json satisfies ScenarioOperationResult;
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled || undefined, onrejected || undefined);
  }
}

export const supabase: any = {
  from(table: string) {
    if (table === "user_progress" || table === "scenarios") {
      return new SheetsQueryBuilder(table);
    }

    throw new Error(`Table "${table}" is no longer backed by Supabase.`);
  },
} as const;
