import { helpRequestRepository } from "../db/repositories/helpRequest.repository";
import { requestDetailsRepository } from "../db/repositories/requestDetails.repository";

type DeleteRequestDetailsResponse =
  | {
      status: 204;
    }
  | {
      status: 404 | 409;
      body: { error: string };
    };

export class RequestDetailsService {
  async deleteHelpRequestDetails(id: number): Promise<DeleteRequestDetailsResponse> {
    const task = await helpRequestRepository.findById(id);

    if (!task) {
      return {
        status: 404,
        body: { error: "Task not found." },
      };
    }

    if (["MATCHED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"].includes(task.status)) {
      return {
        status: 409,
        body: {
          error: "Details cannot be deleted when task status is MATCHED, IN_PROGRESS, COMPLETED, CANCELLED or REJECTED.",
        },
      };
    }

    const details = await requestDetailsRepository.findByHelpRequestId(id);

    if (!details) {
      return {
        status: 409,
        body: { error: "Task has no details." },
      };
    }

    await requestDetailsRepository.deleteByHelpRequestId(id);

    return {
      status: 204,
    };
  }
}

export const requestDetailsService = new RequestDetailsService();
