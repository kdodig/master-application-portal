ALTER TABLE "courses" ALTER COLUMN "ects" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "predictedEcts" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "correctedEcts" numeric(10, 2);