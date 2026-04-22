import { Hono } from "hono";
import { Controller } from "../utils/controller";
import { helpRequestService } from "../services/HelpRequestService";

@Controller("/tasks")
export class HelpRequestController {
  static controller = new Hono()
    .post("/", async (c) => {
      try {
        const body = await c.req.json();
        const result = await helpRequestService.createHelpRequest(body);
        return c.json(result, 201);
      } catch (error) {
        return c.json({ message: "Internal server error" }, 500);
      }
    })
    
    //modificari
    .get("/", async (c) => {
    try {
      // 1. Citim parametrii din URL (ex: ?page=1&size=5)
      const pageQuery = c.req.query("page");
      const sizeQuery = c.req.query("size");

      // 2. Aplicăm valorile implicite (exact cum cere checklist-ul: page 0, size 10)
      const page = pageQuery !== undefined ? parseInt(pageQuery, 10) : 0;
      const size = sizeQuery !== undefined ? parseInt(sizeQuery, 10) : 10;

      // 3. Validare: returnăm 400 dacă primesc text în loc de numere sau numere negative
      if (isNaN(page) || isNaN(size) || page < 0 || size <= 0) {
        return c.json({ 
          success: false, 
          message: "Parametrii 'page' sau 'size' sunt invalizi. Trebuie sa fie numere pozitive." 
        }, 400);
      }

      // 4. Apelăm Service-ul pe care tocmai l-ai creat
      const result = await helpRequestService.getAllPaginated(page, size);

      // 5. Returnăm status 200 cu lista și metadatele (chiar și dacă e goală, returnează 200)
      return c.json({
        success: true,
        ...result
      }, 200);

    } catch (error) {
      // 6. Prindem erorile interne FĂRĂ să expunem detalii (cum cere checklist-ul)
      console.error("Eroare la paginare:", error);
      return c.json({ success: false, message: "Eroare interna a serverului." }, 500);
    }
  })






    .get("/:id", async (c) => {
      const idParam = c.req.param("id");
      const requestedId = parseInt(idParam, 10);

      if (Number.isNaN(requestedId)) {
        return c.json(
          { success: false, message: "Eroare: ID-ul furnizat trebuie sa fie un numar." },
          400
        );
      }

      try {
        const foundTask = await helpRequestService.getHelpRequestById(requestedId);

        if (!foundTask) {
          return c.json(
            { success: false, message: `Eroare: Task-ul cu ID-ul '${idParam}' nu a fost gasit` },
            404
          );
        }

        return c.json({ success: true, data: foundTask }, 200);
      } catch (error) {
        console.error("Eroare interna de server:", error);
        return c.json({ success: false, message: "Eroare interna a serverului." }, 500);
      }
    });


}