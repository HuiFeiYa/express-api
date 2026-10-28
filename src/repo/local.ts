import Database from "better-sqlite3";
import path from "node:path";
import type {
  CreateTaskInput,
  TaskRecord,
  TasksRepo,
  UpdateTaskInput,
} from "./types";

// 仅用于 npm run dev:local（纯 Node 环境）。
// 该文件通过静态 import 引入 better-sqlite3 原生模块，
// Workers 入口（src/index.ts）不要引用本文件，否则会被打进 Worker 包。
export function createLocalTasksRepo(): TasksRepo {
  const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), "local.db");
  const db = new Database(dbPath);

  // 初始化表结构
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT,
      completed   INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 插入一点示例数据（仅空表时）
  const count = db.prepare("SELECT COUNT(*) as c FROM tasks").get() as {
    c: number;
  };
  if (count.c === 0) {
    const insert = db.prepare(
      "INSERT INTO tasks (name, description) VALUES (?, ?)",
    );
    const tx = db.transaction((rows: [string, string][]) => {
      for (const row of rows) insert.run(...row);
    });
    tx([
      ["买牛奶", "下班路过超市"],
      ["写 Express API", "MVP 骨架"],
      ["部署到 Cloudflare", "D1 + Workers"],
    ]);
  }

  return {
    async list(): Promise<TaskRecord[]> {
      return db
        .prepare("SELECT * FROM tasks ORDER BY id DESC")
        .all() as TaskRecord[];
    },

    async create(input: CreateTaskInput): Promise<TaskRecord> {
      const info = db
        .prepare(
          "INSERT INTO tasks (name, description, completed) VALUES (?, ?, ?)",
        )
        .run(input.name, input.description ?? null, input.completed ? 1 : 0);
      return db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(info.lastInsertRowid) as TaskRecord;
    },

    async get(id: number): Promise<TaskRecord | null> {
      return (
        (db
          .prepare("SELECT * FROM tasks WHERE id = ?")
          .get(id) as TaskRecord | undefined) ?? null
      );
    },

    async update(
      id: number,
      input: UpdateTaskInput,
    ): Promise<TaskRecord | null> {
      const result = db
        .prepare(
          "UPDATE tasks SET name = ?, description = ?, completed = ?, updated_at = datetime('now') WHERE id = ?",
        )
        .run(input.name, input.description, input.completed ? 1 : 0, id);
      if (result.changes === 0) return null;
      return db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(id) as TaskRecord;
    },

    async remove(id: number): Promise<boolean> {
      return db.prepare("DELETE FROM tasks WHERE id = ?").run(id).changes > 0;
    },
  };
}
