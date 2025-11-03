ALTER TABLE "applications" ADD COLUMN "reviewedAt" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "correctedCourseName" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "correctedEcts" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "correctedSubjectArea" "subject_area";