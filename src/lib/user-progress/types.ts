export type ProgressField = "id" | "user_email" | "mission_id" | "score" | "choice_label" | "created_at" | "updated_at";

export type ProgressRow = {
  id: string;
  user_email: string;
  mission_id: string | null;
  score: number;
  choice_label: string | null;
  created_at: string;
  updated_at: string;
};

export type ProgressRowWithIndex = {
  rowIndex: number;
  row: ProgressRow;
};

export type ProgressFilter =
  | { field: string; op: "eq"; value: unknown }
  | { field: string; op: "in"; value: unknown[] };

export type ProgressOrder = {
  field: string;
  ascending: boolean;
};

export type ProgressRange = {
  from: number;
  to: number;
};

export type ProgressOperation = {
  action: "select" | "insert" | "update" | "delete" | "upsert";
  fields?: string;
  filters?: ProgressFilter[];
  order?: ProgressOrder;
  range?: ProgressRange;
  limit?: number;
  maybeSingle?: boolean;
  payload?: Partial<ProgressRow> | Partial<ProgressRow>[];
  options?: {
    onConflict?: string;
  };
};

export type ProgressOperationResult<T = unknown> = {
  data: T;
  error: { message: string } | null;
};
