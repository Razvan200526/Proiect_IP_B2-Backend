import { Hono } from "hono";
import { Controller } from "../utils/controller";
import { requestDetailsService } from "../services/RequestDetailsService";

@Controller("/tasks")
export class RequestDetailsController {
  static controller = new Hono().delete("/:id/details", async (c) => {
    try {
      const id = Number(c.req.param("id"));
      const result = await requestDetailsService.deleteHelpRequestDetails(id);

      if (result.status === 204) {
        return c.body(null, 204);
      }

      return c.json(result.body, result.status);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Internal server error" }, 500);
    }
  });
}
