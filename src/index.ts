import { httpServerHandler } from "cloudflare:node";
import app from "./app";

// 说明：
// 1. Workers 上 better-sqlite3 有原生 .node 模块，跑不通
//    → 部署时把 db.ts 换成 Cloudflare D1 绑定（env.DB.prepare(...)）
//    → 当前 MVP 阶段先在本地用 dev:local（better-sqlite3）
// 2. app.listen(3000) 不真正监听 TCP，只是把 server 注册到 Worker 内部路由表
app.listen(3000);

export default httpServerHandler({ port: 3000 });
