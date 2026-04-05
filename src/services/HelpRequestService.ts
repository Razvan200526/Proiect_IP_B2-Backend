import { helpRequestRepository, type CreateHelpRequestDTO } from "../db/repositories/helpRequests.repository";

export class HelpRequestService {
  async createHelpRequest(data: CreateHelpRequestDTO) {
    return await helpRequestRepository.create({
      ...data,
      status: "OPEN",
    });
  }
}

export const helpRequestService = new HelpRequestService();