import app from "./app";

// 本地开发入口：tsx watch 直接跑，Express 真正监听 TCP
// 数据库用 better-sqlite3（首次启动自动建表 + 示例数据）
const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`[express-api] 本地开发服务器已启动: http://localhost:${PORT}`);
  console.log("[express-api] 访问根路径查看 API 列表: GET /");
  console.log("[express-api] tasks CRUD: GET/POST /api/tasks, GET/PATCH/DELETE /api/tasks/:id");
});
