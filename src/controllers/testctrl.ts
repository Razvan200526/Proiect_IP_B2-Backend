import { Hono } from "hono";

export const testController = new Hono().get("/test", (c) => {
	return c.json("Test endpoint");
});
