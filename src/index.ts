import { httpServerHandler } from "cloudflare:node";
import { createApp } from "./app";
import { d1TasksRepo } from "./repo/d1";

// Workers 入口：数据访问走 D1 绑定（env.DB，见 wrangler.jsonc 与 repo/d1.ts）。
// app.listen(3000) 不真正监听 TCP，只是把 server 注册到 Worker 内部路由表。
const app = createApp(d1TasksRepo);
app.listen(3000);

export default httpServerHandler({ port: 3000 });
