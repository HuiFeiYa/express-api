import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getDb } from "../db";
import { CreateTaskSchema, UpdateTaskSchema, toDto, type TaskRow } from "../schema";

const router = Router();

// Zod 校验中间件
function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "参数校验失败",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

// GET /api/tasks - 列表
router.get("/", (_req, res) => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM tasks ORDER BY id DESC").all() as TaskRow[];
  res.json(rows.map(toDto));
});

// POST /api/tasks - 创建
router.post("/", validateBody(CreateTaskSchema), (req, res) => {
  const db = getDb();
  const { name, description, completed } = req.body;
  const info = db
    .prepare(
      "INSERT INTO tasks (name, description, completed) VALUES (?, ?, ?)",
    )
    .run(name, description ?? null, completed ? 1 : 0);

  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(info.lastInsertRowid) as TaskRow;
  res.status(201).json(toDto(row));
});

// GET /api/tasks/:id - 详情
router.get("/:id", (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "无效的 id" });
    return;
  }
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow | undefined;
  if (!row) {
    res.status(404).json({ error: "任务不存在" });
    return;
  }
  res.json(toDto(row));
});

// PATCH /api/tasks/:id - 更新
router.patch("/:id", validateBody(UpdateTaskSchema), (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "无效的 id" });
    return;
  }

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow | undefined;
  if (!existing) {
    res.status(404).json({ error: "任务不存在" });
    return;
  }

  const merged = { ...toDto(existing), ...req.body };
  db.prepare(
    "UPDATE tasks SET name = ?, description = ?, completed = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(merged.name, merged.description ?? null, merged.completed ? 1 : 0, id);

  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow;
  res.json(toDto(row));
});

// DELETE /api/tasks/:id - 删除
router.delete("/:id", (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "无效的 id" });
    return;
  }
  const info = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  if (info.changes === 0) {
    res.status(404).json({ error: "任务不存在" });
    return;
  }
  res.status(204).end();
});

export default router;
