import { db } from "../db";
import { ratings, taskAssignments, volunteers } from "../db/schema";
import { and, eq } from "drizzle-orm";

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

        const [taskData] = await db
            .select()
            .from(taskAssignments)
            .where(eq(taskAssignments.id, taskAssignmentId));

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

        const [volunteer] = await db
            .select()
            .from(volunteers)
            .where(eq(volunteers.id, taskData.handledByVolunteerId));

        if (!volunteer) {
            return {
                status: 404,
                body: { error: "Volunteer not found." },
            };
        }

        const requesterId = taskData.requestedByUserId;
        const volunteerUserId = volunteer.userId;

        const requesterRatesVolunteer =writtenByUserId === requesterId && receivedByUserId === volunteerUserId;

        const volunteerRatesRequester = writtenByUserId === volunteerUserId && receivedByUserId === requesterId;

        if (!requesterRatesVolunteer && !volunteerRatesRequester) {
            return {
                status: 400,
                body: { error: "Invalid rating participants for this task." },
            };
        }

        const [existingRating] = await db
            .select()
            .from(ratings)
            .where(
                and(
                    eq(ratings.taskAssignmentId, taskAssignmentId),
                    eq(ratings.writtenByUserId, writtenByUserId),
                    eq(ratings.receivedByUserId, receivedByUserId)
                )
            );

        if (existingRating) {
            return {
                status: 409,
                body: { error: "Rating already exists for this task." },
            };
        }

        const [createdRating] = await db
            .insert(ratings)
            .values({
                taskAssignmentId,
                writtenByUserId,
                receivedByUserId,
                stars,
                comment: comment.trim()
            })
            .returning();

        return {
            status: 201,
            body: createdRating
        };
    }
}