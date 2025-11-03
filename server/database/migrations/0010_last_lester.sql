ALTER TABLE "applications" ADD COLUMN "description_matching_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "description_matching_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "page_number" integer;