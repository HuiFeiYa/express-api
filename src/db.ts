import Database from "better-sqlite3";
import path from "node:path";

let _db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (_db) return _db;

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
  const count = db.prepare("SELECT COUNT(*) as c FROM tasks").get() as { c: number };
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

  _db = db;
  return db;
}
