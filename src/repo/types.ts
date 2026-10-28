// 数据库表的原始行（SQLite 中 completed 用 INTEGER 0/1 表示）
export interface TaskRecord {
  id: number;
  name: string;
  description: string | null;
  completed: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  name: string;
  description?: string | null;
  completed: boolean;
}

export interface UpdateTaskInput {
  name: string;
  description: string | null;
  completed: boolean;
}

// 统一的数据访问接口：
// - Workers 运行时由 D1 实现（repo/d1.ts）
// - 纯 Node 本地开发由 better-sqlite3 实现（repo/local.ts，仅 dev:local 使用）
export interface TasksRepo {
  list(): Promise<TaskRecord[]>;
  create(input: CreateTaskInput): Promise<TaskRecord>;
  get(id: number): Promise<TaskRecord | null>;
  update(id: number, input: UpdateTaskInput): Promise<TaskRecord | null>;
  remove(id: number): Promise<boolean>;
}
