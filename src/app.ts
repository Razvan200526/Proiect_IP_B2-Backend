import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { logger } from "hono/logger";
import type { Context, Next } from "hono";
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

app.on(["GET", "POST"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

export const requireAuth = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};

(globalThis as any).app = app;

export default app;

