CREATE TYPE "public"."subject_area" AS ENUM('Computer Science', 'Information Systems', 'Quantitative Methods', 'Business Administration', 'None');--> statement-breakpoint
CREATE TABLE "submission" (
	"applicationId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicantNr" integer NOT NULL,
	"reviewed" boolean DEFAULT false,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"bachelorUniversity" text,
	"bachelorStudyProgram" text,
	"regularStudyYears" numeric(4, 2),
	"usingEctsSystem" boolean,
	"totalCreditsUponCompletion" integer,
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"courseId" serial PRIMARY KEY NOT NULL,
	"applicationId" uuid,
	"courseName" text NOT NULL,
	"expectedCourseName" text,
	"ects" numeric(10, 2) NOT NULL,
	"expectedEcts" integer,
	"subjectArea" "subject_area" NOT NULL,
	"expectedSubjectArea" "subject_area"
);
