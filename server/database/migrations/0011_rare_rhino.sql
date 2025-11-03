CREATE TYPE "public"."review_status" AS ENUM('documents', 'course_analysis', 'personal_skills', 'done', 'rejected');--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "last_login" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "review_status" "review_status" DEFAULT 'documents' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "page" integer;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;