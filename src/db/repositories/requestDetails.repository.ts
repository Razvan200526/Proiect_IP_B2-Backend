import { repository } from "../../di/decorators/repository";
import { eq } from "drizzle-orm";
import { db } from "../";
import { requestDetails } from "../requests";

@repository()
export class RequestDetailsRepository {
    async findByHelpRequestId(
        helpRequestId: number,
    ): Promise<typeof requestDetails.$inferSelect | undefined> {
        const [details] = await db
            .select()
            .from(requestDetails)
            .where(eq(requestDetails.helpRequestId, helpRequestId));
        return details;
    }

    async deleteByHelpRequestId(helpRequestId: number): Promise<boolean> {
        const result = await db
            .delete(requestDetails)
            .where(eq(requestDetails.helpRequestId, helpRequestId))
            .returning({ id: requestDetails.id });
        return result.length > 0;
    }
}

export const requestDetailsRepository = new RequestDetailsRepository();
