import { RatingsRepository } from "../repositories/RatingsRepository";

export type CreateRatingInput = {
    taskAssignmentId: number;
    writtenByUserId: string;
    receivedByUserId: string;
    stars: number;
    comment: string;
};

type CreateRatingResponse =
    | {
          status: 201;
          body: {
              id: number;
              createdAt: Date;
              taskAssignmentId: number;
              writtenByUserId: string;
              receivedByUserId: string;
              stars: number;
              comment: string | null;
          };
      }
    | {
          status: 400 | 404 | 409;
          body: { error: string };
      };

export class RatingsService {
    static async createRating(input: CreateRatingInput): Promise<CreateRatingResponse> {
        const { taskAssignmentId, writtenByUserId, receivedByUserId, stars, comment } = input;

        if (writtenByUserId === receivedByUserId) {
            return {
                status: 400,
                body: { error: "You cannot rate yourself." },
            };
        }

        const [taskData] = await RatingsRepository.getTaskAssignmentById(taskAssignmentId);

        if (!taskData) {
            return {
                status: 404,
                body: { error: "Task assignment not found." },
            };
        }

        if (taskData.status !== "COMPLETED") {
            return {
                status: 400,
                body: { error: "Rating can only be given after task completion." },
            };
        }

        const [volunteer] = await RatingsRepository.getVolunteerById(taskData.handledByVolunteerId);

        if (!volunteer) {
            return {
                status: 404,
                body: { error: "Volunteer not found." },
            };
        }

        const requesterId = taskData.requestedByUserId;
        const volunteerUserId = volunteer.userId;

        const requesterRatesVolunteer = writtenByUserId === requesterId && receivedByUserId === volunteerUserId;
        const volunteerRatesRequester = writtenByUserId === volunteerUserId && receivedByUserId === requesterId;

        if (!requesterRatesVolunteer && !volunteerRatesRequester) {
            return {
                status: 400,
                body: { error: "Invalid rating participants for this task." },
            };
        }

        const [existingRating] = await RatingsRepository.findRating(
            taskAssignmentId,
            writtenByUserId,
            receivedByUserId
        );

        if (existingRating) {
            return {
                status: 409,
                body: { error: "Rating already exists for this task." },
            };
        }

        const [createdRating] = await RatingsRepository.createRating({
            taskAssignmentId,
            writtenByUserId,
            receivedByUserId,
            stars,
            comment: comment.trim(),
        });

        return {
            status: 201,
            body: createdRating,
        };
    }

    static async getRatingsForUser(userId: string) {
        return RatingsRepository.getRatingsByReceivedUserId(userId);
    }
}