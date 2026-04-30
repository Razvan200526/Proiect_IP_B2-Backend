import { Hono } from "hono";
import { Controller } from "../utils/controller";
import { inject } from "../di";
import { HelpRequestService } from "../services/HelpRequestService";
import { ModerationError } from "../services/ModerationService";
import { requestStatusEnum } from "../db/enums";
import { InvalidStatusTransitionError, NotFoundError } from "../utils/Errors";

import { authMiddleware } from "../middlware/authMiddleware";
import { validateTasksQuery } from "../utils/validators/queryValidator";

type RequestStatus = (typeof requestStatusEnum.enumValues)[number];

const VALID_STATUSES = new Set<RequestStatus>(requestStatusEnum.enumValues);
import {
	createValidationMiddleware,
	helpRequestInputSchema,
} from "../validation";
import { sendApiResponse } from "../utils/apiReponse";

@Controller("/tasks")
export class HelpRequestController {
	constructor(
		@inject(HelpRequestService)
		private readonly helpRequestService: HelpRequestService,
	) {}

	controller = new Hono()
		.use("/", createValidationMiddleware(helpRequestInputSchema))

		.post("/", async (c) => {
			try {
				const body = await c.req.json();
				const result = await this.helpRequestService.createHelpRequest(body);
				//return c.json(result, 201);
				return sendApiResponse(c, result, { kind: "created" });
			} catch (error: any) {
				// check if error comes from inappropriate request
				if (error instanceof ModerationError) {
					//return c.json({ error: error.message }, 400);
					return sendApiResponse(c, null, {
						kind: "clientError",
						message: error.message,
					});
				}

				console.error(error);
				//return c.json({ error: "Internal server error" }, 500);
				return sendApiResponse(c, null, { kind: "serverError" });
			}
		})

		.get("/:id", async (c) => {
			try {
				const idParam = c.req.param("id");
				const requestedId = Number(idParam);

				if (
					!Number.isInteger(requestedId) ||
					requestedId <= 0 ||
					requestedId > Number.MAX_SAFE_INTEGER
				) {
					return sendApiResponse(c, null, {
						kind: "clientError",
						message:
							"Error: The ID provided is invalid. It must be a positive integer.",
					});
				}

				const foundTask =
					await this.helpRequestService.getHelpRequestById(requestedId);

				if (
					!foundTask ||
					(Array.isArray(foundTask) && foundTask.length === 0)
				) {
					return sendApiResponse(c, null, {
						kind: "notFound",
						message: `The task with ID '${requestedId}' does not exist in the system.`,
					});
				}

				const dataToReturn = Array.isArray(foundTask)
					? foundTask[0]
					: foundTask;
				//return c.json(dataToReturn, 200);
				return sendApiResponse(c, dataToReturn);
			} catch (error) {
				console.error(
					`Eroare critica la GET /tasks/${c.req.param("id")} :`,
					error,
				);
				return sendApiResponse(c, null, {
					kind: "serverError",
					message: "Internal server error. Please try again later.",
				});
			}
		})

		.patch("/:id/status", async (c) => {
			const requestId = Number(c.req.param("id"));
			if (!Number.isInteger(requestId)) {
				return sendApiResponse(c, null, {
					kind: "clientError",
					message: "'id' must be a valid numeric request identifier",
				});
			}

			let body: { status?: unknown };
			try {
				body = await c.req.json();
			} catch {
				//return c.json({ error: "Request body must be valid JSON" }, 400);
				return sendApiResponse(c, null, {
					kind: "clientError",
					message: "Request body must be valid JSON",
				});
			}

			const { status } = body;

			if (
				typeof status !== "string" ||
				!VALID_STATUSES.has(status as RequestStatus)
			) {
				return sendApiResponse(c, null, {
					kind: "clientError",
					message: `'status' must be one of: ${[...VALID_STATUSES].join(", ")}`,
				});
			}

			try {
				const updated = await this.helpRequestService.updateHelpRequestStatus(
					requestId,
					status as RequestStatus,
				);
				//return c.json(updated, 200);
				return sendApiResponse(c, updated);
			} catch (error) {
				if (error instanceof NotFoundError) {
					//return c.json({ error: error.message }, 404);
					return sendApiResponse(c, null, {
						kind: "notFound",
						message: error.message,
					});
				}

				if (error instanceof InvalidStatusTransitionError) {
					//return c.json({ error: error.message }, 409);
					return sendApiResponse(c, null, {
						statusCode: 409,
						message: error.message,
					});
				}

				throw error;
			}
		})

		// BE1-12 & BE1-13 (Paginare + Sortare)
		.get("/", authMiddleware, async (c) => {
			try {
				//Apelam validatorul nostru curat, trimitându-i toți parametrii din URL
				const validation = validateTasksQuery(c.req.query());

				//Daca validatorul gaseste o problema
				if (validation.error || !validation.validData) {
					return sendApiResponse(c, null, {
						kind: "clientError",
						message: validation.error || "Validation error.",
					});
				}

				//Extragem parametrii
				const { page, pageSize, sortBy } = validation.validData;
				const result = await this.helpRequestService.getPaginatedTasks(
					page,
					pageSize,
					sortBy,
					//order,
					//filters,
				);

				//return c.json(result, 200);
				return sendApiResponse(c, result);
			} catch (error) {
				console.error("Eroare la GET /tasks paginat si sortat:", error);
				//return c.json({ error: "Eroare interna a serverului" }, 500);
				return sendApiResponse(c, null, {
					kind: "serverError",
					message: "Internal server error",
				});
			}
		});
}
