import {
	pgTable,
	serial,
	text,
	boolean,
	real,
	integer,
	varchar,
	jsonb,
	geometry,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const profiles = pgTable("profiles", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => users.id, {
			onDelete: "cascade",
		}),
	bio: text("bio"),
	languages: jsonb("languages").$type<string[]>().default([]),
	hiddenIdentity: boolean("hidden_identity").notNull().default(false),
});

export const volunteers = pgTable("volunteers", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: "cascade" }),
	availability: boolean("availability").notNull().default(false),
	trustScore: real("trust_score").notNull().default(0),
	completedTasks: integer("completed_tasks").notNull().default(0),
});

export const volunteerProfiles = pgTable(
	"volunteer_profiles",
	{
		id: serial("id").primaryKey(),
		volunteerId: integer("volunteer_id")
			.notNull()
			.unique()
			.references(() => volunteers.id, { onDelete: "cascade" }),
		skills: jsonb("skills").$type<string[]>().default([]),
		maxDistanceKm: real("max_distance_km"),
		currentLocation: geometry("current_location", {
			type: "point",
			mode: "xy",
			srid: 4326,
		}),
	},
	(t) => [
		index("idx_volunteer_profiles_location").using("gist", t.currentLocation),
	],
);

export const volunteerKnownLocations = pgTable(
	"volunteer_known_locations",
	{
		id: serial("id").primaryKey(),
		volunteerId: integer("volunteer_id")
			.notNull()
			.references(() => volunteers.id, { onDelete: "cascade" }),
		city: varchar("city", { length: 100 }),
		addressText: text("address_text"),
		location: geometry("location", {
			type: "point",
			mode: "xy",
			srid: 4326,
		}).notNull(),
	},
	(t) => [
		index("idx_volunteer_known_locations_location").using("gist", t.location),
	],
);

export const volunteersRelations = relations(volunteers, ({ one }) => ({
	volunteerProfile: one(volunteerProfiles, {
		fields: [volunteers.id],
		references: [volunteerProfiles.volunteerId],
	}),
}));

export const volunteerProfilesRelations = relations(
	volunteerProfiles,
	({ one }) => ({
		volunteer: one(volunteers, {
			fields: [volunteerProfiles.volunteerId],
			references: [volunteers.id],
		}),
	}),
);
