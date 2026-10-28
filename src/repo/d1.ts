import { env } from "cloudflare:workers";
import type {
  CreateTaskInput,
  TaskRecord,
  TasksRepo,
  UpdateTaskInput,
} from "./types";

// 仅在请求处理过程中访问绑定，env 是 Workers 提供的按请求代理对象
function db() {
  return env.DB;
}

async function list(): Promise<TaskRecord[]> {
  const { results } = await db()
    .prepare("SELECT * FROM tasks ORDER BY id DESC")
    .all<TaskRecord>();
  return results ?? [];
}

async function get(id: number): Promise<TaskRecord | null> {
  return db().prepare("SELECT * FROM tasks WHERE id = ?").bind(id).first<TaskRecord>();
}

async function create(input: CreateTaskInput): Promise<TaskRecord> {
  const result = await db()
    .prepare("INSERT INTO tasks (name, description, completed) VALUES (?, ?, ?)")
    .bind(input.name, input.description ?? null, input.completed ? 1 : 0)
    .run();

  const id = Number(result.meta.last_row_id);
  const row = await get(id);
  if (!row) throw new Error(`创建任务失败：未查询到 id=${id} 的记录`);
  return row;
}

async function update(
  id: number,
  input: UpdateTaskInput,
): Promise<TaskRecord | null> {
  const result = await db()
    .prepare(
      "UPDATE tasks SET name = ?, description = ?, completed = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .bind(input.name, input.description, input.completed ? 1 : 0, id)
    .run();

  if (Number(result.meta.changes) === 0) return null;
  return get(id);
}

async function remove(id: number): Promise<boolean> {
  const result = await db()
    .prepare("DELETE FROM tasks WHERE id = ?")
    .bind(id)
    .run();
  return Number(result.meta.changes) > 0;
}

export const d1TasksRepo: TasksRepo = { list, create, get, update, remove };
