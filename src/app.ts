import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono().basePath("/api").use(logger());

(globalThis as any).app = app;

app.get("/", (c) => {
	return c.text("OK");
});

export default app;