ALTER TABLE "help_requests" ADD COLUMN "location" geometry(point);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_volunteer_known_locations_location" ON "volunteer_known_locations" USING gist ("location");--> statement-breakpoint
CREATE INDEX "idx_volunteer_profiles_location" ON "volunteer_profiles" USING gist ("current_location");--> statement-breakpoint
CREATE INDEX "idx_help_requests_location" ON "help_requests" USING gist ("location");--> statement-breakpoint
ALTER TABLE "help_requests" DROP COLUMN "location_latitude";--> statement-breakpoint
ALTER TABLE "help_requests" DROP COLUMN "location_longitude";