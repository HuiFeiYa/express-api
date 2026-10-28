-- Cloudflare D1 数据库结构（与本地 better-sqlite3 保持一致）
-- 本地初始化：wrangler d1 execute express-api-db --local --file=./schema.sql
-- 线上初始化：wrangler d1 execute express-api-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  description TEXT,
  completed   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 仅空表时插入示例数据（重复执行也不会重复插入）
INSERT INTO tasks (name, description)
SELECT '买牛奶', '下班路过超市'
WHERE NOT EXISTS (SELECT 1 FROM tasks);

INSERT INTO tasks (name, description)
SELECT '写 Express API', 'MVP 骨架'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE name = '写 Express API');

INSERT INTO tasks (name, description)
SELECT '部署到 Cloudflare', 'D1 + Workers'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE name = '部署到 Cloudflare');
