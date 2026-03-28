import { db } from "@server/db";
import {helpRequest, type HelpRequestType, RequestStatus} from "@server/db/schema";
import { eq } from "drizzle-orm";

// extract enum values
type StatusType = typeof RequestStatus.enumValues[number];

export class HelpRequestRepository {
  async create(data: Partial<HelpRequestType>): Promise<HelpRequestType | null> {
    const [result] = await db
      .insert(helpRequest)
      .values(data as any)
      .returning();
    return result ?? null;
  }

  /**
  * Searches for and returns a single HelpRequest from the db
  * @param id - The unique ID (UUID) of the request
  * @returns The Help Request object, or null if it was not found
  */
  async findByID(id: string): Promise<HelpRequestType | null> {
    const [result] = await db.select().from(helpRequest).where(eq(helpRequest.id, id));
    return result ?? null;
  }

  async updateStatus(id: string, newStatus: StatusType): Promise<HelpRequestType | null> {
    const [result] = await db
        .update(helpRequest)
        .set({ status: newStatus })
        .where(eq(helpRequest.id, id))
        .returning();
    return result ?? null;
  }
}

export const helpRequestRepository = new HelpRequestRepository();