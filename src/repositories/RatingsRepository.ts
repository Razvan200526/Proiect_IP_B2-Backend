import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { ratings, taskAssignments, volunteers } from "../db/schema";

export type RatingCreateData = {
    taskAssignmentId: number;
    writtenByUserId: string;
    receivedByUserId: string;
    stars: number;
    comment: string;
};

export class RatingsRepository {
    static async getRatingsByReceivedUserId(userId: string) {
        return db.select().from(ratings).where(eq(ratings.receivedByUserId, userId));
    }

    static async getTaskAssignmentById(taskAssignmentId: number) {
        return db
            .select()
            .from(taskAssignments)
            .where(eq(taskAssignments.id, taskAssignmentId));
    }

    static async getVolunteerById(volunteerId: number) {
        return db.select().from(volunteers).where(eq(volunteers.id, volunteerId));
    }

    static async findRating(taskAssignmentId: number, writtenByUserId: string, receivedByUserId: string) {
        return db
            .select()
            .from(ratings)
            .where(
                and(
                    eq(ratings.taskAssignmentId, taskAssignmentId),
                    eq(ratings.writtenByUserId, writtenByUserId),
                    eq(ratings.receivedByUserId, receivedByUserId)
                )
            );
    }

    static async createRating(rating: RatingCreateData) {
        return db.insert(ratings).values(rating).returning();
    }
}
