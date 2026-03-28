import { pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
	id: text("id").primaryKey(),
});
//only to get rid of errors(the auth service task has to be implemented)
