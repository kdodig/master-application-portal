import { pgTable, unique, uuid, text, timestamp, doublePrecision, integer, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const documentStatus = pgEnum("document_status", ['existing', 'missing', 'unclear'])
export const masterTrack = pgEnum("master_track", ['managing_digital_business', 'business_process_management', 'data_science'])
export const reviewStatus = pgEnum("review_status", ['documents', 'course_analysis', 'personal_skills', 'done', 'rejected'])
export const subjectArea = pgEnum("subject_area", ['Computer Science', 'Information Systems', 'Quantitative Methods', 'Business Administration', 'None'])


export const roles = pgTable("roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	key: text().notNull(),
	name: text().notNull(),
	description: text(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("roles_key_unique").on(table.key),
	unique("roles_name_unique").on(table.name),
]);

export const settings = pgTable("settings", {
	applicationPeriodStart: timestamp("application_period_start", { mode: 'string' }).notNull(),
	applicationPeriodEnd: timestamp("application_period_end", { mode: 'string' }).notNull(),
});

export const courses = pgTable("courses", {
	courseId: uuid().defaultRandom().primaryKey().notNull(),
	applicationId: uuid().notNull(),
	name: text().notNull(),
	predictedName: text(),
	correctedName: text(),
	ects: doublePrecision().notNull(),
	predictedEcts: doublePrecision(),
	correctedEcts: doublePrecision(),
	subjectArea: subjectArea().notNull(),
	predictedSubjectArea: subjectArea(),
	correctedSubjectArea: subjectArea(),
	description: text(),
	pageNumber: integer("page_number"),
});

export const accounts = pgTable("accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	passwordTemporary: boolean("password_temporary").notNull(),
	createdBy: uuid("created_by"),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	lastLogin: timestamp("last_login", { mode: 'string' }),
}, (table) => [
	unique("accounts_email_unique").on(table.email),
]);

export const accountsRoles = pgTable("accounts_roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountId: uuid("account_id").notNull(),
	roleId: uuid("role_id").notNull(),
});

export const applicants = pgTable("applicants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantNumber: text("applicant_number").notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	university: text().notNull(),
	country: text(),
	masterTrack: masterTrack("master_track").notNull(),
	reviewStatus: reviewStatus("review_status").default('documents').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("applicants_applicant_number_unique").on(table.applicantNumber),
]);

export const courseAnalysis = pgTable("course_analysis", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	worstPossibleGrade: doublePrecision("worst_possible_grade").notNull(),
	averageGrade: doublePrecision("average_grade").notNull(),
	bestPossibleGrade: doublePrecision("best_possible_grade").notNull(),
	creditsInProgram: doublePrecision("credits_in_program").notNull(),
	yearsInProgram: doublePrecision("years_in_program").notNull(),
	reviewedBy: uuid("reviewed_by"),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
});

export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	curriculumVitae: documentStatus("curriculum_vitae"),
	schoolCertificate: documentStatus("school_certificate"),
	bachelorCertificate: documentStatus("bachelor_certificate"),
	transcriptOfRecords: documentStatus("transcript_of_records"),
	courseDescription: documentStatus("course_description"),
	englishCertificate: documentStatus("english_certificate"),
	standardizedTest: documentStatus("standardized_test"),
	additionalDocuments: documentStatus("additional_documents"),
	reviewedBy: uuid("reviewed_by"),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
});

export const personalSkills = pgTable("personal_skills", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	description: text().notNull(),
	points: doublePrecision().notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
});
