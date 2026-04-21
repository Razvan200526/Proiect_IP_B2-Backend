import { describe, expect, it } from "bun:test";
import { Hono } from "hono";

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

const createApp = async (): Promise<Hono> => {
	const app = new Hono().basePath("/api");
	(globalThis as { app?: Hono }).app = new Hono();
	const { HelpController } = await import("../../controllers/HelpController");
	app.route("/help", HelpController.controller);
	return app;
};

describe("HelpController validation integration", () => {
	it("returns 400 with descriptive errors for a null body", async () => {
		const app = await createApp();

		const response = await app.request("http://localhost/api/help", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: "null",
		});

		const payload = await response.json();

		expect(response.status).toBe(400);
		expect(payload).toEqual({
			errors: [
				{
					field: "body",
					message: "Request body is required",
				},
			],
		});
		expect(payload.stack).toBeUndefined();
		expect(payload.message).toBeUndefined();
	});

	it("returns 400 with descriptive errors for an empty body", async () => {
		const app = await createApp();

		const response = await app.request("http://localhost/api/help", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		});

		const payload = await response.json();

		expect(response.status).toBe(400);
		expect(payload).toEqual({
			errors: [
				{
					field: "body",
					message: "Request body is required",
				},
			],
		});
		expect(payload.stack).toBeUndefined();
		expect(payload.message).toBeUndefined();
	});

	it("returns 400 and collects all missing required fields", async () => {
		const app = await createApp();

		const response = await app.request("http://localhost/api/help", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title: "",
				description: "",
			}),
		});

		const payload = await response.json();

		expect(response.status).toBe(400);
		expect(payload.errors).toBeArray();
		expect(payload.errors).toEqual([
			{
				field: "title",
				message: "Title is required",
			},
			{
				field: "description",
				message: "Description is required",
			},
			{
				field: "urgency",
				message: "Urgency is required",
			},
			{
				field: "status",
				message: "Status is required",
			},
			{
				field: "anonymousMode",
				message: "Anonymous mode is required",
			},
			{
				field: "category",
				message: "Category is required",
			},
			{
				field: "requestDetails",
				message: "Invalid input: expected object, received undefined",
			},
		]);

		for (const error of payload.errors) {
			expect(error.field).toBeString();
			expect(error.message).toBeString();
		}

		expect(payload.stack).toBeUndefined();
		expect(payload.cause).toBeUndefined();
	});

	it("returns 400 and all errors for wrong field types", async () => {
		const app = await createApp();

		const response = await app.request("http://localhost/api/help", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title: 123,
				description: false,
				urgency: "URGENT",
				status: "PENDING",
				anonymousMode: "no",
				category: 999,
				requestDetails: {
					notes: 1,
					languageNeeded: true,
					safetyNotes: null,
				},
			}),
		});

		const payload = await response.json();

		expect(response.status).toBe(400);
		expect(payload.errors).toEqual([
			{
				field: "title",
				message: "Title is required",
			},
			{
				field: "description",
				message: "Description is required",
			},
			{
				field: "urgency",
				message: "Urgency is required",
			},
			{
				field: "status",
				message: "Status is required",
			},
			{
				field: "anonymousMode",
				message: "Anonymous mode is required",
			},
			{
				field: "category",
				message: "Category is required",
			},
			{
				field: "requestDetails.notes",
				message: "Notes is required",
			},
			{
				field: "requestDetails.languageNeeded",
				message: "Language needed is required",
			},
			{
				field: "requestDetails.safetyNotes",
				message: "Safety notes is required",
			},
		]);
		expect(payload.errors).toHaveLength(9);
		expect(payload.stack).toBeUndefined();
		expect(payload.message).toBeUndefined();
	});

	it("passes a valid request to the handler and returns the exact handler payload", async () => {
		const app = await createApp();

		const response = await app.request("http://localhost/api/help", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(validPayload),
		});

		const payload = await response.json();

		expect(response.status).toBe(200);
		expect(payload).toEqual(validPayload);
		expect(payload.ok).toBeUndefined();
		expect(payload.body).toBeUndefined();
		expect(payload.status).toBe("OPEN");
		expect(payload.requestDetails.notes).toBe(validPayload.requestDetails.notes);
	});

	it("does not return nested body wrappers on success", async () => {
		const app = await createApp();

		const response = await app.request("http://localhost/api/help", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(validPayload),
		});

		const payload = await response.json();

		expect(response.status).toBe(200);
		expect("body" in payload).toBe(false);
		expect(payload.body?.body).toBeUndefined();
		expect(payload.ok).toBeUndefined();
	});
});
