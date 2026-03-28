CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'LIMITED', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."assignment_status" AS ENUM('ASSIGNED', 'STARTED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('OPEN', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('NEW_REQUEST', 'OFFER_ACCEPTED', 'TASK_UPDATED', 'TASK_COMPLETED', 'WARNING');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('OPEN', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."urgency_level" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TABLE "help_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"volunteer_id" integer NOT NULL,
	"help_request_id" integer NOT NULL,
	"message" text,
	"status" "offer_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "help_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"guest_session_id" varchar(128),
	"title" varchar(255) NOT NULL,
	"description" text,
	"urgency" "urgency_level" DEFAULT 'MEDIUM' NOT NULL,
	"status" "request_status" DEFAULT 'OPEN' NOT NULL,
	"anonymous_mode" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"location_city" varchar(100),
	"location_address_text" text,
	"location_latitude" real,
	"location_longitude" real
);
--> statement-breakpoint
CREATE TABLE "request_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"help_request_id" integer NOT NULL,
	"notes" text,
	"language_needed" varchar(50),
	"safety_notes" text,
	CONSTRAINT "request_details_help_request_id_unique" UNIQUE("help_request_id")
);
--> statement-breakpoint
CREATE TABLE "task_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"help_request_id" integer NOT NULL,
	"requested_by_user_id" text NOT NULL,
	"handled_by_volunteer_id" integer NOT NULL,
	"status" "assignment_status" DEFAULT 'ASSIGNED' NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "task_assignments_help_request_id_unique" UNIQUE("help_request_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_assignment_id" integer NOT NULL,
	"status" "conversation_status" DEFAULT 'OPEN' NOT NULL,
	CONSTRAINT "conversations_task_assignment_id_unique" UNIQUE("task_assignment_id")
);
--> statement-breakpoint
CREATE TABLE "interaction_histories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"task_assignment_id" integer NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"summary" text
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_assignment_id" integer NOT NULL,
	"written_by_user_id" text NOT NULL,
	"received_by_user_id" text NOT NULL,
	"stars" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "help_offers" ADD CONSTRAINT "help_offers_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_offers" ADD CONSTRAINT "help_offers_help_request_id_help_requests_id_fk" FOREIGN KEY ("help_request_id") REFERENCES "public"."help_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_requests" ADD CONSTRAINT "help_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_details" ADD CONSTRAINT "request_details_help_request_id_help_requests_id_fk" FOREIGN KEY ("help_request_id") REFERENCES "public"."help_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_help_request_id_help_requests_id_fk" FOREIGN KEY ("help_request_id") REFERENCES "public"."help_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_requested_by_user_id_user_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_handled_by_volunteer_id_volunteers_id_fk" FOREIGN KEY ("handled_by_volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_task_assignment_id_task_assignments_id_fk" FOREIGN KEY ("task_assignment_id") REFERENCES "public"."task_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaction_histories" ADD CONSTRAINT "interaction_histories_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaction_histories" ADD CONSTRAINT "interaction_histories_task_assignment_id_task_assignments_id_fk" FOREIGN KEY ("task_assignment_id") REFERENCES "public"."task_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_task_assignment_id_task_assignments_id_fk" FOREIGN KEY ("task_assignment_id") REFERENCES "public"."task_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_written_by_user_id_user_id_fk" FOREIGN KEY ("written_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_received_by_user_id_user_id_fk" FOREIGN KEY ("received_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;