import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";
import { expectApiEnvelope } from "./apiResponseAssertions";

//const Controller = () => (_target: unknown) => {};

const { RequestDetailsController } = await import(
	"../../src/controllers/RequestDetailsController"
);

const validPayload = {
	notes: "Pickup at the main entrance.",
	languageNeeded: "Romanian",
	safetyNotes: "Wheelchair assistance needed.",
};

describe("POST /tasks/:id/details validation", () => {
	let app: Hono;
	let upsertDetails: ReturnType<typeof mock>;

	beforeEach(() => {
		upsertDetails = mock(async (id: number, body: unknown) => ({
			notFound: false,
			data: {
				helpRequestId: id,
				...(body as Record<string, unknown>),
			},
		}));

		const controller = new RequestDetailsController({
			upsertDetails,
		} as any);

		app = new Hono();
		app.route("/tasks", controller.controller);
	});

	test("returns 400 for languageNeeded longer than 50 on the real route", async () => {
		const response = await app.request("http://localhost/tasks/10/details", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...validPayload,
				languageNeeded: "a".repeat(51),
			}),
		});

		expect(response.status).toBe(400);
		const body: any = await response.json();
		expectApiEnvelope(body, 400);
		expect(body).toMatchObject({
			data: {
				errors: [
					{
						field: "languageNeeded",
						message: "language needed must be at most 50 characters",
					},
				],
			},
			isClientError: true,
		});
		expect(upsertDetails).not.toHaveBeenCalled();
	});

	test("returns 400 for extra fields on the real route", async () => {
		const response = await app.request("http://localhost/tasks/10/details", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...validPayload,
				extraField: "unexpected",
			}),
		});

		expect(response.status).toBe(400);
		const body: any = await response.json();
		expectApiEnvelope(body, 400);
		expect(body).toMatchObject({
			data: {
				errors: [
					{
						field: "body",
						message: 'Unrecognized key: "extraField"',
					},
				],
			},
			isClientError: true,
		});
		expect(upsertDetails).not.toHaveBeenCalled();
	});

	test("lets a valid requestDetails body reach the handler without wrapping the response", async () => {
		const response = await app.request("http://localhost/tasks/10/details", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(validPayload),
		});

		expect(response.status).toBe(200);
		expect(upsertDetails).toHaveBeenCalledTimes(1);
		expect(upsertDetails).toHaveBeenCalledWith(10, validPayload);
		const body: any = await response.json();
		expectApiEnvelope(body, 200);
		expect(body.data).toEqual({
			helpRequestId: 10,
			...validPayload,
		});
	});

	test("smoke: response envelope complet pentru PUT /tasks/:id/details", async () => {
		const response = await app.request("http://localhost/tasks/10/details", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(validPayload),
		});

		const body: any = await response.json();
		expectApiEnvelope(body, response.status as 200);
	});
});
