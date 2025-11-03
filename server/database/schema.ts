import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { boolean, doublePrecision, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Enums
 */

export const masterTrackEnum = pgEnum('master_track', [
  'managing_digital_business',
  'business_process_management',
  'data_science',
])

export const reviewStatusEnum = pgEnum('review_status', [
  'documents',
  'course_analysis',
  'personal_skills',
  'done',
  'rejected',
])

export const documentStatusEnum = pgEnum('document_status', [
  'existing',
  'missing',
  'unclear',
])

export const subjectAreaEnum = pgEnum('subject_area', [
  'information_systems',
  'business_administration',
  'computer_science',
  'quantitative_methods',
  'none',
])

/**
 * Tables
 */

// Global settings
export const settings = pgTable('settings', {
  applicationPeriodStart: timestamp('application_period_start').notNull(),
  applicationPeriodEnd: timestamp('application_period_end').notNull(),
})

// Admin accounts and roles
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  passwordTemporary: boolean('password_temporary').notNull(),
  createdBy: uuid('created_by').references((): AnyPgColumn => accounts.id, {
    onDelete: 'set null',
  }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  lastLogin: timestamp('last_login'),
})

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdBy: uuid('created_by').references((): AnyPgColumn => accounts.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const accountsRoles = pgTable('accounts_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id')
    .notNull()
    .references((): AnyPgColumn => accounts.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id')
    .notNull()
    .references((): AnyPgColumn => roles.id, { onDelete: 'cascade' }),
})

// Uploads
export const uploads = pgTable('uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileName: text('file_name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Applicants and their data
export const applicants = pgTable('applicants', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicantNumber: text('applicant_number').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  masterTrack: masterTrackEnum('master_track').notNull(),
  reviewStatus: reviewStatusEnum('review_status').notNull().default('documents'),
  transcriptUploadId: uuid('transcript_upload_id').references(() => uploads.id, {
    onDelete: 'set null',
  }),
  courseDescriptionUploadId: uuid('course_description_upload_id').references(() => uploads.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicantId: uuid('applicant_id').notNull().references(() => applicants.id, {
    onDelete: 'cascade',
  }),
  curriculumVitae: documentStatusEnum('curriculum_vitae'),
  schoolCertificate: documentStatusEnum('school_certificate'),
  bachelorCertificate: documentStatusEnum('bachelor_certificate'),
  transcriptOfRecords: documentStatusEnum('transcript_of_records'),
  courseDescription: documentStatusEnum('course_description'),
  englishCertificate: documentStatusEnum('english_certificate'),
  standardizedTest: documentStatusEnum('standardized_test'),
  additionalDocuments: documentStatusEnum('additional_documents'),
  reviewedBy: uuid('reviewed_by').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  reviewedAt: timestamp('reviewed_at'),
})

export const bachelorDegree = pgTable('bachelor_degree', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicantId: uuid('applicant_id').notNull().references(() => applicants.id, {
    onDelete: 'cascade',
  }),
  university: text('university').notNull(),
  country: text('country').notNull(),
  courseOfStudy: text('course_of_study').notNull(),
  worstPossibleGrade: doublePrecision('worst_possible_grade').notNull(),
  averageGrade: doublePrecision('average_grade').notNull(),
  bestPossibleGrade: doublePrecision('best_possible_grade').notNull(),
  creditsInProgram: doublePrecision('credits_in_program').notNull(),
  yearsInProgram: doublePrecision('years_in_program').notNull(),
  reviewedBy: uuid('reviewed_by').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  bachelorDegreeId: uuid('bachelor_degree_id').notNull().references(() => bachelorDegree.id, {
    onDelete: 'cascade',
  }),
  predictedName: text('predicted_name'),
  applicantName: text('applicant_name').notNull(),
  reviewedName: text('reviewed_name').notNull(),
  predictedCredits: doublePrecision('predicted_credits'),
  applicantCredits: doublePrecision('applicant_credits').notNull(),
  reviewedCredits: doublePrecision('reviewed_credits').notNull(),
  predictedSubjectArea: subjectAreaEnum('predicted_subject_area'),
  applicantSubjectArea: subjectAreaEnum('applicant_subject_area').notNull(),
  reviewedSubjectArea: subjectAreaEnum('reviewed_subject_area').notNull(),
  description: text('description'),
  page: integer('page'),
})

export const personalSkills = pgTable('personal_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicantId: uuid('applicant_id').notNull().references(() => applicants.id, {
    onDelete: 'cascade',
  }),
  description: text('description').notNull(),
  points: doublePrecision('points').notNull(),
  createdBy: uuid('created_by').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull(),
})
