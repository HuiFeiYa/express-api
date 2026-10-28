import express, { Request, Response } from "express";
import cors from "cors";
import tasksRouter from "./routes/tasks";
import type { TasksRepo } from "./repo/types";

export function createApp(repo: TasksRepo) {
  const app = express();

  // 把具体的数据访问实现注入给路由（Workers=D1 / 本地=better-sqlite3）
  app.set("repo", repo);

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_req: Request, res: Response) => {
    res.json({
      name: "express-api",
      version: "0.1.0",
      health: "ok",
      endpoints: [
        { method: "GET", path: "/api/tasks" },
        { method: "POST", path: "/api/tasks" },
        { method: "GET", path: "/api/tasks/:id" },
        { method: "PATCH", path: "/api/tasks/:id" },
        { method: "DELETE", path: "/api/tasks/:id" },
      ],
    });
  });

  app.use("/api/tasks", tasksRouter);

  // 404
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not Found" });
  });

  // 全局错误处理
  app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
    console.error("[error]", err);
    const status =
      typeof (err as { status?: unknown }).status === "number"
        ? ((err as { status: number }).status as number)
        : 500;
    res.status(status).json({
      error: status >= 500 ? "Internal Server Error" : err.message,
    });
  });

  return app;
}
