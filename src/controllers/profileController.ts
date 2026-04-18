import { Hono } from "hono";
import { Controller } from "../utils/controller";
import { auth } from "../auth";
import { profileService } from "../services/ProfileService";
import {
    createProfileSchema,
    updateProfileSchema,
} from "../utils/validators/profileValidator";

@Controller("/profile")
export class ProfileController {
    static controller = new Hono()

        .get("/me", async (c) => {
            const session = await auth.api.getSession({
                headers: c.req.raw.headers,
            });
            if (!session) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const profile = await profileService.getProfileByUserId(session.user.id);
            if (!profile) {
                return c.json({ error: "Profile not found" }, 404);
            }

            return c.json(profile, 200);
        })

        .get("/:userId", async (c) => {
            const { userId } = c.req.param();

            const profile = await profileService.getProfileByUserId(userId);
            if (!profile) {
                return c.json({ error: "Profile not found" }, 404);
            }

            return c.json(profile, 200);
        })

        .post("/", async (c) => {
            const session = await auth.api.getSession({
                headers: c.req.raw.headers,
            });
            if (!session) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const body = await c.req.json();
            const parsed = createProfileSchema.safeParse(body);
            if (!parsed.success) {
                return c.json({ error: parsed.error.flatten() }, 400);
            }

           const profile = await profileService.createProfile(
                session.user.id,
                parsed.data
            );

            return c.json(profile, 201);
        })

        .put("/me", async (c) => {
            const session = await auth.api.getSession({
                headers: c.req.raw.headers,
            });
            if (!session) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const body = await c.req.json();
            const parsed = updateProfileSchema.safeParse(body);
            if (!parsed.success) {
                return c.json({ error: parsed.error.flatten() }, 400);
            }

            const updated = await profileService.updateProfile(
                session.user.id,
                parsed.data
            );

            return c.json(updated, 200);
        })

        .delete("/me", async (c) => {
            const session = await auth.api.getSession({
                headers: c.req.raw.headers,
            });
            if (!session) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            await profileService.deleteProfile(session.user.id);

            return c.json({ message: "Profile deleted successfully" }, 200);
        });
}