import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";
import {InvalidStatusTransitionError} from "../../src/utils/Errors";

mock.module("../../src/utils/controller", () => ({
    Controller: () => (_target: unknown) => {},
}));
//trebuie neparat dupa mock)
const { HelpRequestController } = await import(
    "../../src/controllers/HelpRequestController"
    );

type RequestStatus =
    | "OPEN"
    | "MATCHED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "REJECTED";

type Task = { id: number; status: RequestStatus };

class InMemoryHelpRequestRepo {
    private readonly store = new Map<number, Task>();

    seed(task: Task) {
        this.store.set(task.id, { ...task });
    }

    async findById(id: number): Promise<Task | undefined> {
        const found = this.store.get(id);
        return found ? { ...found } : undefined;
    }

    async updateStatus(
        id: number,
        newStatus: RequestStatus,
    ): Promise<Task | undefined> {
        const current = this.store.get(id);
        if (!current) return undefined;
        const updated = { ...current, status: newStatus };
        this.store.set(id, updated);
        return { ...updated };
    }

    async create(data: any) {
        return data;
    }
}

describe("POST /tasks/:id/status", () => {
    let app: Hono;
    let repo: InMemoryHelpRequestRepo;

    const postStatus = (id: number, status: RequestStatus) =>
        app.request(`http://localhost/tasks/${id}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });

    beforeEach(() => {
        repo = new InMemoryHelpRequestRepo();

        //definim un serviciu fals
        const fakeService = {
            createHelpRequest: async (data: unknown) => data,
            updateHelpRequestStatus: async (id: number, status: RequestStatus) => {
                const current = await repo.findById(id);
                // Simulăm comportamentul serviciului tău real
                if (!current) throw new Error(`Task ${id} not found`);

                const validTransitions: Record<RequestStatus, RequestStatus[]> = {
                    OPEN: ["MATCHED"],
                    MATCHED: ["IN_PROGRESS", "CANCELLED", "REJECTED"],
                    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
                    COMPLETED: [],
                    CANCELLED: [],
                    REJECTED: [],
                };

                if (!validTransitions[current.status].includes(status)) {
                    throw new InvalidStatusTransitionError(current.status, status);
                }

                return await repo.updateStatus(id, status);
            },
        };

        const controller = new HelpRequestController(fakeService as any);

        app = new Hono();
        app.route("/tasks", controller.controller);
    });

    test("200 - valid Open -> Claimed (OPEN -> MATCHED)", async () => {
        repo.seed({ id: 10, status: "OPEN" });

        const response = await postStatus(10, "MATCHED");
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toMatchObject({ id: 10, status: "MATCHED" });

        const fromDb = await repo.findById(10);
        expect(fromDb?.status).toBe("MATCHED");
    });

    test("200 - valid Claimed -> Done (echivalent flux actual: IN_PROGRESS -> COMPLETED)", async () => {
        repo.seed({ id: 11, status: "IN_PROGRESS" });

        const response = await postStatus(11, "COMPLETED");
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toMatchObject({ id: 11, status: "COMPLETED" });

        const fromDb = await repo.findById(11);
        expect(fromDb?.status).toBe("COMPLETED");
    });

    test("400 - invalid Open -> Done (OPEN -> COMPLETED) cu mesaj explicit", async () => {
        repo.seed({ id: 12, status: "OPEN" });

        const response = await postStatus(12, "COMPLETED");
        const body = await response.json();

        expect(response.status).toBe(400);
        //trimitem neaparat eroarea mai departe
        expect(body).toEqual({
            error: "Invalid transition from OPEN to COMPLETED",
        });

        const unchanged = await repo.findById(12);
        expect(unchanged?.status).toBe("OPEN");
    });

    test("400 - invalid Done -> Claimed (COMPLETED -> MATCHED) cu mesaj explicit", async () => {
        repo.seed({ id: 13, status: "COMPLETED" });

        const response = await postStatus(13, "MATCHED");
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({
            error: "Invalid transition from COMPLETED to MATCHED",
        });

        const unchanged = await repo.findById(13);
        expect(unchanged?.status).toBe("COMPLETED");
    });
});