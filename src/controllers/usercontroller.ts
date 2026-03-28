import { Hono } from "hono";

export const userController = new Hono()
	.get("/", (c) => {
		return c.text("User Controller");
	})
	.post("/", (c) => {
		return c.text("Create User");
	})
	.get("/:id", (c) => {
		const id = c.req.param("id");
		return c.text(`Get User with ID: ${id}`);
	})
	.put("/:id", (c) => {
		const id = c.req.param("id");
		return c.text(`Update User with ID: ${id}`);
	})
	.delete("/:id", (c) => {
		const id = c.req.param("id");
		return c.text(`Delete User with ID: ${id}`);
	});
