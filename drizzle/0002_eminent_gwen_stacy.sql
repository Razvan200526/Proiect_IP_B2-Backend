CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bio" text,
	"languages" jsonb DEFAULT '[]'::jsonb,
	"hidden_identity" boolean DEFAULT false NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "volunteer_known_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"volunteer_id" integer NOT NULL,
	"city" varchar(100),
	"address_text" text,
	"location" geometry(point) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"volunteer_id" integer NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"max_distance_km" real,
	"current_location" geometry(point),
	CONSTRAINT "volunteer_profiles_volunteer_id_unique" UNIQUE("volunteer_id")
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"availability" boolean DEFAULT false NOT NULL,
	"trust_score" real DEFAULT 0 NOT NULL,
	"completed_tasks" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "volunteers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "volunteer_known_locations" ADD CONSTRAINT "volunteer_known_locations_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "volunteer_profiles_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;