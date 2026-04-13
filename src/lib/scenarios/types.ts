export type ScenarioChoice = {
  id: string;
  label: string;
  feedback: string;
  impact?: Record<string, unknown>;
};

export type ScenarioRow = {
  id: string;
  chapter: number;
  title: string;
  context: string;
  tags: Record<string, unknown> | unknown[] | null;
  choices: ScenarioChoice[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ScenarioRowWithIndex = {
  rowIndex: number;
  row: ScenarioRow;
};

export type ScenarioFilter =
  | { field: string; op: "eq"; value: unknown }
  | { field: string; op: "in"; value: unknown[] };

export type ScenarioOrder = {
  field: string;
  ascending: boolean;
};

export type ScenarioRange = {
  from: number;
  to: number;
};

export type ScenarioOperation = {
  action: "select";
  fields?: string;
  filters?: ScenarioFilter[];
  order?: ScenarioOrder;
  range?: ScenarioRange;
  limit?: number;
  maybeSingle?: boolean;
  single?: boolean;
};

export type ScenarioOperationResult<T = unknown> = {
  data: T;
  error: { message: string } | null;
};
