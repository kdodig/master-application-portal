CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_analysis" RENAME TO "bachelor_degree";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "course_analysis_id" TO "bachelor_degree_id";--> statement-breakpoint
ALTER TABLE "applicants" DROP CONSTRAINT "applicants_applicant_number_unique";--> statement-breakpoint
ALTER TABLE "bachelor_degree" DROP CONSTRAINT "course_analysis_applicant_id_applicants_id_fk";
--> statement-breakpoint
ALTER TABLE "bachelor_degree" DROP CONSTRAINT "course_analysis_reviewed_by_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_course_analysis_id_course_analysis_id_fk";
--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "predicted_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "predicted_credits" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "predicted_subject_area" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "transcript_upload_id" uuid;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "course_description_upload_id" uuid;--> statement-breakpoint
ALTER TABLE "bachelor_degree" ADD COLUMN "university" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bachelor_degree" ADD COLUMN "country" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bachelor_degree" ADD COLUMN "course_of_study" text NOT NULL;--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_transcript_upload_id_uploads_id_fk" FOREIGN KEY ("transcript_upload_id") REFERENCES "public"."uploads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_course_description_upload_id_uploads_id_fk" FOREIGN KEY ("course_description_upload_id") REFERENCES "public"."uploads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bachelor_degree" ADD CONSTRAINT "bachelor_degree_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bachelor_degree" ADD CONSTRAINT "bachelor_degree_reviewed_by_accounts_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_bachelor_degree_id_bachelor_degree_id_fk" FOREIGN KEY ("bachelor_degree_id") REFERENCES "public"."bachelor_degree"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "university";--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "country";