ALTER TABLE "courses" RENAME COLUMN "courseName" TO "name";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "expectedCourseName" TO "predictedName";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "correctedCourseName" TO "correctedName";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "expectedSubjectArea" TO "predictedSubjectArea";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "courseId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "courseId" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "ects" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "expectedEcts";--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "correctedEcts";