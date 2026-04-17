import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { logger } from "hono/logger";
const app = new Hono().basePath("/api").use(logger());

app.use(
  "/auth/*",
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.on(["GET", "POST"], "/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

(globalThis as any).app = app;

export default app;

