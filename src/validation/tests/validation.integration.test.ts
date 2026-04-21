import { describe, expect, it } from "bun:test";
import { Hono } from "hono";

import { validationMiddleware } from "../middleware/validationMiddleware";

const validPayload = {
	title: "Need transport support",
	description: "I need a ride to the clinic tomorrow morning.",
	urgency: "HIGH",
	status: "OPEN",
	anonymousMode: false,
	category: "Transport",
	requestDetails: {
		notes: "Pickup at the main entrance.",
		languageNeeded: "Romanian",
		safetyNotes: "Wheelchair assistance needed.",
	},
};

const createApp = (): Hono => {
	const app = new Hono();

	app.use("*", validationMiddleware).post("/help", () =>
		Response.json({
			id: "req_123",
			received: true,
		}),
	);

	return app;
};

describe("validation middleware integration", () => {
	it("stops invalid requests with 400 and a safe error list", async () => {
		const app = createApp();

		const response = await app.request("http://localhost/help", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title: "",
				description: "",
				requestDetails: null,
			}),
		});

		const payload = await response.json();

		expect(response.status).toBe(400);
		expect(payload.errors).toBeArray();
		expect(payload.errors.length).toBeGreaterThan(1);
		for (const error of payload.errors) {
			expect(error.field).toBeString();
			expect(error.message).toBeString();
		}
		expect(payload.stack).toBeUndefined();
		expect(payload.message).toBeUndefined();
		expect(payload.ok).toBeUndefined();
		expect(payload.status).toBeUndefined();
	});

	it("lets valid requests reach the handler without wrapping the response", async () => {
		const app = createApp();

		const response = await app.request("http://localhost/help", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(validPayload),
		});

		const payload = await response.json();

		expect(response.status).toBe(200);
		expect(payload).toEqual({
			id: "req_123",
			received: true,
		});
		expect(payload.ok).toBeUndefined();
		expect(payload.status).toBeUndefined();
		expect(payload.body).toBeUndefined();
	});
});
