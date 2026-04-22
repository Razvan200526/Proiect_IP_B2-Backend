import { helpRequestRepository, type CreateHelpRequestDTO } from "../db/repositories/helpRequests.repository";

export class HelpRequestService {
  async createHelpRequest(data: CreateHelpRequestDTO) {
    try {
      return await helpRequestRepository.create({
        ...data,
        status: "OPEN",
      });
    } catch (error) {
      console.error("Failed to create help request:", error);
      throw new Error("Could not create help request");
    }
  }
    async getHelpRequestById(id: number) {
    return await helpRequestRepository.findById(id);
  }
  
  //aici este modificarea mea
  async getAllPaginated(page: number, size: number) {
    // 1. Cerem datele de la repository
    const { data, totalElements } = await helpRequestRepository.findAllPaginated(page, size);

    // 2. Calculăm numărul total de pagini
    const totalPages = Math.ceil(totalElements / size);

    // 3. Formatăm datele. Drizzle ne dă un obiect cu { helpRequests: {...}, requestDetails: {...} }
    // Noi vrem să le combinăm, astfel încât requestDetails să fie înăuntrul task-ului.
    const items = data.map((row) => ({
      ...row.help_requests,
      requestDetails: row.request_details, // Dacă nu are detalii, va fi null (exact cum cere task-ul)
    }));

    // 4. Returnăm structura finală pe care o va trimite Controller-ul
    return {
      items,
      metadata: {
        totalElements,
        totalPages,
        currentPage: page,
        pageSize: size,
      },
    };
  }

}

export const helpRequestService = new HelpRequestService();