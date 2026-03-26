import { Hono } from "hono";
import { logger } from "hono/logger";
import { registerValidation } from "./validation";

const app = new Hono().basePath("/api").use(logger());

(globalThis as any).app = app;

// 🔥 păstrezi validation-ul tău
registerValidation(app);

app.get("/", (c) => {
	return c.text("OK");
});

app.post("/help", async (c) => {
	const body = await c.req.json();

	return c.json({
		ok: true,
		body,
	});
});

export default app;