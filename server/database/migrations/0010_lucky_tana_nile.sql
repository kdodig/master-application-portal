CREATE TYPE "public"."document_status" AS ENUM('existing', 'missing', 'unclear');--> statement-breakpoint
CREATE TYPE "public"."master_track" AS ENUM('managing_digital_business', 'business_process_management', 'data_science');--> statement-breakpoint
CREATE TABLE "accounts_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"role_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_id" uuid NOT NULL,
	"worst_possible_grade" double precision NOT NULL,
	"average_grade" double precision NOT NULL,
	"best_possible_grade" double precision NOT NULL,
	"credits_in_program" double precision NOT NULL,
	"years_in_program" double precision NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_id" uuid NOT NULL,
	"curriculum_vitae" "document_status",
	"school_certificate" "document_status",
	"bachelor_certificate" "document_status",
	"transcript_of_records" "document_status",
	"course_description" "document_status",
	"english_certificate" "document_status",
	"standardized_test" "document_status",
	"additional_documents" "document_status",
	"reviewed_by" uuid,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "personal_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_id" uuid NOT NULL,
	"description" text NOT NULL,
	"points" double precision NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "roles_key_unique" UNIQUE("key"),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"application_period_start" timestamp NOT NULL,
	"application_period_end" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" RENAME TO "accounts";--> statement-breakpoint
ALTER TABLE "applications" RENAME TO "applicants";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "passwordHash" TO "password_hash";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "isPasswordTemporary" TO "password_temporary";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "invitedBy" TO "created_by";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "isActive" TO "active";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "lastLoginAt" TO "last_login";--> statement-breakpoint
ALTER TABLE "applicants" RENAME COLUMN "applicationId" TO "id";--> statement-breakpoint
ALTER TABLE "applicants" RENAME COLUMN "applicantNr" TO "applicant_number";--> statement-breakpoint
ALTER TABLE "applicants" RENAME COLUMN "firstName" TO "first_name";--> statement-breakpoint
ALTER TABLE "applicants" RENAME COLUMN "lastName" TO "last_name";--> statement-breakpoint
ALTER TABLE "applicants" RENAME COLUMN "bachelorUniversity" TO "university";--> statement-breakpoint
ALTER TABLE "applicants" RENAME COLUMN "submittedAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "courseId" TO "id";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "applicationId" TO "course_analysis_id";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "predictedName" TO "predicted_name";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "name" TO "applicant_name";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "correctedName" TO "reviewed_name";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "ects" TO "predicted_credits";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "predictedEcts" TO "applicant_credits";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "correctedEcts" TO "reviewed_credits";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "predictedSubjectArea" TO "predicted_subject_area";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "subjectArea" TO "applicant_subject_area";--> statement-breakpoint
ALTER TABLE "courses" RENAME COLUMN "correctedSubjectArea" TO "reviewed_subject_area";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "admin_users_email_unique";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "predicted_subject_area" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "applicant_subject_area" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "reviewed_subject_area" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."subject_area";--> statement-breakpoint
CREATE TYPE "public"."subject_area" AS ENUM('information_systems', 'business_administration', 'computer_science', 'quantitative_methods');--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "predicted_subject_area" SET DATA TYPE "public"."subject_area" USING "predicted_subject_area"::"public"."subject_area";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "applicant_subject_area" SET DATA TYPE "public"."subject_area" USING "applicant_subject_area"::"public"."subject_area";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "reviewed_subject_area" SET DATA TYPE "public"."subject_area" USING "reviewed_subject_area"::"public"."subject_area";--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "first_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "master_track" "master_track" NOT NULL;--> statement-breakpoint
ALTER TABLE "applicants" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts_roles" ADD CONSTRAINT "accounts_roles_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_roles" ADD CONSTRAINT "accounts_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_analysis" ADD CONSTRAINT "course_analysis_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_analysis" ADD CONSTRAINT "course_analysis_reviewed_by_accounts_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_reviewed_by_accounts_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_skills" ADD CONSTRAINT "personal_skills_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_skills" ADD CONSTRAINT "personal_skills_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_course_analysis_id_course_analysis_id_fk" FOREIGN KEY ("course_analysis_id") REFERENCES "public"."course_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "temporaryPasswordExpiresAt";--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "reviewed";--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "bachelorStudyProgram";--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "regularStudyYears";--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "usingEctsSystem";--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "totalCreditsUponCompletion";--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "worstPossibleGrade";--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "bestPossibleGrade";--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "gradePointAverage";--> statement-breakpoint
ALTER TABLE "applicants" DROP COLUMN "reviewedAt";--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_applicant_number_unique" UNIQUE("applicant_number");