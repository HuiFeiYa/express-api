import express, { Request, Response } from "express";
import cors from "cors";
import tasksRouter from "./routes/tasks";

const app = express();

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
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
