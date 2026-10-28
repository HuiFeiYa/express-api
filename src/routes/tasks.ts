import {
  Router,
  Request,
  Response,
  NextFunction,
  type RequestHandler,
} from "express";
import { z } from "zod";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  toDto,
} from "../schema";
import type { TasksRepo } from "../repo/types";

const router = Router();

function getRepo(req: Request): TasksRepo {
  return req.app.get("repo") as TasksRepo;
}

// Express 4 不会自动捕获 async handler 的 rejection，需要包一层交给错误中间件
function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

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
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await getRepo(req).list();
    res.json(rows.map(toDto));
  }),
);

// POST /api/tasks - 创建
router.post(
  "/",
  validateBody(CreateTaskSchema),
  asyncHandler(async (req, res) => {
    const { name, description, completed } = req.body;
    const row = await getRepo(req).create({
      name,
      description: description ?? null,
      completed: completed ?? false,
    });
    res.status(201).json(toDto(row));
  }),
);

// GET /api/tasks/:id - 详情
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "无效的 id" });
      return;
    }
    const row = await getRepo(req).get(id);
    if (!row) {
      res.status(404).json({ error: "任务不存在" });
      return;
    }
    res.json(toDto(row));
  }),
);

// PATCH /api/tasks/:id - 更新
router.patch(
  "/:id",
  validateBody(UpdateTaskSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "无效的 id" });
      return;
    }

    const repo = getRepo(req);
    const existing = await repo.get(id);
    if (!existing) {
      res.status(404).json({ error: "任务不存在" });
      return;
    }

    const merged = { ...toDto(existing), ...req.body };
    const row = await repo.update(id, {
      name: merged.name,
      description: merged.description ?? null,
      completed: merged.completed,
    });
    if (!row) {
      res.status(404).json({ error: "任务不存在" });
      return;
    }
    res.json(toDto(row));
  }),
);

// DELETE /api/tasks/:id - 删除
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "无效的 id" });
      return;
    }
    const ok = await getRepo(req).remove(id);
    if (!ok) {
      res.status(404).json({ error: "任务不存在" });
      return;
    }
    res.status(204).end();
  }),
);

export default router;
