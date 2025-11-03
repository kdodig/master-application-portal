ALTER TABLE "course_analysis" ALTER COLUMN "reviewed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "course_analysis" ALTER COLUMN "reviewed_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_applicant_number_unique" UNIQUE("applicant_number");